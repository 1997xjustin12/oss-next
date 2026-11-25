import { hasAdminAccess } from '@/lib/adminGuard'
import { getChatGptFeedFile } from '@/services/feed.service'

/**
 * GET /admin/product-feeds/chatgpt.parquet
 *
 * The same file as the public /api/feeds/chatgpt.parquet, sent as a download
 * (dated filename) for OpenAI's manual upload.
 *
 * A Route Handler is its own endpoint, so the admin layout does not cover it:
 * the proxy 404s /admin for non-admins, and this re-checks (CLAUDE.md, the
 * three admin layers). Reading the admin cookie also keeps it out of the build.
 */
export async function GET() {
  if (!(await hasAdminAccess())) return new Response('Not Found', { status: 404 })

  try {
    const { file, count, generatedAt } = await getChatGptFeedFile()
    return new Response(file, {
      headers: {
        'Content-Type': 'application/vnd.apache.parquet',
        'Content-Disposition': `attachment; filename="onsitestorage-chatgpt-feed-${generatedAt.slice(0, 10)}.parquet"`,
        'Content-Length': String(file.byteLength),
        'Cache-Control': 'private, no-store',
        'X-Feed-Item-Count': String(count),
      },
    })
  } catch (err) {
    console.error('[admin/product-feeds] chatgpt.parquet failed:', err)
    return new Response('The product data is temporarily unavailable. Try again in a minute.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    })
  }
}
