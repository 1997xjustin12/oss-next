import { NextRequest, NextResponse } from 'next/server'
import { getOrderTracking, listUserOrders } from '@/services/order.service'
import type { OrderTracking } from '@/types/order'

/**
 * GET /api/auth/orders/tracking?orders=000005,000004
 *
 * Shipment tracking for the signed-in customer's own orders, keyed by order number:
 *
 *   { "tracking": { "000005": { "state": "none", "orderStatus": "delivered" }, … } }
 *
 * ## Why this route exists instead of calling the backend from the page
 *
 * The backend's `orders/tracking/track/<order_number>/` answers without checking
 * login or ownership, and order numbers are sequential — anyone can read any
 * order's status by counting (reported to the backend team 2026-09-14). This route
 * is where customers are kept to their own orders:
 *
 * 1. A login token is required.
 * 2. The customer's own order list is fetched with that token, and only order
 *    numbers in it are looked up. Anything else is answered `not_found` without
 *    the backend ever being asked, so this route can't be used to probe other
 *    customers' orders, and "not yours" looks the same as "doesn't exist".
 *
 * Several orders in one request, because the orders page shows tracking for every
 * order at once: one ownership check, then the lookups in parallel. The backend's
 * own `bulk/` can't be used — it takes internal order IDs the order list never
 * returns.
 *
 * Per-customer data, so never cached.
 */

const NO_STORE = { 'Cache-Control': 'private, no-store' }

/** An order history is short; this only bounds a crafted request. */
const MAX_ORDERS = 50

/** Order numbers are digits today (000001); a little headroom, nothing that could reshape the backend URL. */
const ORDER_NUMBER = /^[A-Za-z0-9-]{1,32}$/

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401, headers: NO_STORE })
  }

  const requested = [
    ...new Set(
      (request.nextUrl.searchParams.get('orders') ?? '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ]
  if (requested.length === 0) {
    return NextResponse.json({ error: 'orders is required.' }, { status: 400, headers: NO_STORE })
  }
  if (requested.length > MAX_ORDERS) {
    return NextResponse.json({ error: `At most ${MAX_ORDERS} orders per request.` }, { status: 400, headers: NO_STORE })
  }
  if (requested.some((value) => !ORDER_NUMBER.test(value))) {
    return NextResponse.json({ error: 'Invalid order number.' }, { status: 400, headers: NO_STORE })
  }

  let owned: Set<string>
  try {
    owned = new Set((await listUserOrders(token)).map((order) => String(order.order_number)))
  } catch (err) {
    // Same answer the orders list route gives when it can't load — an expired
    // token lands here too, and the page already handles that.
    console.error('[/api/auth/orders/tracking] could not load the customer order list:', err)
    return NextResponse.json({ error: 'Could not load orders.' }, { status: 400, headers: NO_STORE })
  }

  const entries = await Promise.all(
    requested.map(async (orderNumber): Promise<[string, OrderTracking]> => [
      orderNumber,
      owned.has(orderNumber) ? await getOrderTracking(orderNumber, token) : { state: 'not_found' },
    ]),
  )

  return NextResponse.json({ tracking: Object.fromEntries(entries) }, { headers: NO_STORE })
}
