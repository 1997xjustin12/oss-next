import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_TAGS } from '@/config/cache'
import type {
  CheckoutPayload,
  GetOrderTotalPayload,
  GuestOrder,
  GuestOrderItem,
  OrderStatusResult,
  Order,
  OrderTotal,
  OrderTracking,
} from '@/types/order'
import { visitorAuthHeaders } from '@/lib/backendAuth'
import { BackendRefusedError, backendErrorMessage, logBackendRejection, rateLimitedFrom } from '@/lib/backendError'
import { ShippingRefusedError, shippingRefusal } from '@/lib/shippingQuote'

const BACKEND_URL = process.env.NEXT_OSS_BACKEND_URL
const STORE_DOMAIN = process.env.NEXT_PUBLIC_STORE_DOMAIN

const CHECKOUT_URL = `${BACKEND_URL}api/orders/checkout`
const GET_TOTAL_URL = `${BACKEND_URL}api/orders/get-total`
const LIST_ORDERS_URL = `${BACKEND_URL}api/auth/orders`
const ABANDONED_CART_URL = `${BACKEND_URL}api/abandoned-carts/create/`
// One order's status page data, by uuid. Needs the storefront's API key, so
// server-side only. See docs/reference/guest-order-page.md.
const ORDER_STATUS_URL = (orderUuid: string) => `${BACKEND_URL}api/orders/status/${encodeURIComponent(orderUuid)}`
const BACKEND_KEY = process.env.NEXT_OSS_BACKEND_KEY

const TRACKING_URL = (orderNumber: string) =>
  `${BACKEND_URL}orders/tracking/track/${encodeURIComponent(orderNumber)}/`

// TODO: confirm the real response shape against the OSS backend — placeholder
// passed through raw until /api/orders/checkout is integrated.
export async function checkoutOrder(payload: CheckoutPayload, token?: string): Promise<Order> {
  const res = await fetch(CHECKOUT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Store-Domain': STORE_DOMAIN ?? '',
      // Bearer when signed in, otherwise the storefront key and the visitor's
      // address — see lib/backendAuth.ts.
      ...(await visitorAuthHeaders({ token })),
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const limited = rateLimitedFrom(res, data)
    if (limited) throw limited
    // Field-level refusals (`{ items: ["…"] }`) carry none of the keys below, so
    // without this the only record of a refused order — after the card has been
    // charged — was "Could not complete checkout." (seen 2026-09-15).
    logBackendRejection('order.service checkout', res.status, data)
    throw new BackendRefusedError(res.status, backendErrorMessage(data) ?? 'We could not place your order. Please try again.')
  }

  return data as Order
}

/**
 * Price an order.
 *
 * `token` and `ip` decide who the backend counts the call against — see
 * lib/backendAuth.ts. Callers inside a shared cache (getCachedOrderTotal,
 * getDeliveryRates) pass `ip: null`: one cached answer serves every visitor,
 * so there is no one visitor to name, and `headers()` is not available there.
 * Those calls are counted by the storefront key, with this site's own
 * per-visitor limit (lib/pricingGuard) in front of them.
 */
// TODO: confirm the real response shape (tax/shipping breakdown field names).
export async function getOrderTotal(
  payload: GetOrderTotalPayload,
  { token, ip }: { token?: string; ip?: string | null } = {},
): Promise<OrderTotal> {
  const res = await fetch(GET_TOTAL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Store-Domain': STORE_DOMAIN ?? '',
      ...(await visitorAuthHeaders({ token, ip })),
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const limited = rateLimitedFrom(res, data)
    if (limited) throw limited
    logBackendRejection('order.service get-total', res.status, data)
    // "Too far to deliver" and "needs an address" are written for customers and
    // decide what checkout can offer, so they travel with their own message.
    const refusal = shippingRefusal(data)
    if (refusal) throw new ShippingRefusedError(refusal.code, refusal.message)
    throw new BackendRefusedError(res.status, backendErrorMessage(data) ?? 'We could not calculate your order total. Please try again.')
  }

  return data as OrderTotal
}

