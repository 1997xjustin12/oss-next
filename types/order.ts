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
  /** The delivery method chosen at checkout, for container orders. */
  shipping_method?: string
  payment_method?: string
  transaction_id?: string
  // The frontend only creates an order after a successful charge, so it always
  // sends 'paid'. Typed to OrderStatus for consistency, though checkout never
  // sends any other value.
  status?: OrderStatus
}

// Confirmed field names via docs/reference/ORDER_HISTORY_ANSWER.md (extracted from a working
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
  /** A `ShippingOption.id`. Accepted by the backend (checked 2026-09-15); only sent for container carts. */
  shipping_method?: string
}

/** One delivery method in a quote, as the backend returns it (seen 2026-09-15). */
export interface ShippingOption {
  /** `tilt_bed`, `flat_bed`, `pickup`, `additional`; `free_shipping` for accessory-only carts. */
  id: string
  /** Includes the distance, e.g. "Tilt Bed (5.75 mi)". */
  label: string
  plain_label: string
  cost: number
  per_truck: number
  trucks: number
  available: boolean
  hidden_reason: string
  tooltip: string
}

/** The `shipping` object in a get-total reply. Only the fields the storefront reads. */
export interface ShippingQuote {
  accessories_only: boolean
  trucks_needed: number
  distance_miles: number | null
  depot: { id: number; title: string; address: string } | null
  options: ShippingOption[]
  can_deliver: boolean
  restriction: string
  need_to_call: boolean
  /** `estimate_only` (live today: delivery billed after the order) or `charge_at_checkout`. */
  charge_mode: string
  selected_method?: string
}

// Confirmed live against the real backend (2026-07-15) with a real ES hit as
// a line item: `{ items }` alone returns sub_total with tax/shipping at 0;
// adding shipping_zip_code + shipping_country computes real tax off that
// location (10.5% for a 90210/US test — not a flat rate). Since 2026-09-15 a
// container cart with a ZIP also returns a delivery quote in `shipping`; in
// `estimate_only` mode that quote is not in total_shipping or total_price.
export interface OrderTotal {
  sub_total: number
  total_tax: number
  total_shipping: number
  total_price: number
  items_count: number
  message: string
  shipping?: ShippingQuote
}

/**
 * Shipment tracking for one order, as our own `/api/auth/orders/tracking` returns it.
 *
 * - `available`: the backend returned tracking. `tracking` is its response passed
 *   through untouched — no order has had a tracking number yet, so the shape is
 *   unconfirmed and deliberately left untyped until a real one is seen.
 * - `none`: the order exists but has no tracking number yet (the normal state for
 *   most orders). `orderStatus` is the backend's status for it.
 * - `not_found`: not one of this customer's orders. Our route answers this without
 *   ever asking the backend, which does not check ownership itself.
 * - `error`: the backend lookup failed.
 */
export type OrderTracking =
  | { state: 'available'; tracking: unknown }
  | { state: 'none'; orderStatus?: string }
  | { state: 'not_found' }
  | { state: 'error' }
