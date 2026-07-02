import { NextRequest, NextResponse } from 'next/server'
import { ALL_RESULTS_CAP, cachedCustomFieldsSearch } from '@/services/search.service'
import type { CustomFieldFilters } from '@/services/search.service'

const RESERVED_PARAMS = new Set(['page', 'pageSize', 'product_category', 'all'])
const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100

// GET /api/shipping-containers?location=Various North America&condition=New&product_category=Generic Product Page&page=1&pageSize=20
// GET /api/shipping-containers?location=Various North America&all=true
//
// `product_category` filters on the product's category name(s). `all=true`
// ignores `page`/`pageSize` and returns every matching result, up to
// ALL_RESULTS_CAP (see `pagination.truncated` if the match count exceeds it).
// Any other query param besides the reserved ones is treated as a
// `custom_fields.name` filter (matched against `custom_fields.value`). Repeat
// a key or comma-separate values to filter on multiple values for the same field.
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams

    const wantsAll = ['true', '1'].includes(searchParams.get('all')?.toLowerCase() ?? '')

    const page     = wantsAll ? 1 : Math.max(1, Math.trunc(Number(searchParams.get('page')) || 1))
    const pageSize = wantsAll
      ? ALL_RESULTS_CAP
      : Math.min(MAX_PAGE_SIZE, Math.max(1, Math.trunc(Number(searchParams.get('pageSize')) || DEFAULT_PAGE_SIZE)))

    const categories = searchParams.getAll('product_category').flatMap((value) => value.split(','))

    const filters: CustomFieldFilters = {}
    for (const key of searchParams.keys()) {
      if (RESERVED_PARAMS.has(key) || filters[key]) continue
      filters[key] = searchParams.getAll(key).flatMap((value) => value.split(','))
    }

    const result = await cachedCustomFieldsSearch({
      filters,
      categories,
      page:        page - 1,
      hitsPerPage: pageSize,
    })

    return NextResponse.json({
      data: result.hits,
      pagination: {
        page,
        pageSize,
        total:      result.total,
        totalPages: result.nbPages,
        ...(wantsAll && { truncated: result.total > ALL_RESULTS_CAP }),
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[/api/shipping-containers] error:', msg)
    return NextResponse.json(
      { data: [], error: process.env.NODE_ENV !== 'production' ? msg : 'Search unavailable' },
      { status: 500 },
    )
  }
}
