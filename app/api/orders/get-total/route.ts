import { NextRequest, NextResponse } from 'next/server'
import {
  clientIp,
  isOverPricingRateLimit,
  orderTotalCacheKey,
  readCachedTotal,
  writeCachedTotal,
} from '@/lib/pricingGuard'
import { ShippingRefusedError } from '@/lib/shippingQuote'
import { getOrderTotal } from '@/services/order.service'
import type { GetOrderTotalPayload } from '@/types/order'

/**
 * Order totals for the cart and checkout pages.
 *
 * Each backend call can cost a paid Google lookup, so answers are cached for a
 * short while and requests are rate-limited per visitor — see lib/pricingGuard.
 * The charge itself does not come through here: /api/checkout/place-order
 * re-prices fresh before taking money.
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

  const key = orderTotalCacheKey(payload)
  const cached = await readCachedTotal(key)
  if (cached) {
    return NextResponse.json(cached.body, { status: cached.status, headers: { 'X-Pricing-Cache': 'hit' } })
  }

  try {
    const total = await getOrderTotal(payload)
    await writeCachedTotal(key, { status: 200, body: total })
    return NextResponse.json(total, { headers: { 'X-Pricing-Cache': 'miss' } })
  } catch (err) {
    // An expected answer, not a fault: `code` lets the page tell "we can't
    // deliver there" apart from a failed request. It holds for the same ZIP and
    // products, so it is cached too; other failures are not, so a backend
    // hiccup is retried rather than remembered.
    if (err instanceof ShippingRefusedError) {
      const body = { error: err.message, code: err.code }
      await writeCachedTotal(key, { status: 400, body })
      return NextResponse.json(body, { status: 400, headers: { 'X-Pricing-Cache': 'miss' } })
    }
    const message = err instanceof Error ? err.message : 'Could not calculate order total.'
    console.error('[/api/orders/get-total]', err)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
