import { cacheLife, cacheTag } from 'next/cache'
import { Client } from '@elastic/elasticsearch'
import { CACHE_TAGS } from '@/config/cache'
import { DEFAULT_LOCATION, SHIPPING_CONTAINER_CATEGORIES } from '@/lib/constants'
import { formatProduct, getCustomFieldValue, isContainerHit } from '@/lib/pricing'
import type { FormattedContainerHit, ProductDetailResponse, ProductHit, ShippingContainerHit } from '@/types/product'

function cleanEnv(val: string | undefined): string {
  return (val ?? '').split('#')[0].trim().replace(/\/$/, '')
}

const client = new Client({
  node: cleanEnv(process.env.ELASTIC_URL) || 'http://localhost:9200',
  auth: { apiKey: cleanEnv(process.env.ELASTIC_API_KEY) },
  // Bounded on purpose. Without these a single slow Elasticsearch response
  // holds the request open until the platform kills it, which the listing page
  // experiences as a hard failure rather than a slow one. 8s is far longer than
  // a healthy query (tens of milliseconds) and short enough to retry inside a
  // request the visitor is still waiting on.
  requestTimeout: 8_000,
  // One retry covers the common case — a dropped connection or a node briefly
  // rebalancing. More would multiply the worst-case wait.
  maxRetries: 1,
})

const INDEX = cleanEnv(process.env.NEXT_PUBLIC_SEARCH_INDEX) || 'onsite_products_index'

// "Accesories" is intentionally one-s — that is how it is stored in Elasticsearch
const ACCESSORY_CATEGORY_NAMES = ['Accesories', 'Shelving', 'Parts', 'Ramp', 'Security', 'Others']

const FACET_FIELD_MAP: Record<string, string> = {
  'product_category.category_name': 'product_category.category_name.keyword',
  tags: 'tags',
}

export type FacetFilter = string | string[]

export type SearchInput = {
  query:               string
  hitsPerPage:         number
  page:                number
  facets:              string[]
  facetFilters:        FacetFilter[]
  productType:         string | undefined
  locationFilter:      string
  sortParam:           string
  accessoryCategory:   string | undefined
  sizeFilter:          string[]
  conditionFilter:     string[]
  gradeFilter:         string[]
  heightFilter:        string[]
  containerTypeFilter: string[]
  termFilter:          string[]
}

export { DEFAULT_LOCATION }

function buildFilters(facetFilters: FacetFilter[] = []): object[] {
  const clauses: object[] = []
  for (const group of facetFilters) {
    const entries = Array.isArray(group) ? group : [group]
    const terms = entries.map((f) => {
      const sep   = f.indexOf(':')
      const facet = f.substring(0, sep)
      const value = f.substring(sep + 1)
      const field = FACET_FIELD_MAP[facet] ?? `${facet}.keyword`
      return { term: { [field]: value } }
    })
    if (terms.length === 1) {
      clauses.push(terms[0])
    } else {
      clauses.push({ bool: { should: terms, minimum_should_match: 1 } })
    }
  }
  return clauses
}

function buildAggs(facets: string[] = []): Record<string, object> {
  const aggs: Record<string, object> = {}
  for (const f of facets) {
    const field = FACET_FIELD_MAP[f] ?? `${f}.keyword`
    aggs[f] = { terms: { field, size: 50 } }
  }
  return aggs
}

function aggsToFacets(
  aggs: Record<string, { buckets?: { key: string | number; doc_count: number }[] }>,
): Record<string, Record<string, number>> {
  return Object.fromEntries(
    Object.entries(aggs)
      .filter(([, v]) => v?.buckets)
      .map(([name, { buckets = [] }]) => [
        name,
        Object.fromEntries(buckets.map((b) => [String(b.key), b.doc_count])),
      ]),
  )
}

function buildSort(sortParam: string): object[] {
  switch (sortParam) {
    case 'price_asc':  return [{ 'variants.price': { order: 'asc',  mode: 'min' } }]
    case 'price_desc': return [{ 'variants.price': { order: 'desc', mode: 'max' } }]
    // ratings is an object now ({ rating, review_count }) — sorting on the
    // bare field no longer works, the score lives at ratings.rating.
    case 'best_rated': return [{ 'ratings.rating': { order: 'desc' } }]
    case 'name_asc':   return [{ 'title.keyword': { order: 'asc' } }]
    case 'name_desc':  return [{ 'title.keyword': { order: 'desc' } }]
    default:           return []
  }
}

function cfFilter(fieldName: string, values: string[]): object {
  return {
    bool: {
      must: [
        { term:  { 'custom_fields.name.keyword':  fieldName } },
        { terms: { 'custom_fields.value.keyword': values } },
      ],
    },
  }
}

export type CustomFieldFilters = Record<string, string[]>

export type CustomFieldsSearchInput = {
  filters:     CustomFieldFilters
  categories?: string[]
  page:        number
  hitsPerPage: number
}

