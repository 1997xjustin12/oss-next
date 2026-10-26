/** Shapes for the native accessories page (/shipping-container-accessory-products). */

export type AccessoryCategoryKey = 'security' | 'lighting' | 'shelving' | 'ramps' | 'parts' | 'others'

export type AccessoryPriceRangeKey = 'under-50' | '50-100' | '100-250' | '250-up'

export type AccessorySortKey = 'popularity' | 'price-asc' | 'price-desc' | 'newest'

/** One product in the accessories catalogue. */
export type AccessoryListing = {
  id: string
  /** Product page handle; absent while the catalogue is dummy data. */
  handle?: string
  title: string
  category: AccessoryCategoryKey
  price: number
  inStock: boolean
  /** Lower is more popular. */
  popularity: number
  /** ISO date the product was added, for "New arrivals". */
  addedAt: string
  imageUrl?: string
}

/** The listing state, read from and written to the URL. */
export type AccessoryCatalogQuery = {
  categories: AccessoryCategoryKey[]
  price: AccessoryPriceRangeKey | null
  inStockOnly: boolean
  sort: AccessorySortKey
  q: string
  page: number
}
