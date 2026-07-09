import { NextRequest, NextResponse } from 'next/server'
import { closeCart } from '@/services/cart.service'

export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')

  try {
    const data = await closeCart(token)
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not close cart.'
    console.error('[/api/cart/close]', err)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
