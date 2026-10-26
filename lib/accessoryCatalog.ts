import { ROUTES } from '@/config/routes'
import type {
  AccessoryCatalogQuery,
  AccessoryCategoryKey,
  AccessoryListing,
  AccessoryPriceRangeKey,
  AccessorySortKey,
} from '@/types/accessoryCatalog'

/**
 * Filtering, sorting and paging for the accessories page, all driven by the
 * URL. Pure functions: the page reads `searchParams`, parses them here and
 * renders the result on the server, so every filter is a plain link (works
 * without JavaScript, is crawlable, and back/forward just work).
 *
 *   ?category=security,lighting  ?price=50-100  ?stock=in
 *   ?sort=price-asc  ?q=lock  ?page=2
 */

export const ACCESSORY_CATEGORIES: readonly { key: AccessoryCategoryKey; label: string }[] = [
  { key: 'security', label: 'Security' },
  { key: 'lighting', label: 'Lighting' },
  { key: 'shelving', label: 'Shelving' },
  { key: 'ramps', label: 'Access & Loading' },
  { key: 'parts', label: 'Parts & Replacements' },
  { key: 'others', label: 'Others' },
]

export const ACCESSORY_PRICE_RANGES: readonly {
  key: AccessoryPriceRangeKey
  label: string
  min: number
  max: number
}[] = [
  { key: 'under-50', label: 'Under $50', min: 0, max: 50 },
  { key: '50-100', label: '$50 – $100', min: 50, max: 100 },
  { key: '100-250', label: '$100 – $250', min: 100, max: 250 },
  { key: '250-up', label: '$250 & up', min: 250, max: Infinity },
]

export const ACCESSORY_SORTS: readonly { key: AccessorySortKey; label: string }[] = [
  { key: 'popularity', label: 'Popularity' },
  { key: 'price-asc', label: 'Price: Low to High' },
  { key: 'price-desc', label: 'Price: High to Low' },
  { key: 'newest', label: 'New Arrivals' },
]

export const ACCESSORY_PAGE_SIZE = 12

/** Anchor of the results section; filter links land there. */
export const ACCESSORY_RESULTS_ID = 'products'

type RawParams = Record<string, string | string[] | undefined>

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ''
const isKey = <K extends string>(list: readonly { key: K }[], v: string): v is K => list.some((o) => o.key === v)

/** URL search params → a valid query. Unknown values are dropped, never trusted. */
export function parseAccessoryQuery(params: RawParams): AccessoryCatalogQuery {
  const categories = first(params.category)
    .split(',')
    .map((c) => c.trim())
    .filter((c): c is AccessoryCategoryKey => isKey(ACCESSORY_CATEGORIES, c))
  const price = first(params.price)
  const sort = first(params.sort)
  const page = Number.parseInt(first(params.page), 10)

  return {
    categories: [...new Set(categories)],
    price: isKey(ACCESSORY_PRICE_RANGES, price) ? price : null,
    inStockOnly: first(params.stock) === 'in',
    sort: isKey(ACCESSORY_SORTS, sort) ? sort : 'popularity',
    q: first(params.q).trim().slice(0, 80),
    page: Number.isFinite(page) && page > 0 ? page : 1,
  }
}

/** The page URL for a query, with defaults left out so URLs stay short. */
export function accessoryHref(query: AccessoryCatalogQuery, withAnchor = true): string {
  const sp = new URLSearchParams()
  if (query.categories.length) sp.set('category', query.categories.join(','))
  if (query.price) sp.set('price', query.price)
  if (query.inStockOnly) sp.set('stock', 'in')
  if (query.sort !== 'popularity') sp.set('sort', query.sort)
  if (query.q) sp.set('q', query.q)
  if (query.page > 1) sp.set('page', String(query.page))
  const search = sp.toString()
  return `${ROUTES.ACCESSORY_PRODUCTS}${search ? `?${search}` : ''}${withAnchor ? `#${ACCESSORY_RESULTS_ID}` : ''}`
}

