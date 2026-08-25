import type { RawRatings } from '@/lib/ratings'

export type BadgeTone = 'red' | 'amber' | 'green'

export interface Product {
  id: string
  title: string
  badge: { label: string; tone: BadgeTone }
  rating: number
  reviews: number
  location: string
  price: number
  condition: string
  grade: string
  sku: string
  size?: string
  height?: string
  thumbnailUrl?: string
  gallery: string[]
  productPermalink?: string
  paymentType: string
  monthly: number | null
  rtoOffer?: { price: string; url: string } | null
  stock: number
  isVirtualDepo: boolean
}

export interface FetchProductsOptions {
  location?: string
  ptype?: string
  sort?: string
  page?: number
  length_width?: string
  condition?: string
  grade?: string
  height?: string
}

/** Raw shape returned by both WP REST API endpoints */
export interface WpApiProduct {
  productID: number
  container_title: string
  tag: string
  condition: string
  grade: string
  size: string
  height: string
  selection_option: string
  location: string
  depot_zipcode: string
  region: string
  sku: string
  product_price: string
  sale_price?: string
  thumbnail_url: string
  gallery: string[]
  product_gallery_ids: number[]
  product_gallery_html: string
  product_permalink: string
  payment_type: string
  payment_term: string[]
  categories: string[]
  monthly_price: string | null
  rto_offer: { price: string; url: string } | null
  stock: number
  is_virtual_depo: boolean
  relocation_fee: number
  ratings: string
  review_count: number
  currency: string
  yoast_focus_phrase: string
  yoast_focus_phrase_h1: string
  yoast_focus_phrase_h2: string
  description?: string
  short_description?: string
}

export interface WpApiResponse {
  products: WpApiProduct[]
  raw_products?: WpApiProduct[]
  max_pages: number
}

/** Response wrapper from /wp-json/custom/v1/product?slug= */
export interface WpSingleProductResponse {
  product: WpApiProduct
  related_products: WpApiProduct[]
}

/** The unwrapped single product — same shape as list products */
export type WpSingleProduct = WpApiProduct

/** Raw shape returned by /wp-json/custom/v1/accessories */
export interface WpAccessoryProduct {
  productID: number
  product_name: string
  product_price: string
  sale_price?: string
  product_permalink: string
  thumbnail_url: string
  sku: string
  location?: string
  condition?: string
  payment_type?: string
  ratings?: string
  review_count?: number
}

export interface WpAccessoriesResponse {
  products: WpAccessoryProduct[]
  max_pages: number
}

export interface Accessory {
  id: string
  title: string
  price: number
  thumbnailUrl?: string
  permalink?: string
  sku: string
  category: string
  badge: { label: string; tone: BadgeTone }
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
