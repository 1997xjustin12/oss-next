import { NextRequest, NextResponse } from 'next/server'
import { getDeliveryRates, fetchDeliveryRates } from '@/services/delivery.service'

// GET /api/delivery-rates?zipcode=95814&slug=<product-slug>
//                        [&item_id=<int>] [&state=<label>] [&refresh=1]
//
// Client-side wrapper around the delivery-rate service, for the PDP's ZIP and
// option controls. Proxied rather than called directly from the browser so the
// WordPress origin stays server-side and the response can be cached once for
// every visitor asking the same ZIP/product pair.
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
  const result = refresh
    ? await fetchDeliveryRates(query, { refresh: true })
    : await getDeliveryRates(query)

  if (!result.ok) {
    // 'unavailable' is ours (upstream down); the rest are the caller's request.
    const status = result.reason === 'unavailable' ? 502 : 400
    return NextResponse.json(result, { status })
  }

  return NextResponse.json(result)
}
