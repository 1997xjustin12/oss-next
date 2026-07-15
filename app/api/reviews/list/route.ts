import { NextRequest, NextResponse } from 'next/server'
import { listProductReviews } from '@/services/review.service'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const productId = searchParams.get('product_id')
  const page = Number(searchParams.get('page') ?? '1')

  if (!productId) {
    return NextResponse.json({ error: 'product_id is required.' }, { status: 400 })
  }

  try {
    const data = await listProductReviews(productId, page)
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not load reviews.'
    console.error('[/api/reviews/list]', err)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