/** A priced answer the cart and checkout can be shown again: a total, or a "we can't deliver there". */
export type CachedOrderTotal = { status: 200; body: OrderTotal } | { status: 400; body: { error: string; code: string } }

/**
 * `getOrderTotal`, cached for 20 minutes in the platform's shared cache.
 *
 * Each backend pricing call can cost a paid Google Distance Matrix lookup, and
 * one checkout asks the same question many times. This used to be cached in
 * Upstash, which made every re-price one to two Redis round trips carrying the
 * whole quote (depot, five delivery options with their tooltips). `use cache:
 * remote` keeps the same sharing across visitors and instances without
 * touching Redis — the in-memory `use cache` would not, on serverless.
 *
 * A "can't deliver there" refusal is cached too: it holds for the same products
 * and address. Anything else throws, and a thrown error is never cached, so a
 * backend hiccup is retried rather than remembered.
 *
 * Tagged `store` and `pricing`, so the admin Cache screen can drop it. Never
 * used for the charge: /api/checkout/place-order re-prices fresh.
 */
export async function getCachedOrderTotal(payload: GetOrderTotalPayload): Promise<CachedOrderTotal> {
  'use cache: remote'
  cacheLife({ stale: 60, revalidate: 20 * 60, expire: 20 * 60 })
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.PRICING)

  try {
    // ip: null — a shared answer has no single visitor; see getOrderTotal.
    return { status: 200, body: await getOrderTotal(payload, { ip: null }) }
  } catch (err) {
    if (err instanceof ShippingRefusedError) return { status: 400, body: { error: err.message, code: err.code } }
    throw err
  }
}

// No pagination — confirmed via docs/reference/ORDER_HISTORY_ANSWER.md that the reference
// app calls this with no page/limit params and treats the result as a
// complete list. Response wrapper is unconfirmed both there and here (our
// own test account saw `{ orders: [] }`; the reference app assumed a bare
// array) — `data?.orders ?? data ?? []` below handles either shape.
export async function listUserOrders(token: string): Promise<Order[]> {
  const res = await fetch(LIST_ORDERS_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Store-Domain': STORE_DOMAIN ?? '',
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const limited = rateLimitedFrom(res, data)
    if (limited) throw limited
    throw new Error(data?.error ?? data?.detail ?? data?.message ?? 'Could not load orders.')
  }

  return (data?.orders ?? data ?? []) as Order[]
}

/**
 * Shipment tracking for one order, from the backend's `orders/tracking/track/<n>/`.
 *
 * **Only call this for an order already confirmed to belong to the customer.** The
 * backend answers this route without checking login or ownership (reported
 * 2026-09-14), so it is `/api/auth/orders/tracking` that keeps customers to their
 * own orders — see that route. The token is still sent, so nothing changes here
 * once the backend starts requiring it.
 *
 * "No tracking number yet" arrives as a 404 carrying `order_status`. That is the
 * normal state of most orders, so it is returned as `none`, not as a failure.
 * Anything else that is not a success is logged with the backend's own reply and
 * returned as `error` — including the 500 the backend gives for an unknown order.
 */
