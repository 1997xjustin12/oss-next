import { NextRequest, NextResponse } from 'next/server'
import { listProductReviews } from '@/services/review.service'
import { rateLimitedReply } from '@/lib/backendError'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  // Optional — omit for a site-wide feed (used by the homepage), matching
  // the confirmed reference-app contract in docs/reference/REVIEWS_FLOW.md.
  const productId = searchParams.get('product_id') ?? undefined
  const page = Number(searchParams.get('page') ?? '1')

  try {
    const data = await listProductReviews(productId, page)
    return NextResponse.json(data)
  } catch (err) {
    // The backend's 429 travels as itself, with its message and Retry-After.
    const limited = rateLimitedReply(err)
    if (limited) return limited
    const message = err instanceof Error ? err.message : 'Could not load reviews.'
    console.error('[/api/reviews/list]', err)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
