import { NextRequest, NextResponse } from 'next/server'
import { createAbandonedCart } from '@/services/order.service'
import { setAbandonedCartFlag } from '@/services/abandonedCart.service'
import { rateLimitedReply } from '@/lib/backendError'

// Consolidates what the reference app does as two separate client calls
// (notify backend, then write the Redis flag via a generic KV proxy) into
// one — the client only ever calls this single endpoint.
export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null)

  if (!payload) {
    return NextResponse.json({ error: 'Request body is required.' }, { status: 400 })
  }

  try {
    // Signed in: forwarded so the backend counts the customer (lib/backendAuth).
    // A guest's sendBeacon carries no header and is counted by visitor address.
    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || undefined
    await createAbandonedCart(payload, token)

    // Only logged-in carts have a real cart_id to key the flag on — guest
    // carts in this app never get one (see docs/audits/API_INTEGRATION_STATUS.md),
    // so there's nothing to flag/resume for them, just the notify above.
    const cartId = (payload as { cart_id?: string }).cart_id
    const abandonedAt = cartId ? await setAbandonedCartFlag(cartId) : null

    return NextResponse.json({ ok: true, abandonedAt })
  } catch (err) {
    // The backend's 429 travels as itself, with its message and Retry-After.
    const limited = rateLimitedReply(err)
    if (limited) return limited
    const message = err instanceof Error ? err.message : 'Could not record abandoned cart.'
    console.error('[/api/abandoned-carts/create]', err)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
