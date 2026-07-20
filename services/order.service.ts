import type { CheckoutPayload, GetOrderTotalPayload, Order, OrderTotal } from '@/types/order'

const BACKEND_URL = process.env.NEXT_OSS_BACKEND_URL
const STORE_DOMAIN = process.env.NEXT_PUBLIC_STORE_DOMAIN

const CHECKOUT_URL = `${BACKEND_URL}api/orders/checkout`
const GET_TOTAL_URL = `${BACKEND_URL}api/orders/get-total`
const LIST_ORDERS_URL = `${BACKEND_URL}api/auth/orders`
const ABANDONED_CART_URL = `${BACKEND_URL}api/abandoned-carts/create/`

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
