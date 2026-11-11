import { NextRequest, NextResponse } from 'next/server'
import { listUserOrders } from '@/services/order.service'
import { rateLimitedReply } from '@/lib/backendError'
import { isPaymentRedirectOn } from '@/lib/paymentRedirect'

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  }

  try {
    const [orders, paymentOn] = await Promise.all([
      listUserOrders(token),
      isPaymentRedirectOn(request.headers.get('host') ?? ''),
    ])
    // Same per-domain switch as checkout and order-status (lib/paymentRedirect):
    // where payment is not open yet, the link is left out here on the server,
    // so OrderCard has nothing to show a "Complete payment" button for.
    if (paymentOn) return NextResponse.json({ orders })
    return NextResponse.json({
      orders: orders.map((order) => ({ ...order, payment_url: undefined, payment_link: undefined })),
    })
  } catch (err) {
    // The backend's 429 travels as itself, with its message and Retry-After.
    const limited = rateLimitedReply(err)
    if (limited) return limited
    const message = err instanceof Error ? err.message : 'Could not load orders.'
    console.error('[/api/auth/orders]', err)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