export async function getOrderTracking(orderNumber: string, token: string): Promise<OrderTracking> {
  let res: Response
  try {
    res = await fetch(TRACKING_URL(orderNumber), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-Store-Domain': STORE_DOMAIN ?? '',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    })
  } catch (err) {
    console.error('[order.service tracking] request failed:', err)
    return { state: 'error' }
  }

  const data = await res.json().catch(() => null)

  if (res.ok) return { state: 'available', tracking: data }
  if (res.status === 404 && data && typeof data === 'object' && 'order_status' in data) {
    return { state: 'none', orderStatus: String((data as { order_status: unknown }).order_status) }
  }

  logBackendRejection('order.service tracking', res.status, data)
  return { state: 'error' }
}

/**
 * An order uuid as the backend issues them (8-4-4-4-12 hex). Anything else is
 * refused here, without a backend round trip, so the page cannot be used to
 * fire arbitrary strings at the backend.
 */
const ORDER_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isOrderUuid(value: string): boolean {
  return ORDER_UUID.test(value)
}

type Raw = Record<string, unknown>

const asRecord = (value: unknown): Raw => (value && typeof value === 'object' && !Array.isArray(value) ? (value as Raw) : {})
const firstString = (...values: unknown[]) =>
  values.find((v): v is string => typeof v === 'string' && v.trim() !== '')?.trim()
const firstAmount = (...values: unknown[]) =>
  values.find((v): v is string | number => (typeof v === 'string' && v.trim() !== '') || typeof v === 'number')

/**
 * The status response, in the shape the order card reads.
 *
 * Field names checked against a live reply on 2026-10-16: the order sits under
 * `data`, with `order_date`, `ship_to`, `shipping_carrier_display`,
 * `estimated_delivery_start`/`_end` and `payment_link`, and items carrying
 * their own `title`, `handle` and `image`. The real name is tried first in
 * each list; the alternatives after it are kept in case the reply changes.
 * Anything not found is left out and the card skips it.
 */
function toOrder(data: unknown): GuestOrder | null {
  // This endpoint wraps its replies — a miss is `{"success": false, "message":
  // "Order not found"}` — so the order may sit under `data` or `order`.
  const root = asRecord(data)
  const o = [root.data, root.order].map(asRecord).find((r) => Object.keys(r).length > 0) ?? root
  const totals = asRecord(o.totals)
  const payment = asRecord(o.payment)
  const tracking = asRecord(o.tracking)
  // The live reply calls this `ship_to` (city, province, country — no street).
  const shipping = Object.keys(asRecord(o.ship_to)).length ? asRecord(o.ship_to) : asRecord(o.shipping)

  const orderNumber = firstString(o.order_number, o.number, o.reference_number)
  const status = firstString(o.status, o.order_status)?.toLowerCase()
  const rawItems = Array.isArray(o.items) ? o.items : Array.isArray(o.line_items) ? o.line_items : null
  const total = firstAmount(o.total_price, totals.total_price, totals.total, o.total)
  if (!orderNumber || !status || !rawItems || total === undefined) return null

  const items: GuestOrderItem[] = rawItems.map((raw) => {
    const item = asRecord(raw)
    const product = asRecord(item.product)
    const images = Array.isArray(item.images) ? item.images : Array.isArray(product.images) ? product.images : []
    return {
      product_id: (firstString(item.product_id, product.product_id) ?? (item.product_id as number) ?? '') as string | number,
      quantity: Number(item.quantity) || 0,
      price: String(firstAmount(item.price, item.unit_price, product.sale_price) ?? ''),
      title: firstString(item.title, item.product_title, item.name, product.title),
      image: firstString(item.image, item.image_url, asRecord(images[0]).src),
      handle: firstString(item.handle, product.handle),
    }
  })

  return {
    order_number: orderNumber,
    status: status as GuestOrder['status'],
    created_at: firstString(o.order_date, o.created_at, o.date_created, o.placed_at),
    items,
    sub_total: firstAmount(o.sub_total, totals.sub_total, totals.subtotal),
    total_shipping: firstAmount(o.total_shipping, totals.total_shipping, totals.shipping),
    total_tax: firstAmount(o.total_tax, totals.total_tax, totals.tax),
    total_price: total,
    // Not `shipping_method`: the live reply sends an internal code there
    // ("additional"), not something to show a customer.
    shipping_city: firstString(o.shipping_city, shipping.city),
    shipping_province: firstString(o.shipping_province, o.shipping_state, shipping.province, shipping.state),
    shipping_zip_code: firstString(o.shipping_zip_code, shipping.zip_code, shipping.zip),
    // The live reply gives a window; the card shows one date, so the later end
    // of it — the promise, rather than the hope.
    estimated_delivery: firstString(
      o.estimated_delivery_end,
      o.estimated_delivery_start,
      o.estimated_delivery,
      o.estimated_delivery_date,
      tracking.estimated_delivery,
    ),
    delivered_at: firstString(o.delivered_at, tracking.delivered_at),
    tracking_carrier: firstString(o.shipping_carrier_display, o.shipping_carrier, o.tracking_carrier, o.carrier, tracking.carrier),
    tracking_number: firstString(o.tracking_number, tracking.tracking_number, tracking.number),
    tracking_url: firstString(o.tracking_url, tracking.tracking_url, tracking.url),
    payment_url: firstString(o.payment_url, o.payment_link, payment.url, payment.link, payment.payment_url, payment.payment_link),
  }
}

/** Logged once per server instance, so the real field names can be read off a live order. */
let loggedShape = false

/**
 * One order's status page data, from GET api/orders/status/{order_uuid}.
 *
 * Authenticated with the storefront's API key, which never leaves the server;
 * the uuid is the customer's half, and cannot be guessed.
 *
 * **Never cache this.** It is one customer's order, and the backend refreshes
 * an expired payment link on read (an unpaid card or bank order gets a new one
 * when this is called), so a cached copy could hand out a dead link.
 *
 * 404 and 400 mean "no such order" → `not_found`. 401/403 mean our key is
 * missing or refused, which is a configuration problem, not the customer's —
 * logged loudly and shown as `error`.
 */
export async function getOrderStatus(orderUuid: string): Promise<OrderStatusResult> {
  if (!isOrderUuid(orderUuid)) return { state: 'not_found' }
  if (!BACKEND_KEY) {
    console.error('[order.service order-status] NEXT_OSS_BACKEND_KEY is not set; cannot load order status')
    return { state: 'error' }
  }

  let res: Response
  try {
    res = await fetch(ORDER_STATUS_URL(orderUuid.toLowerCase()), {
      headers: {
        Accept: 'application/json',
        'X-Store-Domain': STORE_DOMAIN ?? '',
        // The storefront key plus the visitor's address, so lookups are counted
        // per visitor — see lib/backendAuth.ts.
        ...(await visitorAuthHeaders()),
      },
      cache: 'no-store',
    })
  } catch (err) {
    console.error('[order.service order-status] request failed:', err)
    return { state: 'error' }
  }

  const data = await res.json().catch(() => null)

  if (res.ok) {
    if (!loggedShape) {
      loggedShape = true
      // Keys only: the body is a customer's order and does not belong in logs.
      console.info('[order.service order-status] response keys:', Object.keys(asRecord(data)).join(','))
    }
    const order = toOrder(data)
    if (order) return { state: 'ok', order }
    console.error('[order.service order-status] unexpected response shape, keys:', Object.keys(asRecord(data)).join(','))
    return { state: 'error' }
  }

  if (res.status === 404 || res.status === 400) return { state: 'not_found' }

  // Not logBackendRejection: a refusal body could echo order data. Status and
  // the backend's `detail` only.
  console.error('[order.service order-status] backend refused:', res.status, asRecord(data).detail ?? asRecord(data).message ?? '')
  return { state: 'error' }
}

// Also called via navigator.sendBeacon on tab close for guests, so callers
// on that path shouldn't expect a meaningful response. TODO: confirm the
// real request/response contract.
//
// Mirrors the reference app's dedupe behavior: a `DUPLICATE_CART_ID` response
// means the backend already knows about this cart — not a failure, just a
// no-op notify. Callers still proceed to sync the Redis flag either way.
export async function createAbandonedCart(payload: unknown, token?: string): Promise<{ notified: boolean }> {
  const res = await fetch(ABANDONED_CART_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Store-Domain': STORE_DOMAIN ?? '',
      ...(await visitorAuthHeaders({ token })),
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => null)
  const limited = rateLimitedFrom(res, data)
  if (limited) throw limited

  if (!res.ok && data?.code !== 'DUPLICATE_CART_ID') {
    throw new Error(data?.error ?? data?.detail ?? 'Could not record abandoned cart.')
  }

  return { notified: res.ok }
}
