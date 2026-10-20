import { NextRequest, NextResponse } from 'next/server'
import { clientIp, isOverPricingRateLimit } from '@/lib/pricingGuard'
import { getCachedOrderTotal } from '@/services/order.service'
import { visitorIp } from '@/lib/backendAuth'
import { rateLimitedReply } from '@/lib/backendError'
import type { GetOrderTotalPayload } from '@/types/order'

/**
 * Order totals for the cart and checkout pages.
 *
 * Each backend call can cost a paid Google lookup, so answers are cached for a
 * short while (getCachedOrderTotal, in the platform's shared cache) and
 * requests are rate-limited per visitor (lib/pricingGuard, the one Redis call
 * left on this route). The charge itself does not come through here:
 * /api/checkout/place-order re-prices fresh before taking money.
 */
export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => null)) as GetOrderTotalPayload | null

  if (!payload?.items?.length) {
    return NextResponse.json({ error: 'At least one cart item is required.' }, { status: 400 })
  }

  if (await isOverPricingRateLimit(clientIp(request))) {
    return NextResponse.json(
      { error: 'Too many pricing requests. Please wait a moment and try again.' },
      { status: 429, headers: { 'Retry-After': '60' } },
    )
  }

  try {
    // An expected refusal ("can't deliver there", with a `code` the page reads)
    // comes back as a 400 reply rather than a throw, and is cached with the
    // rest — see getCachedOrderTotal.
    //
    // Priced for this visitor: the signed-in customer's token, otherwise their
    // address — a cache miss is made as this visitor, so the backend can count
    // them (see getCachedOrderTotal). No address is needed once there is a token.
    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || undefined
    const reply = await getCachedOrderTotal(payload, { token, ip: token ? null : await visitorIp() })
    return NextResponse.json(reply.body, { status: reply.status })
  } catch (err) {
    // The backend's 429 travels as itself, with its message and Retry-After.
    const limited = rateLimitedReply(err)
    if (limited) return limited
    const message = err instanceof Error ? err.message : 'Could not calculate order total.'
    console.error('[/api/orders/get-total]', err)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
