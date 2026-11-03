import type { RawRatings } from '@/lib/ratings'

/**
 * The Elasticsearch document, as the listing's own components read it.
 *
 * Deliberately not `ProductHit` from @/types/product: these components read the
 * raw document, where every field is present and typed, rather than the
 * loosely-typed hit the rest of the app passes around.
 */

export type Variant = {
  price:            string
  compare_at_price: string
  sku:              string
  qty:              number
}

export type ProductImage = {
  src:      string
  alt:      string
  position: number
}

export type ProductCategory = {
  category_name: string
  id:            number
}

export type CustomField = {
  name:     string
  label?:   string
  value:    string
  choices?: string[]
}

export type HitData = {
  objectID:         string
  title:            string
  handle:           string
  product_type:     string
  tags:             string[]
  status:           string
  published:        boolean
  variants:         Variant[]
  images:           ProductImage[]
  product_category: ProductCategory[]
  custom_fields:    CustomField[]
  ratings:          RawRatings
  sale_price:       number
  /** 1-based place in the results, added by InstantSearch. */
  __position?:      number
}
