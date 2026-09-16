import { NextRequest, NextResponse } from 'next/server'
import { cachedGeoapifyAutocomplete, GeoapifyUpstreamError } from '@/services/geoapify.service'
import { isOverDailyBudget, isOverGeoapifyRateLimit, visitorKey } from '@/lib/geoapifyGuard'

const API_KEY = process.env.GEOAPIFY_API_KEY ?? process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ?? ''

/**
 * Address and postcode autocomplete, proxied so the key stays server-side.
 *
 * Answers are cached per query for days and shared by every visitor, so the
 * cost of this endpoint is the number of *distinct* things people type, not the
 * number of keystrokes. Two guards sit in front of that cache — a per-visitor
 * rate limit and a daily budget across everyone — see lib/geoapifyGuard.ts.
 *
 * When either trips, the answer is an empty list with `limited: true` and HTTP
 * 200, not an error: the caller is a text field that works perfectly well
 * without suggestions, and a 429 there would be an error state over a feature
 * nobody has lost.
 */
export async function GET(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: 'Geoapify API key not configured' }, { status: 503 })
  }

  const { searchParams } = req.nextUrl
  const text = searchParams.get('text') ?? ''
  if (!text.trim()) {
    return NextResponse.json({ features: [] })
  }

  if (await isOverGeoapifyRateLimit(visitorKey(req))) {
    return NextResponse.json({ features: [], limited: true })
  }

  // Checked before the cached lookup rather than inside it: a refusal must
  // never be written into a cache that lives for days.
  if (await isOverDailyBudget()) {
    console.warn('[/api/geoapify] daily budget reached — serving no suggestions')
    return NextResponse.json({ features: [], limited: true })
  }

  try {
    const data = await cachedGeoapifyAutocomplete({
      text,
      limit: searchParams.get('limit') ?? '5',
      // `type=any` means "no type filter", which is how an address search asks
      // for streets and buildings as well as postcodes. Absent stays 'postcode'
      // so the listing page's ZIP lookup is unchanged.
      type: searchParams.get('type') === 'any' ? '' : (searchParams.get('type') ?? 'postcode'),
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
