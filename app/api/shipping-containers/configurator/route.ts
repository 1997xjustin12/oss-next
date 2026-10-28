import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_LOCATION } from '@/lib/constants'
import { getConfiguratorProducts } from '@/services/configurator.service'
import type { ConfiguratorPaymentType } from '@/lib/configurator'

// GET /api/shipping-containers/configurator?location=Atlanta, GA&paymentType=rto
//
// One depot's containers of one payment type, cut down for the configurator:
//
//   { "location": "Atlanta, GA", "products": [{ id, title, price, specs, images, … }] }
//
// The configurator re-reads this when the visitor's location changes. The
// slimming happens here so the browser downloads a few KB, not the 260 KB
// depot listing behind it. No location falls back to the generic listings.

const MAX_LOCATION_LENGTH = 100
const PAYMENT_TYPES: readonly ConfiguratorPaymentType[] = ['rto', 'rental', 'buy']

export async function GET(req: NextRequest) {
  const location = req.nextUrl.searchParams.get('location')?.trim() || DEFAULT_LOCATION
  if (location.length > MAX_LOCATION_LENGTH) {
    return NextResponse.json({ error: 'location is too long' }, { status: 400 })
  }
  const paymentType = req.nextUrl.searchParams.get('paymentType') ?? 'rto'
  if (!PAYMENT_TYPES.includes(paymentType as ConfiguratorPaymentType)) {
    return NextResponse.json({ error: 'unknown paymentType' }, { status: 400 })
  }

  try {
    const products = await getConfiguratorProducts(location, paymentType as ConfiguratorPaymentType)
    return NextResponse.json(
      { location, products },
      // Cached for minutes upstream; let a CDN hold the answer as long.
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } },
    )
  } catch (err) {
    console.error('[/api/shipping-containers/configurator] error:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Search unavailable' }, { status: 500 })
  }
}
