import type { ShippingContainerHit } from '@/types/product'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  originalPrice?: number
  sku?: string
  size?: string
  condition?: string
  orderType?: string
  shipNote?: string
  image?: string
}

export interface Cart {
  items: CartItem[]
  totalItems: number
  totalPrice: number
}

// A cart line item as sent to the backend — the raw, unformatted
// Elasticsearch hit (ShippingContainerHit) plus quantity. `formatProduct()`
// (lib/pricing.ts) is a display-only transform for the frontend (computes
// `sale_price` for rendering); the cart always carries the untouched hit so
// the backend gets the same canonical product data it indexed.
export type CartLineItem = ShippingContainerHit & { quantity: number }

// Wire format for the OSS backend's /api/cart/create — field names are
// snake_case because that's the literal API contract, not a JS convention.
export interface CreateCartPayload {
  billing_address: string
  billing_city: string
  billing_country: string
  billing_email: string
  billing_first_name: string
  billing_last_name: string
  billing_phone: string
  billing_province: string
  billing_zip_code: string
  shipping_address: string
  shipping_city: string
  shipping_country: string
  shipping_email: string
  shipping_first_name: string
  shipping_last_name: string
  shipping_phone: string
  shipping_province: string
  shipping_zip_code: string
  items: CartLineItem[]
}