// Generic custom_fields filtering (any custom_fields.name) + pagination, for
// consumers that don't need the full PLP facet/sort machinery of cachedEsSearch.
export async function cachedCustomFieldsSearch(input: CustomFieldsSearchInput) {
  'use cache'
  cacheLife('minutes')
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.PRODUCTS, CACHE_TAGS.SEARCH)

  const { filters, categories = [], page, hitsPerPage } = input

  const filterClauses = Object.entries(filters)
    .filter(([, values]) => values.length > 0)
    .map(([name, values]) => cfFilter(name, values))

  if (categories.length > 0) {
    filterClauses.push({ terms: { 'product_category.category_name.keyword': categories } })
  }

  const esResponse = await client.search({
    index: INDEX,
    from:  page * hitsPerPage,
    size:  hitsPerPage,
    query: { bool: { filter: filterClauses } },
  })

  const total =
    typeof esResponse.hits.total === 'number'
      ? esResponse.hits.total
      : (esResponse.hits.total?.value ?? 0)

  const hits = esResponse.hits.hits.map((hit) =>
    formatProduct({
      objectID: hit._id ?? '',
      ...(hit._source as Record<string, unknown>),
    }),
  )

  return {
    hits,
    total,
    nbPages: Math.ceil(total / hitsPerPage),
  }
}

// Hard ceiling for "return everything" queries — keeps an unfiltered request
// from trying to dump the entire index in one response.
export const ALL_RESULTS_CAP = 1000

// Quick helper for the common case: every shipping container at a given location.
export async function getShippingContainersByLocation(location: string) {
  const result = await cachedCustomFieldsSearch({
    filters:     { location: [location] },
    categories:  SHIPPING_CONTAINER_CATEGORIES,
    page:        0,
    hitsPerPage: ALL_RESULTS_CAP,
  })
  return result.hits
}

// Single product lookup for the PDP (/product/[slug]). Accessories are
// standalone — returned with no siblings. Shipping containers are one of a
// family of documents (same physical container, different size/condition/
// grade/payment-type) tied together only by sharing a location — so we
// fetch every container at that location as `related_products`, mirroring
// the old WP endpoint's { product, related_products } response shape.
export async function getProductByHandle(handle: string): Promise<ProductDetailResponse | null> {
  'use cache'
  cacheLife('hours')
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.PRODUCTS)

  try {
    const esResponse = await client.search({
      index: INDEX,
      size: 1,
      query: { term: { 'handle.keyword': handle } },
    })

    const hit = esResponse.hits.hits[0]
    if (!hit) return null

    const product = formatProduct({
      objectID: hit._id ?? '',
      ...(hit._source as Record<string, unknown>),
    }) as unknown as ProductHit

    if (!isContainerHit(product)) {
      return { product, related_products: [] }
    }

    const location = getCustomFieldValue(product, 'location')
    const related_products = (await getShippingContainersByLocation(location)) as unknown as ProductHit[]

    return { product, related_products }
  } catch {
    return null
  }
}

// Order/cart records from the OSS backend only carry `product_id` (no
// title/image) — this looks products up by that field (present on our ES
// documents alongside objectID/handle, confirmed via a direct product_id
// match during earlier PLP exploration) so order history can enrich items
// for display without threading full product data through the backend.
export async function getProductsByIds(productIds: (string | number)[]): Promise<ProductHit[]> {
  'use cache'
  cacheLife('hours')
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.PRODUCTS)

  const ids = productIds.map((id) => Number(id)).filter((id) => Number.isFinite(id))
  if (ids.length === 0) return []

  try {
    const esResponse = await client.search({
      index: INDEX,
      size: ids.length,
      query: { terms: { product_id: ids } },
    })

    return esResponse.hits.hits.map((hit) =>
      formatProduct({
        objectID: hit._id ?? '',
        ...(hit._source as Record<string, unknown>),
      }) as unknown as ProductHit
    )
  } catch {
    return []
  }
}

export type ProductHandleEntry = { handle: string; updatedAt?: string }

// Every published product's handle + updated_at, for app/sitemap.ts. Uses
// search_after (sorted on the efficient _doc order) rather than a single
// large `size`, since the real catalog (~10,264 published products,
// confirmed live 2026-07-15) exceeds Elasticsearch's default 10,000-result
// search window — this scans in pages regardless of how large the catalog
// grows.
export async function getAllProductHandles(): Promise<ProductHandleEntry[]> {
  'use cache'
  cacheLife('hours')
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.PRODUCTS)

  const PAGE_SIZE = 1000
  const entries: ProductHandleEntry[] = []
  let searchAfter: (string | number)[] | undefined

  for (;;) {
    const esResponse = await client.search({
      index: INDEX,
      size: PAGE_SIZE,
      query: { term: { status: 'publish' } },
      _source: ['handle', 'updated_at'],
      sort: [{ _doc: { order: 'asc' } }],
      ...(searchAfter ? { search_after: searchAfter } : {}),
    })

    const hits = esResponse.hits.hits
    if (hits.length === 0) break

    for (const hit of hits) {
      const src = hit._source as { handle?: string; updated_at?: string } | undefined
      if (src?.handle) entries.push({ handle: src.handle, updatedAt: src.updated_at })
    }

    if (hits.length < PAGE_SIZE) break
    searchAfter = hits[hits.length - 1].sort as (string | number)[]
  }

  return entries
}

