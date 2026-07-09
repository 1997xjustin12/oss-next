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
  ratings: number | null
  sale_price: number
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
