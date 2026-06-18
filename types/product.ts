export type BadgeTone = 'red' | 'amber' | 'green'

export interface Product {
  id: string
  title: string
  badge: { label: string; tone: BadgeTone }
  rating: number
  reviews: number
  location: string
  price: number
  monthly?: number
  condition: string
  doorType: string
  grade: string
  sku: string
  size?: string
  height?: string
  thumbnailUrl?: string
  galleries: string[]
  productPermalink?: string
  paymentType: string
}

export interface FetchProductsOptions {
  location?: string
  ptype?: string
  sort?: string
  page?: number
}

/** Raw shape returned by the WP REST API — internal to the service layer */
export interface WpApiProduct {
  productID: number
  container_title: string
  tag: string
  condition: string
  grade: string
  size: string
  height: string
  door_type: string
  location: string
  sku: string
  product_price: string
  product_sale_price: string
  monthly_price?: string
  thumbnail_url: string
  galleries: string[]
  product_permalink: string
  payment_type: string
  ratings: string
  review_count: number
}

export interface WpApiResponse {
  products: WpApiProduct[]
  max_pages: number
}
