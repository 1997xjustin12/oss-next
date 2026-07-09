import { NextRequest, NextResponse } from 'next/server'
import { updateCart } from '@/services/cart.service'

export async function PUT(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  const body = await request.json().catch(() => ({}))

  try {
    const data = await updateCart(body, token)
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not update cart.'
    console.error('[/api/cart/update]', err)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
