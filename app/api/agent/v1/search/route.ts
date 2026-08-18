import { cachedEsSearch, DEFAULT_LOCATION } from '@/services/search.service'
import { agentError, agentJson, withRateLimit } from '@/lib/agentApi'
import { toAgentProduct } from '@/lib/agentProduct'
import type { ProductHit } from '@/types/product'

/**
 * GET /api/agent/v1/search
 *
 * Catalog search for agents. Flat query string in, flat array out — the
 * deliberate opposite of `/api/search`, which is InstantSearch's transport
 * envelope and unusable without reverse-engineering it.
 *
 *   ?q=40ft high cube        free text over title, tags, SKU, specs, category
 *   ?type=containers|accessories
 *   ?purchase=buy|rental|rent_to_own
 *   ?location=Phoenix, AZ    depot name; see /api/agent/v1/availability for zip
 *   ?condition=New|Used
 *   ?size=40'
 *   ?limit=1..50 (default 20)
 *   ?offset=0
 */

const MAX_LIMIT = 50
const DEFAULT_LIMIT = 20

/** Public `purchase` values map onto the index's internal payment_type. */
const PURCHASE_TO_PAYMENT: Record<string, string> = {
  buy: 'buy',
  rental: 'rental',
  rent_to_own: 'rto',
}

function parseIntParam(raw: string | null, fallback: number, min: number, max: number): number | null {
  if (raw === null) return fallback
  const n = Number(raw)
  if (!Number.isInteger(n) || n < min || n > max) return null
  return n
}

/** Repeatable or comma-separated, so ?condition=New&condition=Used both work. */
function multiParam(params: URLSearchParams, name: string): string[] {
  return params
    .getAll(name)
    .flatMap((v) => v.split(','))
    .map((v) => v.trim())
    .filter(Boolean)
}

export async function GET(request: Request) {
  return withRateLimit(request, async (headers) => {
    const params = new URL(request.url).searchParams

    const limit = parseIntParam(params.get('limit'), DEFAULT_LIMIT, 1, MAX_LIMIT)
    if (limit === null) {
      return agentError('invalid_limit', 'limit must be an integer.', 400, `Use 1 to ${MAX_LIMIT}.`, headers)
    }

    const offset = parseIntParam(params.get('offset'), 0, 0, 10_000)
    if (offset === null) {
      return agentError('invalid_offset', 'offset must be an integer.', 400, 'Use 0 or greater.', headers)
    }

    const typeParam = params.get('type')
    if (typeParam && typeParam !== 'containers' && typeParam !== 'accessories') {
      return agentError('invalid_type', `Unknown type "${typeParam}".`, 400, 'Use containers or accessories.', headers)
    }

    const purchaseParam = params.get('purchase')
    if (purchaseParam && !PURCHASE_TO_PAYMENT[purchaseParam]) {
      return agentError(
        'invalid_purchase',
        `Unknown purchase type "${purchaseParam}".`,
        400,
        'Use buy, rental or rent_to_own.',
        headers,
      )
    }

    // Accessories are a distinct productType in the index; containers are
    // selected by payment_type. Default to `buy` so an unqualified search
    // returns purchase prices rather than a mix of monthly and one-time.
    const productType =
      typeParam === 'accessories'
        ? 'accessories'
        : purchaseParam
          ? PURCHASE_TO_PAYMENT[purchaseParam]
          : 'buy'

    // hitsPerPage/page is the only pagination the search service exposes, so an
    // arbitrary offset is served by over-fetching one page and slicing. Bounded
    // by MAX_LIMIT + offset, which the offset cap keeps sane.
    const pageSize = limit + offset

    try {
      const { hits, total } = await cachedEsSearch({
        query: params.get('q')?.trim() ?? '',
        hitsPerPage: Math.min(pageSize, 200),
        page: 0,
        facets: [],
        facetFilters: [],
        productType,
        locationFilter: params.get('location')?.trim() || DEFAULT_LOCATION,
        sortParam: 'default',
        accessoryCategory: undefined,
        sizeFilter: multiParam(params, 'size'),
        conditionFilter: multiParam(params, 'condition'),
        gradeFilter: multiParam(params, 'grade'),
        heightFilter: multiParam(params, 'height'),
        containerTypeFilter: [],
        termFilter: multiParam(params, 'term'),
      })

      const page = (hits as ProductHit[]).slice(offset, offset + limit)

      return agentJson(
        {
          total,
          count: page.length,
          offset,
          limit,
          // Repeated on every response because it is the single most
          // misread field in this catalog, and an agent may only read this once.
          priceNote:
            'Each product states its own price basis. Rental and rent-to-own products are priced PER MONTH — read price.description before quoting any figure.',
          products: page.map((p) => toAgentProduct(p)),
        },
        { cacheSeconds: 300, extraHeaders: headers },
      )
    } catch (err) {
      console.error('[agent-api] search failed:', err)
      return agentError('search_unavailable', 'Product search is temporarily unavailable.', 503, 'Retry shortly.', headers)
    }
  })
}
