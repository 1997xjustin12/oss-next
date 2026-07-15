import { NextRequest, NextResponse } from 'next/server'
import { updateProductReview } from '@/services/review.service'
import type { CreateReviewPayload } from '@/services/review.service'

// The upstream contract is PUT /api/reviews/{id}/update — this local route
// has no [id] segment, so the id travels in the JSON body instead and gets
// pulled out here before building the upstream URL.
export async function PUT(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  const body = (await request.json().catch(() => ({}))) as Partial<CreateReviewPayload> & { id?: string | number }
  const { id, ...payload } = body

  if (!id) {
    return NextResponse.json({ error: 'Review id is required.' }, { status: 400 })
  }

  try {
    const review = await updateProductReview(id, payload, token)
    return NextResponse.json(review)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not update review.'
    console.error('[/api/reviews/update]', err)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
