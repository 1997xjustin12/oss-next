import { NextRequest, NextResponse } from 'next/server'
import {
  DEFAULT_DEPOT_FEATURED_KEYS,
  getDepotFeaturedContainers,
  isDepotFeaturedKey,
  isFeaturedPaymentType,
} from '@/services/search.service'

/**
 * GET /api/shipping-containers/featured?depot=Atlanta,%20GA
 * GET /api/shipping-containers/featured?depot=Atlanta,%20GA&specs=used_20s_wwt,used_40h_wwt
 * GET /api/shipping-containers/featured?depot=Atlanta,%20GA&ptype=rental
 *
 * The containers a depot leads with — see `getDepotFeaturedContainers` for
 * which ones and why the matching cannot be left to Elasticsearch. Without
 * `specs` it answers the default four. With it, only those, in that order; an
 * unknown key is a 400, so a typo cannot pass as "this depot has none".
 *
 * `ptype` is `buy` (the default) or `rental`: the same specs, as monthly
 * rentals, each at its cheapest term. Anything else is a 400.
 *
 * Exists because the component that wants this is a Client Component: it reads
 * the visitor's depot out of their browser's storage, which no server render
 * can see.
 *
 * Fewer than requested come back when a depot does not stock one. That is a normal
 * answer, not an error — `found` and `requested` are in the response so a
 * caller can tell "this depot has three" from "something went wrong".
 */
export async function GET(request: NextRequest) {
  const depot = request.nextUrl.searchParams.get('depot')?.trim()

  if (!depot) {
    return NextResponse.json({ error: 'depot is required' }, { status: 400 })
  }

  const specsParam = request.nextUrl.searchParams.get('specs')
  const requested = specsParam === null
    ? DEFAULT_DEPOT_FEATURED_KEYS
    : [...new Set(specsParam.split(',').map((key) => key.trim()))]

  const validKeys = requested.filter(isDepotFeaturedKey)
  if (validKeys.length !== requested.length) {
    return NextResponse.json({ error: 'specs has an unknown key' }, { status: 400 })
  }

  const ptype = request.nextUrl.searchParams.get('ptype') ?? 'buy'
  if (!isFeaturedPaymentType(ptype)) {
    return NextResponse.json({ error: 'ptype must be buy or rental' }, { status: 400 })
  }

  try {
    const results = await getDepotFeaturedContainers(depot, validKeys, ptype)

    return NextResponse.json(
      {
        depot,
        requested: validKeys.length,
        found: results.length,
        containers: results.map(({ spec, product }) => ({ spec, product })),
      },
      // Prices are cached for minutes upstream; let a CDN hold the answer as long.
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } },
    )
  } catch (err) {
    console.error('[/api/shipping-containers/featured] lookup failed for depot:', depot, err)
    return NextResponse.json({ error: 'Could not load containers for this depot.' }, { status: 502 })
  }
}
