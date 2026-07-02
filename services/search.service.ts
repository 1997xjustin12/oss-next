import { cacheLife, cacheTag } from 'next/cache'
import { Client } from '@elastic/elasticsearch'
import { CACHE_TAGS } from '@/config/cache'
import { DEFAULT_LOCATION, SHIPPING_CONTAINER_CATEGORIES } from '@/lib/constants'
import { formatProduct } from '@/lib/pricing'

function cleanEnv(val: string | undefined): string {
  return (val ?? '').split('#')[0].trim().replace(/\/$/, '')
}

const client = new Client({
  node: cleanEnv(process.env.ELASTIC_URL) || 'http://localhost:9200',
  auth: { apiKey: cleanEnv(process.env.ELASTIC_API_KEY) },
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
    case 'best_rated': return [{ ratings: { order: 'desc' } }]
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

// Each unique combination of inputs gets its own cache entry.
// Busted by revalidateTag(CACHE_TAGS.SEARCH) or revalidateTag(CACHE_TAGS.ALL).
export async function cachedEsSearch(input: SearchInput) {
  'use cache'
  cacheLife('minutes')
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.PRODUCTS, CACHE_TAGS.SEARCH)

  const {
    query, hitsPerPage, page, facets, facetFilters,
    productType, locationFilter, sortParam, accessoryCategory,
    sizeFilter, conditionFilter, gradeFilter, heightFilter, containerTypeFilter,
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
