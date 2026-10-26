import { ROUTES } from '@/config/routes'
import type { IndexUiState } from 'instantsearch.js'
import type { AccessoryCardData } from '@/types/accessoryCatalog'

/**
 * Configuration and pure helpers for the accessories page's InstantSearch
 * (/shipping-container-accessory-products). The widgets live in the route's
 * _components; everything here is plain data and functions, so it is shared
 * with the server (category tiles, structured data) and unit-tested.
 *
 * The page's URL is the search state, so a filtered view can be shared and the
 * category tiles can link straight to one:
 *
 *   ?category=Security,Ramp  ?price=50-100  ?stock=in
 *   ?sort=price-asc  ?q=lock  ?page=2
 */

/** InstantSearch index name for the page. The real index is fixed server-side. */
export const ACCESSORY_INDEX = 'accessories'

/** The results section's anchor; the category tiles land on it. */
export const ACCESSORY_RESULTS_ID = 'products'

export const ACCESSORY_HITS_PER_PAGE = 12

export const CATEGORY_ATTRIBUTE = 'product_category.category_name'
export const PRICE_ATTRIBUTE = 'variants.price'
/** Stock lives on variants[].qty; "in stock" is a quantity of at least 1. */
export const STOCK_ATTRIBUTE = 'variants.qty'

/**
 * The category filter, in the order the page shows it. Values are the
 * Elasticsearch category names exactly as stored.
 *
 * "Accessories" is not an option: it is the page's default scope (the server
 * lists every accessory category for productType "accessories"), and nearly
 * every product carries it, so ticking it would change nothing.
 */
export const ACCESSORY_FILTER_CATEGORIES = ['Lighting', 'Others', 'Shelving', 'Parts', 'Security', 'Ramp'] as const

/** Price ranges; `end` is inclusive (NumericMenu uses <=), so a range ends where the next starts. */
export const ACCESSORY_PRICE_RANGES: readonly { key: string; label: string; start: number; end?: number }[] = [
  { key: '1-50', label: '$1 – $50', start: 1, end: 50 },
  { key: '50-100', label: '$50 – $100', start: 50, end: 100 },
  { key: '100-250', label: '$100 – $250', start: 100, end: 250 },
  { key: '250-up', label: '$250 & up', start: 250 },
]

export const ACCESSORY_SORTS = [
  { key: 'popularity', label: 'Popularity', index: ACCESSORY_INDEX, sortParam: 'default' },
  { key: 'price-asc', label: 'Price: Low to High', index: `${ACCESSORY_INDEX}_price_asc`, sortParam: 'price_asc' },
  { key: 'price-desc', label: 'Price: High to Low', index: `${ACCESSORY_INDEX}_price_desc`, sortParam: 'price_desc' },
  { key: 'newest', label: 'New Arrivals', index: `${ACCESSORY_INDEX}_newest`, sortParam: 'newest' },
] as const

/** The server sort for an InstantSearch index name (each sort is its own "index"). */
export function sortParamForIndex(indexName: string): string {
  return ACCESSORY_SORTS.find((s) => s.index === indexName)?.sortParam ?? 'default'
}

/** NumericMenu stores its refinement as "start:end" ("250:" when open-ended). */
const rangeValue = (r: { start: number; end?: number }) => `${r.start}:${r.end ?? ''}`
const IN_STOCK_VALUE = '1:'

type Params = URLSearchParams | Record<string, string | string[] | undefined>

function read(params: Params, key: string): string {
  if (params instanceof URLSearchParams) return params.get(key) ?? ''
  const v = params[key]
  return (Array.isArray(v) ? v[0] : v) ?? ''
}

/** URL search params → InstantSearch UI state. Unknown values are dropped. */
export function uiStateFromParams(params: Params): IndexUiState {
  const state: IndexUiState = {}

  const q = read(params, 'q').trim().slice(0, 80)
  if (q) state.query = q

  const known = new Set<string>(ACCESSORY_FILTER_CATEGORIES)
  const categories = [...new Set(read(params, 'category').split(',').map((c) => c.trim()))].filter((c) => known.has(c))
  if (categories.length) state.refinementList = { [CATEGORY_ATTRIBUTE]: categories }

  const numericMenu: Record<string, string> = {}
  const price = ACCESSORY_PRICE_RANGES.find((r) => r.key === read(params, 'price'))
  if (price) numericMenu[PRICE_ATTRIBUTE] = rangeValue(price)
  if (read(params, 'stock') === 'in') numericMenu[STOCK_ATTRIBUTE] = IN_STOCK_VALUE
  if (Object.keys(numericMenu).length) state.numericMenu = numericMenu

  const sort = ACCESSORY_SORTS.find((s) => s.key === read(params, 'sort'))
  if (sort && sort.index !== ACCESSORY_INDEX) state.sortBy = sort.index

  const page = Number.parseInt(read(params, 'page'), 10)
  if (Number.isFinite(page) && page > 1) state.page = page

  return state
}

/** InstantSearch UI state → the page's query string ("" when nothing is set). */
export function paramsFromUiState(state: IndexUiState): string {
  const sp = new URLSearchParams()
  const categories = state.refinementList?.[CATEGORY_ATTRIBUTE] ?? []
  if (categories.length) sp.set('category', categories.join(','))
  const price = ACCESSORY_PRICE_RANGES.find((r) => rangeValue(r) === state.numericMenu?.[PRICE_ATTRIBUTE])
  if (price) sp.set('price', price.key)
  if (state.numericMenu?.[STOCK_ATTRIBUTE] === IN_STOCK_VALUE) sp.set('stock', 'in')
  const sort = ACCESSORY_SORTS.find((s) => s.index === state.sortBy)
  if (sort && sort.key !== 'popularity') sp.set('sort', sort.key)
  if (state.query) sp.set('q', state.query)
  if (state.page && state.page > 1) sp.set('page', String(state.page))
  const search = sp.toString()
  return search ? `?${search}` : ''
}

/** A link to the page filtered to one category, landing on the results. */
export function accessoryCategoryHref(category: (typeof ACCESSORY_FILTER_CATEGORIES)[number]): string {
  return `${ROUTES.ACCESSORY_PRODUCTS}${paramsFromUiState({ refinementList: { [CATEGORY_ATTRIBUTE]: [category] } })}#${ACCESSORY_RESULTS_ID}`
}

type RawHit = {
  objectID?: string
  title?: string
  handle?: string
  sale_price?: number | string
  images?: { src?: string; alt?: string }[]
  variants?: { qty?: number | string | null }[]
  product_category?: { category_name?: string }[]
}

/** A search hit → what a product card shows. */
export function hitToAccessoryCard(hit: RawHit): AccessoryCardData {
  const names = (hit.product_category ?? []).map((c) => c.category_name ?? '')
  // The specific category reads better than the umbrella "Accessories" most carry.
  const category =
    ACCESSORY_FILTER_CATEGORIES.find((c) => names.includes(c)) ?? (names.includes('Accessories') ? 'Accessories' : '')
  const qty = Number(hit.variants?.[0]?.qty)
  const image = hit.images?.[0]

  return {
    id: hit.objectID ?? hit.handle ?? '',
    handle: hit.handle ?? '',
    title: hit.title ?? '',
    price: Number(hit.sale_price) || 0,
    imageUrl: image?.src || undefined,
    imageAlt: image?.alt || hit.title || '',
    inStock: Number.isFinite(qty) && qty > 0,
    category,
  }
}
