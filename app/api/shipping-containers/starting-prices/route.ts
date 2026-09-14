import { NextRequest, NextResponse } from 'next/server'
import { getShippingContainersByLocation } from '@/services/search.service'
import { FEATURED_CONTAINERS } from '@/config/featuredContainers'
import { DEFAULT_LOCATION } from '@/lib/constants'
import { lowestPrice } from '@/lib/pricing'

// GET /api/shipping-containers/starting-prices?location=Atlanta, GA
//
// The "Starts at" figure for each featured container at one depot:
//
//   { "location": "Atlanta, GA", "prices": { "used-20ft-standard": 1600, "new-40ft-hc": null, … } }
//
// Computed here rather than in the browser so the homepage cards don't download
// every listing at a depot to read four numbers. No location falls back to the
// generic reference listings — the same default the homepage ZIP banner uses.
// `null` means the depot has no matching listing, and the card shows no price.

const MAX_LOCATION_LENGTH = 100

export async function GET(req: NextRequest) {
  const location = req.nextUrl.searchParams.get('location')?.trim() || DEFAULT_LOCATION
  if (location.length > MAX_LOCATION_LENGTH) {
    return NextResponse.json({ error: 'location is too long' }, { status: 400 })
  }

  try {
    const hits = await getShippingContainersByLocation(location)
    const prices = Object.fromEntries(
      FEATURED_CONTAINERS.map((card) => [card.key, lowestPrice(hits, card.spec)]),
    )
    return NextResponse.json(
      { location, prices },
      // Prices are cached for minutes upstream; let a CDN hold the answer as long.
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } },
    )
  } catch (err) {
    console.error('[/api/shipping-containers/starting-prices] error:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Search unavailable' }, { status: 500 })
  }
}
