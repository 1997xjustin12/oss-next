import type {
  CheckoutPayload,
  GetOrderTotalPayload,
  GuestOrder,
  GuestOrdersResult,
  Order,
  OrderTotal,
  OrderTracking,
} from '@/types/order'
import { logBackendRejection } from '@/lib/backendError'
import { ShippingRefusedError, shippingRefusal } from '@/lib/shippingQuote'

const BACKEND_URL = process.env.NEXT_OSS_BACKEND_URL
const STORE_DOMAIN = process.env.NEXT_PUBLIC_STORE_DOMAIN

const CHECKOUT_URL = `${BACKEND_URL}api/orders/checkout`
const GET_TOTAL_URL = `${BACKEND_URL}api/orders/get-total`
const LIST_ORDERS_URL = `${BACKEND_URL}api/auth/orders`
const ABANDONED_CART_URL = `${BACKEND_URL}api/abandoned-carts/create/`
// PROVISIONAL — the backend has no guest-orders endpoint yet (2026-10-15).
// See docs/reference/guest-order-page.md for the contract this assumes.
const GUEST_ORDERS_URL = `${BACKEND_URL}api/orders/guest-orders`

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
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    // Field-level refusals (`{ items: ["…"] }`) carry none of the keys below, so
    // without this the only record of a refused order — after the card has been
    // charged — was "Could not complete checkout." (seen 2026-09-15).
    logBackendRejection('order.service checkout', res.status, data)
    throw new Error(data?.error ?? data?.detail ?? data?.message ?? 'Could not complete checkout.')
  }

  return data as Order
}

// TODO: confirm the real response shape (tax/shipping breakdown field names).
export async function getOrderTotal(payload: GetOrderTotalPayload): Promise<OrderTotal> {
  const res = await fetch(GET_TOTAL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Store-Domain': STORE_DOMAIN ?? '',
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    logBackendRejection('order.service get-total', res.status, data)
    // "Too far to deliver" and "needs an address" are written for customers and
    // decide what checkout can offer, so they travel with their own message.
    const refusal = shippingRefusal(data)
    if (refusal) throw new ShippingRefusedError(refusal.code, refusal.message)
    throw new Error(data?.error ?? data?.detail ?? data?.message ?? 'Could not calculate order total.')
  }

  return data as OrderTotal
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
 * Shape a link token must have before it is sent anywhere.
 *
 * URL-safe base64 or hex, 32-256 characters. Anything else is refused here,
 * without a backend round trip, so the page cannot be used to fire arbitrary
 * strings at the backend. The lower bound is a floor, not the security: a
 * token is only safe if the backend makes it long and random enough (at least
 * 128 bits) that guessing one is hopeless.
 */
const GUEST_ORDER_TOKEN = /^[A-Za-z0-9_-]{32,256}$/

export function isWellFormedGuestOrderToken(token: string): boolean {
  return GUEST_ORDER_TOKEN.test(token)
}

/**
 * The orders a guest's emailed link grants access to.
 *
 * **Never cache this.** It is one person's private data keyed by a secret; a
 * `'use cache'` here would store it in a cache shared across visitors, and a
 * cache key is not a security boundary. Every call goes to the backend.
 *
 * The token travels in the request body, not the backend URL, so it stays out
 * of the backend's access logs and any proxy in between.
 *
 * 400/401/403/404/410 all mean "this link does not grant anything" and are
 * reported as `invalid` without distinction. Anything else is logged and
 * returned as `error`, which the page shows as "try again later" rather than
 * "your link is bad".
 */
export async function getGuestOrders(token: string): Promise<GuestOrdersResult> {
  if (!isWellFormedGuestOrderToken(token)) return { state: 'invalid' }

  let res: Response
  try {
    res = await fetch(GUEST_ORDERS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Store-Domain': STORE_DOMAIN ?? '',
      },
      body: JSON.stringify({ token }),
      cache: 'no-store',
    })
  } catch (err) {
    console.error('[order.service guest-orders] request failed:', err)
    return { state: 'error' }
  }

  const data = await res.json().catch(() => null)

  if (res.ok) {
    // Same tolerance as listUserOrders: a bare array or `{ orders: [...] }`.
    const orders = Array.isArray(data) ? data : data?.orders
    if (Array.isArray(orders)) return { state: 'ok', orders: orders as GuestOrder[] }
    // Keys only: the body is a customer's order data and does not belong in logs.
    console.error('[order.service guest-orders] unexpected response shape, keys:', Object.keys(data ?? {}))
    return { state: 'error' }
  }

  if ([400, 401, 403, 404, 410].includes(res.status)) return { state: 'invalid' }

  logBackendRejection('order.service guest-orders', res.status, data)
  return { state: 'error' }
}

// Also called via navigator.sendBeacon on tab close for guests, so callers
// on that path shouldn't expect a meaningful response. TODO: confirm the
// real request/response contract.
//
// Mirrors the reference app's dedupe behavior: a `DUPLICATE_CART_ID` response
// means the backend already knows about this cart — not a failure, just a
// no-op notify. Callers still proceed to sync the Redis flag either way.
export async function createAbandonedCart(payload: unknown): Promise<{ notified: boolean }> {
  const res = await fetch(ABANDONED_CART_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Store-Domain': STORE_DOMAIN ?? '',
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok && data?.code !== 'DUPLICATE_CART_ID') {
    throw new Error(data?.error ?? data?.detail ?? 'Could not record abandoned cart.')
  }

  return { notified: res.ok }
}
