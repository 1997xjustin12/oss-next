import type { CartLineItem } from '@/types/cart'

// Wire format for the backend's api/orders/checkout, sent server-side by
// /api/checkout/place-order — mirrors the snake_case convention used by
// CreateCartPayload (types/cart.ts) since it hits the same backend.
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
  /** Order notes, with the chosen door direction leading them. */
  notes?: string
  payment_method?: string
  /**
   * The backend's payment fields. It stores `payment_details` and
   * `payment_status`; the `transaction_id` sent until 2026-09-15 has no field
   * there, so every order was recorded with `payment_details: null` and
   * `payment_status: false`. Set only by the server, after a successful charge.
   */
  payment_status?: boolean
  /** The Braintree transaction id. */
  payment_details?: string
  store_domain?: string
  // An order is only created after a successful charge, so this is always
  // 'paid'. Typed to OrderStatus for consistency.
  status?: OrderStatus
}

/**
 * What checkout sends to /api/checkout/place-order.
 *
 * Nothing here decides payment. The server re-prices from `items`, charges,
 * and records the order with the verified transaction; `expectedAmount` only
 * lets it refuse to charge more than the page showed.
 */
export interface PlaceOrderRequest {
  nonce: string
  recaptchaToken?: string | null
  items: CartLineItem[]
  /** ISO country code and ZIP used to price delivery (the order keeps the form's own values). */
  shipping_zip_code?: string
  shipping_country?: string
  shipping_method?: string
  /**
   * The same address parts checkout priced with, so the re-price that decides
   * the charge asks the question the customer was shown an answer to. The
   * `order` block below carries the address the order is recorded with;
   * these are the pricing copy, exactly as `shipping_zip_code` already is.
   */
  shipping_address_1?: string
  shipping_address_2?: string
  shipping_city?: string
  shipping_state?: string
  expectedAmount?: string
  /** Braintree's copy of the payer, for the transaction record. */
  payer: {
    customer?: Record<string, string | undefined>
    billing?: Record<string, string | undefined>
    shipping?: Record<string, string | undefined>
  }
  /** The order's customer fields, as the backend names them. */
  order: Omit<
    CheckoutPayload,
    'items' | 'status' | 'payment_method' | 'payment_status' | 'payment_details' | 'store_domain' | 'shipping_method'
  >
}

/**
 * The outcome of placing an order. Only `stage: 'order'` with `voided: false`
 * means money moved without an order — the one case the customer must not retry.
 */
export type PlaceOrderResponse =
  | { ok: true; orderNumber?: string; transactionId: string }
  | { ok: false; stage: 'validation' | 'total' | 'charge'; error: string }
  | { ok: false; stage: 'order'; voided: true; error: string }
  | { ok: false; stage: 'order'; voided: false; transactionId: string; error: string }

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
  /**
   * The delivery address in the backend's own field names, sent by every
   * caller that has one — checkout and the order re-price.
   *
   * These are read, not decoration: with `shipping_city` + `shipping_state`
   * and no ZIP at all the backend still quotes, and geocodes to a different
   * distance than the ZIP does (5.15 mi against 5.75 mi for the same Atlanta
   * depot, checked 2026-09-22). Its own refusal names them — "a shipping zip
   * code (or city + state) is required for a delivery quote". Unprefixed
   * `city`/`state` are rejected.
   *
   * They are sent so sales tax can be worked out from the real address.
   * **Today that returns 0 regardless** — see the note above OrderTotal.
   */
  shipping_address_1?: string
  shipping_address_2?: string
  shipping_city?: string
  shipping_state?: string
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
//
// **total_tax is 0 for every address as of 2026-09-22.** Re-checked against the
// live backend with a full street address, city and state supplied, on a
// purchase, a rent-to-own and the 90210 case that once returned 10.5%: all
// zero. So the storefront now sends everything the backend would need, and the
// remaining work is rates being loaded on the backend — not a missing field
// here. Re-run docs/reference when that lands; nothing in this app should need
// to change.
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
