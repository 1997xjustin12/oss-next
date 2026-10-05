import type { RawRatings } from '@/lib/ratings'

/**
 * The Elasticsearch document, as the listing's own components read it.
 *
 * Its own module to break an import cycle: `QuickViewModal` needs this shape
 * and `InstantSearchSection` renders `QuickViewModal`, so defining it in the
 * latter made the two depend on each other. `import type` is erased, so nothing
 * was broken at runtime — but a cycle that is only safe because of how it is
 * imported stops being safe the moment someone needs a value across it, which
 * is exactly how two real bugs got into this app on 2026-09-23.
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
}