/**
 * Every published product with the fields a product feed needs — same
 * search_after pagination as getAllProductHandles, but full-enough _source to
 * build a Google Merchant item, and run through formatProduct so `sale_price`
 * (rental/RTO monthly rate included) is populated. Heavy (~10k docs); cached.
 */
export async function getAllProductsForFeed(): Promise<FormattedContainerHit[]> {
  'use cache'
  cacheLife('hours')
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.PRODUCTS)

  const PAGE_SIZE = 1000
  const out: FormattedContainerHit[] = []
  let searchAfter: (string | number)[] | undefined

  for (;;) {
    const esResponse = await client.search({
      index: INDEX,
      size: PAGE_SIZE,
      query: { term: { status: 'publish' } },
      _source: ['objectID', 'title', 'handle', 'variants', 'images', 'product_category', 'custom_fields'],
      sort: [{ _doc: { order: 'asc' } }],
      ...(searchAfter ? { search_after: searchAfter } : {}),
    })

    const hits = esResponse.hits.hits
    if (hits.length === 0) break

    for (const hit of hits) {
      if (hit._source) out.push(formatProduct(hit._source as ShippingContainerHit))
    }

    if (hits.length < PAGE_SIZE) break
    searchAfter = hits[hits.length - 1].sort as (string | number)[]
  }

  return out
}

// Each unique combination of inputs gets its own cache entry.
// Busted by revalidateTag(CACHE_TAGS.SEARCH) or revalidateTag(CACHE_TAGS.ALL).
export async function cachedEsSearch(input: SearchInput) {
  'use cache'
  cacheLife('minutes')
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.PRODUCTS, CACHE_TAGS.SEARCH)

  const {
    query, hitsPerPage, page, facets, facetFilters,
    productType, locationFilter, sortParam, accessoryCategory,
    sizeFilter, conditionFilter, gradeFilter, heightFilter, containerTypeFilter, termFilter,
  } = input

  const filters = buildFilters(facetFilters)

  if (productType === 'buy' || productType === 'rental' || productType === 'rto') {
    filters.push(cfFilter('payment_type', [productType]))
  } else if (productType === 'accessories') {
    if (accessoryCategory) {
      filters.push({ term: { 'product_category.category_name.keyword': accessoryCategory } })
    } else {
      filters.push({ terms: { 'product_category.category_name.keyword': ACCESSORY_CATEGORY_NAMES } })
    }
  }

  if (productType !== 'accessories') {
    filters.push(cfFilter('location', [locationFilter]))
    if (sizeFilter.length > 0)          filters.push(cfFilter('length_width',       sizeFilter))
    if (conditionFilter.length > 0)     filters.push(cfFilter('condition',          conditionFilter))
    if (gradeFilter.length > 0)         filters.push(cfFilter('grade',              gradeFilter))
    if (heightFilter.length > 0)        filters.push(cfFilter('height',             heightFilter))
    if (containerTypeFilter.length > 0) filters.push(cfFilter('type_selectiontype', containerTypeFilter))
    // Only rental/rto listings carry a payment_term — applying it to `buy`
    // would filter against a field those documents don't have and zero out
    // results, so it's scoped to the two product types that use it.
    if ((productType === 'rental' || productType === 'rto') && termFilter.length > 0) {
      // ES indexes this custom_fields value as a stringified list literal,
      // e.g. "['12']", not a plain "12" — see calculateProductPrice() in
      // lib/pricing.ts for the same quirk on the read side.
      filters.push(cfFilter('payment_term', termFilter.map((t) => `['${t}']`)))
    }
  }

  const aggs        = buildAggs(facets)
  const sortClauses = buildSort(sortParam)

  const esResponse = await client.search({
    index: INDEX,
    from:  page * hitsPerPage,
    size:  hitsPerPage,
    query: {
      bool: {
        must: query.trim()
          ? [{ multi_match: { query, fields: ['title^3', 'tags', 'variants.sku', 'custom_fields.value', 'product_category.category_name'], fuzziness: 'AUTO' } }]
          : [{ match_all: {} }],
        filter: filters,
      },
    },
    ...(Object.keys(aggs).length > 0 && { aggs }),
    ...(sortClauses.length > 0       && { sort: sortClauses }),
  })

  const total =
    typeof esResponse.hits.total === 'number'
      ? esResponse.hits.total
      : (esResponse.hits.total?.value ?? 0)

  const hits = esResponse.hits.hits.map((hit) =>
    formatProduct({
      objectID: hit._id ?? '',
      ...(hit._source as Record<string, unknown>),
    }),
  )

  const facetsResult = aggsToFacets(
    (esResponse.aggregations ?? {}) as Record<string, { buckets?: { key: string; doc_count: number }[] }>,
  )

  return {
    hits,
    total,
    nbPages:          Math.ceil(total / hitsPerPage),
    processingTimeMS: esResponse.took,
    facetsResult,
  }
}
