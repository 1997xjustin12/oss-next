import { NextRequest, NextResponse } from 'next/server'
import { getActiveCart } from '@/services/cart.service'
import { getAbandonedCartFlag } from '@/services/abandonedCart.service'

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')

  try {
    const data = await getActiveCart(token)

    // Merge in the Redis-backed abandonment flag — the Django cart record
    // itself carries no such field; Redis, keyed by cart_id, is the sole
    // source of truth for it (see services/abandonedCart.service.ts).
    // Best-effort: a Redis outage/misconfiguration shouldn't take down
    // cart loading, it just means `is_abandoned` comes back unknown.
    const cartData = (data ?? {}) as Record<string, unknown>
    const cartId = typeof cartData.cart_id === 'string' ? cartData.cart_id : undefined
    const isAbandoned = cartId ? await getAbandonedCartFlag(cartId).catch(() => null) : null

    return NextResponse.json({ ...cartData, is_abandoned: isAbandoned })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not load cart.'
    console.error('[/api/cart/active]', err)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
