import { NextResponse } from 'next/server'
import { cartNoticeMode } from '@/lib/cartNotice'

/**
 * GET /api/cart-notice → { mode: 'modal' | 'toast' }
 *
 * Which add-to-cart confirmation the storefront shows (Admin → Cart Notice).
 * CartProvider fetches it after mount. It used to be read in the root layout,
 * which tied every page shell on the site to Redis: a Redis outage regenerated
 * them all. The answer only matters at the moment something is added, so it
 * can arrive after the page.
 *
 * Public and identical for everyone, so the CDN answers it: a flip in the
 * admin reaches visitors within a minute or so.
 */
export async function GET() {
  const mode = await cartNoticeMode()
  return NextResponse.json(
    { mode },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } },
  )
}
