import { NextRequest, NextResponse } from 'next/server'
import { getDepotFeaturedContainers } from '@/services/search.service'

/**
 * GET /api/shipping-containers/featured?depot=Atlanta,%20GA
 *
 * The four containers a depot leads with — see `getDepotFeaturedContainers`
 * for which four and why the matching cannot be left to Elasticsearch.
 *
 * Exists because the component that wants this is a Client Component: it reads
 * the visitor's depot out of their browser's storage, which no server render
 * can see.
 *
 * Fewer than four come back when a depot does not stock one. That is a normal
 * answer, not an error — `found` and `requested` are in the response so a
 * caller can tell "this depot has three" from "something went wrong".
 */
export async function GET(request: NextRequest) {
  const depot = request.nextUrl.searchParams.get('depot')?.trim()

  if (!depot) {
    return NextResponse.json({ error: 'depot is required' }, { status: 400 })
  }

  try {
    const results = await getDepotFeaturedContainers(depot)

    return NextResponse.json({
      depot,
      requested: 4,
      found: results.length,
      containers: results.map(({ spec, product }) => ({ spec, product })),
    })
  } catch (err) {
    console.error('[/api/shipping-containers/featured] lookup failed for depot:', depot, err)
    return NextResponse.json({ error: 'Could not load containers for this depot.' }, { status: 502 })
  }
}
