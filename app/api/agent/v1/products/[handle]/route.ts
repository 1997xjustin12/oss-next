import { getProductByHandle } from '@/services/search.service'
import { agentError, agentJson, withRateLimit } from '@/lib/agentApi'
import { toAgentProduct, toAgentProductDetail } from '@/lib/agentProduct'
import type { ProductHit } from '@/types/product'

/**
 * GET /api/agent/v1/products/{handle}
 *
 * One product in full: price with its basis, specifications, FAQ, delivery
 * expectations, and the variants of the same physical container available at
 * other depots or on other payment terms.
 *
 * `relatedProducts` is genuinely useful here rather than filler. The catalog
 * models one physical container as many documents — same unit, different depot,
 * condition, grade or payment type — so "the 40ft high cube" an agent is asked
 * about is a family, and the right answer usually depends on which member the
 * customer's zip can actually be served from.
 */

/** Related listings returned inline. Enough to compare, not enough to bloat. */
const MAX_RELATED = 12

export async function GET(
  request: Request,
  { params }: { params: Promise<{ handle: string }> },
) {
  return withRateLimit(request, async (headers) => {
    const { handle } = await params

    if (!handle || handle.length > 200) {
      return agentError('invalid_handle', 'A product handle is required.', 400, undefined, headers)
    }

    let result
    try {
      result = await getProductByHandle(handle)
    } catch (err) {
      console.error('[agent-api] product lookup failed:', err)
      return agentError('lookup_unavailable', 'Product lookup is temporarily unavailable.', 503, 'Retry shortly.', headers)
    }

    if (!result) {
      return agentError(
        'not_found',
        `No product with handle "${handle}".`,
        404,
        'Handles come from /api/agent/v1/search — they are not guessable from a product name.',
        headers,
      )
    }

    const { product, related_products } = result

    return agentJson(
      {
        priceNote:
          'Rental and rent-to-own products are priced PER MONTH. Read price.description before quoting any figure.',
        product: toAgentProductDetail(product as ProductHit),
        relatedProducts: (related_products as ProductHit[]).slice(0, MAX_RELATED).map((p) => toAgentProduct(p)),
        relatedProductsNote:
          'The same physical container listed at other depots or on other payment terms. Use /api/agent/v1/availability to find which is deliverable to a given ZIP.',
      },
      { cacheSeconds: 900, extraHeaders: headers },
    )
  })
}
