import type { RawRatings } from '@/lib/ratings'

export type BadgeTone = 'red' | 'amber' | 'green'

export interface Accessory {
  id: string
  title: string
  price: number
  thumbnailUrl?: string
  permalink?: string
  sku: string
  category: string
  badge: { label: string; tone: BadgeTone } | null
  rating: number
  reviews: number
}

/** Loosely-typed Elasticsearch search hit — shared shape between services/search.service.ts and client consumers */
export type ShippingContainerHit = { objectID: string } & Record<string, unknown>

/** A hit after formatProduct() has run — sale_price is guaranteed present */
export type FormattedContainerHit = ShippingContainerHit & { sale_price: number }

export type ProductHitVariant = {
  price: string
  compare_at_price?: string
  sku: string
  qty?: number
}

export type ProductHitImage = {
  src: string
  alt?: string
  position?: number
}

export type ProductHitCategory = {
  category_name: string
  id?: number
}

export type ProductHitCustomField = {
  name: string
  label?: string
  value: string
  choices?: string[]
}

/**
 * SEO fields carried on the Elasticsearch document.
 *
 * Every field is optional, and measured against the live index (10,528
 * documents) they are very unevenly populated:
 *
 *   seo               100%
 *   seo.title         100%
 *   seo.description    19%
 *   seo.focus_keyphrase 19%
 *
 * So `title` is effectively always there while the other two are absent on four
 * products in five. Anything rendering `focus_keyphrase` or `description`
 * directly needs a fallback, or it renders nothing on most product pages —
 * which for a heading or a meta description is worse than not rendering the
 * element at all.
 */
export type ProductHitSeo = {
  title?: string
  description?: string
  focus_keyphrase?: string
}

// Structured view of a formatted ES hit for consumers that need real field
// access (the PDP) rather than the loosely-typed ShippingContainerHit used
// by the search/listing pipeline. Field names mirror the raw ES document.
export interface ProductHit {
  objectID: string
  title: string
  handle: string
  tags: string[]
  variants: ProductHitVariant[]
  images: ProductHitImage[]
  product_category: ProductHitCategory[]
  custom_fields: ProductHitCustomField[]
  // Object since the backend change ({ rating, review_count }); the union keeps
  // documents not yet reindexed valid. Read it via normaliseRating() from
  // lib/ratings.ts rather than touching it directly.
  ratings: RawRatings
  sale_price: number
  /**
   * Backend-authored SEO fields. Nullable as well as optional: a document that
   * has not been reindexed can omit it entirely, and the pipeline does not
   * guarantee it, so callers must reach through it — `product.seo?.title`.
   */
  seo?: ProductHitSeo | null
  /**
   * Human-readable descriptor assembled from the specs in `custom_fields`,
   * e.g. `Used WWT 20ft Shipping Container for Sale`.
   *
   * Derived, not stored: `formatProduct()` injects it, so it is present on any
   * hit that has been through the pipeline. Empty string for accessories,
   * which are not shipping containers. See lib/productTitle.ts.
   */
  desc_title?: string
  /**
   * Location-led descriptor, e.g. `Best Deals on Atlanta Shipping Containers
   * For Sale`. Derived alongside `desc_title`.
   *
   * Empty for accessories and for display-only listings, whose location is the
   * generic `Various North America` placeholder rather than a real depot.
   */
  loc_title?: string
  /**
   * Dimension line assembled from the specs, e.g. `20' L x 8' W x 8'6" H`.
   * Derived alongside `desc_title`.
   *
   * Empty when the length or height is unknown — see lib/productTitle.ts.
   */
  size_title?: string
  // Index signature so a ProductHit satisfies ShippingContainerHit
  // (Record<string, unknown>) when passed into the shared pricing helpers.
  [key: string]: unknown
}

// PDP data-fetch result — mirrors the old WP endpoint's { product,
// related_products } shape. related_products is only populated for
// shipping containers (every other container at the same location);
// accessories are standalone and get an empty array.
export interface ProductDetailResponse {
  product: ProductHit
  related_products: ProductHit[]
}
