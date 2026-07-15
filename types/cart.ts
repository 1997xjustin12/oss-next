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
  // Shipping containers from different locations can't be combined into one
  // order — set on container line items so the cart can detect the conflict.
  isContainer?: boolean
  location?: string
  // The raw ES hit this item was added from — needed to build the backend's
  // CartLineItem shape (full hit + quantity) when syncing to /api/cart/*.
  // Optional because carts saved to localStorage before this field existed
  // won't have it; those items are simply skipped from backend sync until
  // removed and re-added.
  rawHit?: ShippingContainerHit
}

export interface Cart {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  // Backend cart identity — only ever set for logged-in users (/api/cart/*
  // is logged-in only); undefined for guests.
  cartId?: string
  referenceNumber?: string
  // ISO timestamp of the last real cart mutation (add/remove/qty change) —
  // drives the abandoned-cart inactivity timeout comparison.
  updatedAt?: string
  // ISO timestamp Redis flagged this cart abandoned at, or null once clear.
  // Undefined until the first active-cart fetch resolves.
  isAbandoned?: string | null
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
