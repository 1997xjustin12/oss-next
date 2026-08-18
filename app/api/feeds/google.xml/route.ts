import { connection } from 'next/server'
import { getAllProductsForFeed } from '@/services/search.service'
import { buildMerchantFeed } from '@/lib/googleFeed'
import { BASE_URL } from '@/lib/helpers'

/**
 * Google Merchant Center product feed (RSS 2.0 + g: namespace).
 *
 *   GET /api/feeds/google.xml
 *
 * Generated from Elasticsearch product data — real title/price/image/
 * availability/condition per item, which the sitemap feed can't provide.
 * Covers every purchasable product (generic/display-only pages, and anything
 * missing an image or price, are skipped). Rental/RTO items carry their monthly
 * rate as the price, labelled as such in the title/description.
 *
 * The heavy ES fetch is cached hourly via getAllProductsForFeed()'s
 * 'use cache'; the response is CDN-cacheable so Merchant's scheduled fetch is cheap.
 */

const origin = BASE_URL.replace(/\/+$/, '')
const CACHE_SECONDS = 3600

/**
 * Not prerendered at build.
 *
 * getAllProductsForFeed() scans ~10,000 Elasticsearch documents and currently
 * takes ~40s cold — past the point where Next's `use cache` gives up during
 * prerendering, which failed the build with USE_CACHE_TIMEOUT. Prerendering
 * bought nothing anyway: Merchant Center fetches this on its own schedule, not
 * at deploy time, and the result would be stale the moment a price changed.
 *
 * The data function keeps its hourly `'use cache'`, so the 40s is paid at most
 * once an hour at runtime instead of once per build. Deploy platforms need a
 * function timeout above that for the first cold request — see xml.md.
 *
 * `connection()` rather than `export const dynamic` — the latter is rejected
 * outright under `cacheComponents`. Awaiting it is the supported way to say
 * "wait for a real request before doing this work", which stops prerendering
 * exactly here.
 */
export async function GET() {
  await connection()

  const products = await getAllProductsForFeed()
  const xml = buildMerchantFeed(products, origin)

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=86400`,
    },
  })
}
