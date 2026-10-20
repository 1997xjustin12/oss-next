import { NextRequest, NextResponse } from 'next/server'
import { visitorIp } from '@/lib/backendAuth'
import { getDeliveryRates, fetchDeliveryRates } from '@/services/delivery.service'

// GET /api/delivery-rates?zipcode=95814&slug=<product-slug>
//                        [&item_id=<int>] [&state=<label>] [&refresh=1]
//
// Client-side wrapper around the delivery-rate service, for the PDP's ZIP and
// option controls. Proxied rather than called directly from the browser so the
// backend stays server-side; the answer is cached per visitor and ZIP/product
// pair (see getDeliveryRates).
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams

  const zipcode = params.get('zipcode')?.trim() ?? ''
  const slug = params.get('slug')?.trim() || undefined
  const state = params.get('state')?.trim() || undefined
  const refresh = params.get('refresh') === '1'

  const rawItemId = params.get('item_id')?.trim()
  const itemId = rawItemId ? Number(rawItemId) : undefined
  if (rawItemId && !Number.isInteger(itemId)) {
    return NextResponse.json(
      { ok: false, reason: 'product-not-found', message: 'Invalid product id.' },
      { status: 400 },
    )
  }

  const query = { zipcode, slug, itemId, state }
  // `refresh` means "recalculate", so it has to skip our cache as well as
  // WordPress's transient — reading it back through getDeliveryRates would
  // serve the very entry the caller asked us to bypass.
  // The visitor, so the backend counts the quote against them (lib/backendAuth).
  const ip = await visitorIp()
  const result = refresh ? await fetchDeliveryRates(query, ip) : await getDeliveryRates(query, ip)

  if (!result.ok) {
    // 'unavailable' is ours (the backend is down); the rest describe what was
    // asked for — a ZIP out of range included, which is an answer about the
    // address rather than a fault on either side.
    const status = result.reason === 'unavailable' ? 502 : 400
    return NextResponse.json(result, { status })
  }

  return NextResponse.json(result)
}
