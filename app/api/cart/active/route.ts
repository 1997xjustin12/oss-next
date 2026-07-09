import { NextRequest, NextResponse } from 'next/server'
import { getActiveCart } from '@/services/cart.service'

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')

  try {
    const data = await getActiveCart(token)
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not load cart.'
    console.error('[/api/cart/active]', err)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
