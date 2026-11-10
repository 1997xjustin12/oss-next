import { NextResponse, type NextRequest } from 'next/server'
import { withRateLimit } from '@/lib/agentApi'
import { resolveNearestDepot } from '@/services/depot.service'

/**
 * GET /api/depots/nearest?lat=..&lon=..&country=us — the depot that serves a
 * point: `{ title, distanceKm }`, or `{ title: null }` when none can. For the
 * browser code that has coordinates but no suggestion from /api/geoapify ("use
 * my current location", ZipAutoDetect). Same rules as everywhere
 * (resolveNearestDepot): never "Various North America", virtual depots only
 * when the admin switch is on, and only depots in `country` ('us', 'ca') when
 * it is given.
 */
export async function GET(request: NextRequest) {
  const lat = Number(request.nextUrl.searchParams.get('lat'))
  const lon = Number(request.nextUrl.searchParams.get('lon'))
  const country = request.nextUrl.searchParams.get('country')

  return withRateLimit(
    request,
    async (headers) => {
      const valid = Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180
      if (!valid) return NextResponse.json({ error: 'lat and lon must be coordinates.' }, { status: 400, headers })
      const nearest = await resolveNearestDepot(lat, lon, country)
      return NextResponse.json(nearest ?? { title: null }, { headers })
    },
    'light',
  )
}
