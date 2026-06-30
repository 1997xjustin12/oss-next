import { NextRequest, NextResponse } from 'next/server'

const GEOAPIFY_URL = 'https://api.geoapify.com/v1/geocode/autocomplete'
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

  const params = new URLSearchParams({
    text,
    apiKey:  API_KEY,
    limit:   searchParams.get('limit')   ?? '5',
    type:    searchParams.get('type')    ?? 'postcode',
    filter:  searchParams.get('filter')  ?? 'countrycode:us,ca',
  })

  try {
    const upstream = await fetch(`${GEOAPIFY_URL}?${params}`, {
      signal: AbortSignal.timeout(5000),
    })

    if (!upstream.ok) {
      console.error(`[/api/geoapify] upstream ${upstream.status}`)
      return NextResponse.json({ error: `Upstream error ${upstream.status}` }, { status: upstream.status })
    }

    const data = await upstream.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[/api/geoapify]', err)
    return NextResponse.json({ error: 'Failed to contact Geoapify' }, { status: 502 })
  }
}
