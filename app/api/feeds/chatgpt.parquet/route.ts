import { connection } from 'next/server'
import { getChatGptFeedFile } from '@/services/feed.service'

/**
 * ChatGPT product feed (OpenAI's format, Parquet).
 *
 *   GET /api/feeds/chatgpt.parquet
 *
 * The URL for the "hosted URL" option in OpenAI's merchant portal, which
 * fetches it on its own schedule. Fields, and why rentals are in it, are in
 * lib/openaiFeed.ts. The same file is downloadable from Admin → Product Feeds.
 *
 * Public, like /api/feeds/google.xml: it carries only what the product pages
 * already show. The file is cached whole (services/feed.service.ts), and
 * Cloudflare may hold it for an hour, so OpenAI's fetches rarely reach the
 * server at all.
 *
 * `connection()` keeps it out of the build, for the same reason as the Google
 * feed: the catalog scan is far past the prerender cache timeout.
 */
export async function GET() {
  await connection()

  try {
    const { file, count, generatedAt } = await getChatGptFeedFile()
    return new Response(file, {
      headers: {
        'Content-Type': 'application/vnd.apache.parquet',
        'Content-Length': String(file.byteLength),
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
        'X-Feed-Item-Count': String(count),
        'X-Feed-Generated-At': generatedAt,
      },
    })
  } catch (err) {
    console.error('[feeds] chatgpt.parquet failed:', err)
    return new Response('Product feed is temporarily unavailable.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    })
  }
}
