import { NextRequest, NextResponse } from 'next/server'
import { cachedEsSearch, DEFAULT_LOCATION } from '@/services/search.service'
import type { FacetFilter } from '@/services/search.service'

const INDEX = process.env.NEXT_PUBLIC_SEARCH_INDEX ?? 'onsite_products_index'

type ISParams = {
  query?:                   string
  hitsPerPage?:             number
  page?:                    number
  facets?:                  string[]
  facetFilters?:            FacetFilter[]
  productType?:             string
  locationFilter?:          string
  sortParam?:               string
  accessoryCategoryFilter?: string
  sizeFilter?:              string[]
  conditionFilter?:         string[]
  gradeFilter?:             string[]
  heightFilter?:            string[]
  containerTypeFilter?:     string[]
  termFilter?:              string[]
  [key: string]: unknown
}

type ISRequest = { indexName: string; params?: ISParams }

/**
 * A valid, empty result for one request.
 *
 * The InstantSearch protocol pairs replies to queries **by position**, so the
 * response must always carry exactly one entry per request. Returning a bare
 * `{ results: [] }` on failure — as this route used to — left the client
 * dereferencing `results[0].hits` on `undefined`, which crashed the whole
 * listing page into the error boundary instead of showing an empty grid.
 *
 * The status code still says 500 so failures stay visible in logs and to the
 * client; this only makes the body impossible to crash on.
 */
function emptyResult(request: ISRequest) {
  const params = request?.params ?? {}
  return {
    hits: [],
    nbHits: 0,
    page: (params.page as number) ?? 0,
    nbPages: 0,
    hitsPerPage: (params.hitsPerPage as number) ?? 20,
    processingTimeMS: 0,
    query: (params.query as string) ?? '',
    params: '',
    index: INDEX,
    facets: {},
    facets_stats: {},
  }
}

export async function POST(req: NextRequest) {
  // Parsed outside the try so the failure path can still mirror the request
  // count. Defaults to a single request, which is what InstantSearch sends.
  let parsedRequests: ISRequest[] = [{ indexName: INDEX }]

  try {
    const { requests } = (await req.json()) as { requests: ISRequest[] }
    if (Array.isArray(requests) && requests.length) parsedRequests = requests

    const results = await Promise.all(
      parsedRequests.map(async ({ params = {} }) => {
        const {
          query               = '',
          hitsPerPage         = 20,
          page                = 0,
          facets              = [],
          facetFilters        = [],
          productType,
          locationFilter      = DEFAULT_LOCATION,
          sortParam           = 'default',
          accessoryCategoryFilter,
          sizeFilter          = [],
          conditionFilter     = [],
          gradeFilter         = [],
          heightFilter        = [],
          containerTypeFilter = [],
          termFilter          = [],
        } = params

        const result = await cachedEsSearch({
          query:               query as string,
          hitsPerPage:         hitsPerPage as number,
          page:                page as number,
          facets:              facets as string[],
          facetFilters:        facetFilters as FacetFilter[],
          productType:         productType as string | undefined,
          locationFilter:      locationFilter as string,
          sortParam:           sortParam as string,
          accessoryCategory:   accessoryCategoryFilter as string | undefined,
          sizeFilter:          sizeFilter as string[],
          conditionFilter:     conditionFilter as string[],
          gradeFilter:         gradeFilter as string[],
          heightFilter:        heightFilter as string[],
          containerTypeFilter: containerTypeFilter as string[],
          termFilter:          termFilter as string[],
        })

        return {
          hits:             result.hits,
          nbHits:           result.total,
          page:             page as number,
          nbPages:          result.nbPages,
          hitsPerPage:      hitsPerPage as number,
          processingTimeMS: result.processingTimeMS,
          query:            query as string,
          params:           '',
          index:            INDEX,
          facets:           result.facetsResult,
          facets_stats:     {},
        }
      }),
    )

    return NextResponse.json({ results })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[/api/search] error:', msg)
    return NextResponse.json(
      {
        // One well-formed empty result per request — see emptyResult().
        results: parsedRequests.map(emptyResult),
        error: process.env.NODE_ENV !== 'production' ? msg : 'Search unavailable',
      },
      { status: 500 },
    )
  }
}
