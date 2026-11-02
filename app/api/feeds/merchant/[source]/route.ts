import { connection } from 'next/server'
import { MERCHANT_FEED_SOURCES } from '@/config/merchantFeeds'
import { isMerchantFeedStorageConfigured, openMerchantFeed } from '@/services/merchantFeed.service'

/**
 * One Google Merchant feed, as last generated (services/merchantFeed.service.ts).
 * Merchant Center fetches it at the old WordPress URL, which next.config.ts rewrites
 * here: see config/merchantFeeds.ts.
 *
 * Streamed, because the rent-to-own file is around 15 MB. 503 rather than 404 while
 * nothing can be read: the feed exists, it is just not available right now.
 */

type Props = { params: Promise<{ source: string }> }

// Short, so a fresh run reaches Merchant soon after it finishes.
const CACHE_SECONDS = 300

const unavailable = (message: string) =>
  new Response(message, { status: 503, headers: { 'Retry-After': '3600', 'Cache-Control': 'no-store' } })

export async function GET(_request: Request, { params }: Props) {
  await connection()
  const { source } = await params
  const known = MERCHANT_FEED_SOURCES.find((s) => s.source === source)
  if (!known) return new Response('Not found', { status: 404 })
  if (!isMerchantFeedStorageConfigured()) return unavailable('This feed has not been generated yet.')

  try {
    const feed = await openMerchantFeed(known.source)
    if (!feed) return unavailable('This feed has not been generated yet.')
    return new Response(feed.body, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Last-Modified': feed.uploadedAt.toUTCString(),
        'Cache-Control': `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}`,
      },
    })
  } catch (err) {
    console.error(`[merchant-feeds] ${source} could not be read:`, err)
    return unavailable('This feed is unavailable just now.')
  }
}
