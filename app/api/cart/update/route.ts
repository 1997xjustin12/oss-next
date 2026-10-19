import { NextRequest, NextResponse } from 'next/server'
import { updateCart } from '@/services/cart.service'
import { rateLimitedReply } from '@/lib/backendError'

export async function PUT(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  const body = await request.json().catch(() => ({}))

  try {
    const data = await updateCart(body, token)
    return NextResponse.json(data)
  } catch (err) {
    // The backend's 429 travels as itself, with its message and Retry-After.
    const limited = rateLimitedReply(err)
    if (limited) return limited
    const message = err instanceof Error ? err.message : 'Could not update cart.'
    console.error('[/api/cart/update]', err)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
