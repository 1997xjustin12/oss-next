import { NextRequest, NextResponse } from 'next/server'
import { createProductReview } from '@/services/review.service'
import { rateLimitedReply } from '@/lib/backendError'
import type { CreateReviewPayload } from '@/services/review.service'

export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  const payload = (await request.json().catch(() => null)) as Partial<CreateReviewPayload> | null

  if (!payload?.product || !payload.rating || !payload.title || !payload.comment) {
    return NextResponse.json({ error: 'Product, rating, title, and comment are required.' }, { status: 400 })
  }

  try {
    const review = await createProductReview(payload as CreateReviewPayload, token)
    return NextResponse.json(review)
  } catch (err) {
    // The backend's 429 travels as itself, with its message and Retry-After.
    const limited = rateLimitedReply(err)
    if (limited) return limited
    const message = err instanceof Error ? err.message : 'Could not submit review.'
    console.error('[/api/reviews/create]', err)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
