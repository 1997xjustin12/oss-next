import { NextRequest, NextResponse } from 'next/server'
import { cachedGeoapifyAutocomplete, GeoapifyUpstreamError } from '@/services/geoapify.service'

const API_KEY = process.env.GEOAPIFY_API_KEY ?? process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ?? ''

export async function GET(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: 'Geoapify API key not configured' }, { status: 503 })
  }

  const { searchParams } = req.nextUrl
  const text = searchParams.get('text') ?? ''
  if (!text.trim()) {
    return NextResponse.json({ features: [] })
  }

  try {
    const data = await cachedGeoapifyAutocomplete({
      text,
      limit:  searchParams.get('limit')  ?? '5',
      type:   searchParams.get('type')   ?? 'postcode',
      filter: searchParams.get('filter') ?? 'countrycode:us,ca',
    })
    return NextResponse.json(data)
  } catch (err) {
    if (err instanceof GeoapifyUpstreamError) {
      console.error(`[/api/geoapify] upstream ${err.status}`)
      return NextResponse.json({ error: `Upstream error ${err.status}` }, { status: err.status })
    }
    console.error('[/api/geoapify]', err)
    return NextResponse.json({ error: 'Failed to contact Geoapify' }, { status: 502 })
  }
}
