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
  thumbnail_url: string
  gallery: string[]
  product_gallery_ids: number[]
  product_gallery_html: string
  product_permalink: string
  payment_type: string
  payment_term: string[]
  stock: number
  is_virtual_depo: boolean
  relocation_fee: number
  ratings: string
  review_count: number
  currency: string
  yoast_focus_phrase: string
  yoast_focus_phrase_h1: string
  yoast_focus_phrase_h2: string
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