/**
 * The query as hidden form fields, so the search and sort forms (plain GET
 * forms) keep the other active filters. `omit` is the field the form itself
 * sets. The page is dropped: a new search or sort starts at page 1.
 */
export function accessoryHiddenFields(
  query: AccessoryCatalogQuery,
  omit: 'q' | 'sort',
): Record<string, string> {
  const fields: Record<string, string> = {}
  if (query.categories.length) fields.category = query.categories.join(',')
  if (query.price) fields.price = query.price
  if (query.inStockOnly) fields.stock = 'in'
  if (omit !== 'sort' && query.sort !== 'popularity') fields.sort = query.sort
  if (omit !== 'q' && query.q) fields.q = query.q
  return fields
}

/** Whether any filter or search narrows the list. */
export function hasActiveFilters(query: AccessoryCatalogQuery): boolean {
  return query.categories.length > 0 || query.price !== null || query.inStockOnly || query.q !== ''
}

/** A changed query: any change other than the page itself goes back to page 1. */
export function withQuery(query: AccessoryCatalogQuery, patch: Partial<AccessoryCatalogQuery>): AccessoryCatalogQuery {
  return { ...query, page: 1, ...patch }
}

/** Toggle one category in or out of the filter. */
export function toggleCategory(query: AccessoryCatalogQuery, key: AccessoryCategoryKey): AccessoryCatalogQuery {
  const categories = query.categories.includes(key)
    ? query.categories.filter((c) => c !== key)
    : [...query.categories, key]
  return withQuery(query, { categories })
}

function matches(item: AccessoryListing, query: AccessoryCatalogQuery, ignore?: 'category' | 'price'): boolean {
  if (ignore !== 'category' && query.categories.length && !query.categories.includes(item.category)) return false
  if (ignore !== 'price' && query.price) {
    const range = ACCESSORY_PRICE_RANGES.find((r) => r.key === query.price)!
    if (item.price < range.min || item.price >= range.max) return false
  }
  if (query.inStockOnly && !item.inStock) return false
  if (query.q && !item.title.toLowerCase().includes(query.q.toLowerCase())) return false
  return true
}

const SORTERS: Record<AccessorySortKey, (a: AccessoryListing, b: AccessoryListing) => number> = {
  popularity: (a, b) => a.popularity - b.popularity,
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  newest: (a, b) => b.addedAt.localeCompare(a.addedAt),
}

export type AccessoryResults = {
  items: AccessoryListing[]
  total: number
  page: number
  pageCount: number
  /** How many items each option would show, given the other active filters. */
  counts: {
    category: Record<AccessoryCategoryKey, number>
    price: Record<AccessoryPriceRangeKey, number>
  }
}

export function applyAccessoryQuery(all: AccessoryListing[], query: AccessoryCatalogQuery): AccessoryResults {
  const filtered = all.filter((item) => matches(item, query)).sort(SORTERS[query.sort])
  const pageCount = Math.max(1, Math.ceil(filtered.length / ACCESSORY_PAGE_SIZE))
  const page = Math.min(query.page, pageCount)

  const category = Object.fromEntries(ACCESSORY_CATEGORIES.map((c) => [c.key, 0])) as Record<AccessoryCategoryKey, number>
  for (const item of all) if (matches(item, query, 'category')) category[item.category]++

  const price = Object.fromEntries(ACCESSORY_PRICE_RANGES.map((r) => [r.key, 0])) as Record<AccessoryPriceRangeKey, number>
  for (const item of all) {
    if (!matches(item, query, 'price')) continue
    const range = ACCESSORY_PRICE_RANGES.find((r) => item.price >= r.min && item.price < r.max)
    if (range) price[range.key]++
  }

  return {
    items: filtered.slice((page - 1) * ACCESSORY_PAGE_SIZE, page * ACCESSORY_PAGE_SIZE),
    total: filtered.length,
    page,
    pageCount,
    counts: { category, price },
  }
}
