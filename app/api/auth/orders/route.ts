import { NextRequest, NextResponse } from 'next/server'
import { listUserOrders } from '@/services/order.service'

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  }

  try {
    const orders = await listUserOrders(token)
    return NextResponse.json({ orders })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not load orders.'
    console.error('[/api/auth/orders]', err)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
