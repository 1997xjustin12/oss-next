import { NextRequest, NextResponse } from 'next/server'
import { getShippingContainersByLocation } from '@/services/search.service'

// GET /api/shipping-containers/by-location?location=Various North America
//
// Thin wrapper around getShippingContainersByLocation() for client-side
// consumers (e.g. useGeoapify) that can't call the Elasticsearch-backed
// service directly.
export async function GET(req: NextRequest) {
  const location = req.nextUrl.searchParams.get('location')?.trim()
  if (!location) {
    return NextResponse.json({ data: [], error: 'location is required' }, { status: 400 })
  }

  try {
    const data = await getShippingContainersByLocation(location)
    return NextResponse.json({ data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[/api/shipping-containers/by-location] error:', msg)
    return NextResponse.json(
      { data: [], error: process.env.NODE_ENV !== 'production' ? msg : 'Search unavailable' },
      { status: 500 },
    )
  }
}
