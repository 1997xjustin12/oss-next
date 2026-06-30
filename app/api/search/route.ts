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
  [key: string]: unknown
}

type ISRequest = { indexName: string; params?: ISParams }

export async function POST(req: NextRequest) {
  try {
    const { requests } = (await req.json()) as { requests: ISRequest[] }

    const results = await Promise.all(
      requests.map(async ({ params = {} }) => {
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
      { results: [], error: process.env.NODE_ENV !== 'production' ? msg : 'Search unavailable' },
      { status: 500 },
    )
  }
}
