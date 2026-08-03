import { NextRequest, NextResponse } from 'next/server'

/**
 * Public proxy for the backend sitemap endpoint
 * (`{BACKEND}/api/sitemap/?type=...`).
 *
 *   GET /api/sitemap?type=products   → the backend JSON (URLs + lastmod)
 *
 * The backend route is key-protected; this attaches the Api-Key server-side so
 * the key never reaches the browser, and returns the data unauthenticated so it
 * can be shared / consumed by external tools. It's sitemap data (public URLs),
 * not sensitive.
 *
 * NOTE: this is a URL/lastmod feed, NOT a Google Merchant product feed —
 * Merchant needs price/image/availability per item, which this doesn't carry.
 */

const BACKEND = (process.env.NEXT_OSS_BACKEND_URL ?? '').replace(/\/+$/, '')
const API_KEY = process.env.NEXT_OSS_BACKEND_KEY
const STORE_DOMAIN = process.env.NEXT_PUBLIC_STORE_DOMAIN

// Types the backend understands. Guards against forwarding arbitrary values.
const ALLOWED_TYPES = new Set(['products', 'page'])
const CACHE_SECONDS = 3600

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type') ?? 'products'
  if (!ALLOWED_TYPES.has(type)) {
    return NextResponse.json(
      { error: `Unknown type "${type}". Allowed: ${[...ALLOWED_TYPES].join(', ')}.` },
      { status: 400 },
    )
  }

  try {
    const res = await fetch(`${BACKEND}/api/sitemap/?type=${encodeURIComponent(type)}`, {
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        'X-Store-Domain': STORE_DOMAIN ?? '',
      },
      signal: AbortSignal.timeout(20_000),
      // Cache the upstream fetch — sitemap data changes slowly.
      next: { revalidate: CACHE_SECONDS },
    })

    if (!res.ok) {
      console.error(`[/api/sitemap] upstream ${res.status} for type=${type}`)
      return NextResponse.json({ error: `Upstream returned ${res.status}.` }, { status: 502 })
    }

    const data = await res.json()
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=86400`,
      },
    })
  } catch (err) {
    console.error('[/api/sitemap] fetch failed:', err)
    return NextResponse.json({ error: 'Sitemap source is unavailable.' }, { status: 502 })
  }
}
