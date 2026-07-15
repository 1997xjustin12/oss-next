import type { CartLineItem } from '@/types/cart'

// Wire format for /api/orders/checkout — mirrors the snake_case convention
// used by CreateCartPayload (types/cart.ts) since it hits the same backend.
export interface CheckoutPayload {
  cart_id?: string
  items: CartLineItem[]
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
  payment_method?: string
  transaction_id?: string
}

// Confirmed field names via ORDER_HISTORY_ANSWER.md (extracted from a working
// reference implementation's OrdersPage.jsx, 2026-07-14) — not yet verified
// against a real populated order on this app's own backend (this test
// account has zero orders). `price` arrives as a string; parseFloat before
// doing math with it.
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'

export interface OrderListItem {
  product_id: string | number
  quantity: number
  price: string
}

export interface Order {
  order_number: string
  status: OrderStatus
  total_price: string | number
  items: OrderListItem[]
}

// The order/item record only carries product_id/quantity/price — title,
// image, and URL are NOT part of the backend response and must be joined in
// separately via a product lookup (see getProductsByIds in search.service.ts).
export interface EnrichedOrderItem extends OrderListItem {
  title?: string
  image?: string
  handle?: string
}

export interface GetOrderTotalPayload {
  items: CartLineItem[]
  shipping_zip_code?: string
  shipping_country?: string
}

// TODO: confirm the real response shape — placeholder assumed to mirror
// common tax/shipping breakdown fields.
export interface OrderTotal {
  subtotal: number
  shipping: number
  tax: number
  total: number
}
