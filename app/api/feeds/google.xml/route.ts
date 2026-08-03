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

export async function GET() {
  const products = await getAllProductsForFeed()
  const xml = buildMerchantFeed(products, origin)

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=86400`,
    },
  })
}
