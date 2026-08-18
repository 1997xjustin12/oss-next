import { connection } from 'next/server'
import { getAllProductsForFeed } from '@/services/search.service'
import { toAgentProduct } from '@/lib/agentProduct'
import { isGenericDisplayHit } from '@/lib/pricing'
import { SITE } from '@/config/site'
import type { ProductHit } from '@/types/product'

/**
 * GET /api/feeds/products.jsonl — the whole catalog as JSON Lines.
 *
 * The Merchant feed (`/api/feeds/google.xml`) exists for Google Shopping and is
 * shaped by its rules: RSS 2.0, the `g:` namespace, and a `g:price` that means
 * a one-time price whether or not the product has one. That is the right shape
 * for Merchant Center and the wrong shape for everything else.
 *
 * This is the same catalog in the shape the agent API already uses — every
 * price an object carrying its own `basis`, `description`, `asOf` and
 * `validUntil`, so a monthly figure can't be mistaken for a purchase price.
 *
 * ## Why JSON Lines rather than one JSON array
 *
 * ~10,000 products is roughly 15MB. One array means the producer buffers it all
 * and the consumer parses it all before seeing a single record. JSON Lines
 * streams: one product per line, parse as they arrive, stop whenever you have
 * enough. It also survives truncation — a cut-off array is unparseable, a
 * cut-off JSONL file is just shorter.
 *
 * The first line is a header record (`{"type":"header",…}`) carrying the
 * generation timestamp and count, so a consumer knows what it's reading and how
 * fresh it is before parsing 10,000 products.
 */

/** Cap on a single page. Omit `limit` to get the whole catalog. */
const MAX_LIMIT = 5000

export async function GET(request: Request) {
  // Same reasoning as the Merchant feed: the underlying scan is ~10k
  // Elasticsearch documents and far exceeds the prerender cache timeout, and
  // there is nothing to gain from building this at deploy time.
  await connection()

  const params = new URL(request.url).searchParams
  const offset = Math.max(0, Math.trunc(Number(params.get('offset') ?? 0)) || 0)
  const rawLimit = params.get('limit')
  const limit = rawLimit === null ? null : Math.min(MAX_LIMIT, Math.max(1, Math.trunc(Number(rawLimit)) || 1))

  let products: ProductHit[]
  try {
    products = (await getAllProductsForFeed()) as unknown as ProductHit[]
  } catch (err) {
    console.error('[feeds] products.jsonl failed:', err)
    return new Response(JSON.stringify({ error: 'Product feed is temporarily unavailable.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    })
  }

  const now = new Date()
  const all = products.filter((hit) => !isGenericDisplayHit(hit) && hit.handle)
  const usable = limit === null ? all.slice(offset) : all.slice(offset, offset + limit)

  const nextOffset = offset + usable.length

  const header = {
    type: 'header',
    site: SITE.name,
    generatedAt: now.toISOString(),
    total: all.length,
    count: usable.length,
    offset,
    ...(nextOffset < all.length ? { nextOffset } : {}),
    format: 'json-lines',
    note: 'One product per line after this header. Prices are objects: read price.description, never price.amount alone — rental and rent-to-own products are priced PER MONTH.',
    // Pagination reduces the bytes you transfer, not the time we take: the
    // upstream scan reads the whole catalog either way (see the caching note in
    // xml.md). Fetch once and page through your own copy rather than polling.
    paginationNote:
      '?offset= and ?limit= slice the catalog. Every request costs the same upstream work, so prefer one full pull over many small ones.',
    docs: `${SITE.url}/openapi.json`,
  }

  // Built as a stream so neither the server nor the consumer has to hold ~15MB
  // at once — the point of choosing JSON Lines in the first place.
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(JSON.stringify(header) + '\n'))
      for (const hit of usable) {
        controller.enqueue(encoder.encode(JSON.stringify(toAgentProduct(hit, now)) + '\n'))
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      // The registered media type for JSON Lines.
      'Content-Type': 'application/jsonl; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
