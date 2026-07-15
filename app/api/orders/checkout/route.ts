import { NextRequest, NextResponse } from 'next/server'
import { checkoutOrder } from '@/services/order.service'
import type { CheckoutPayload } from '@/types/order'

export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  const payload = (await request.json().catch(() => null)) as CheckoutPayload | null

  if (!payload?.items?.length) {
    return NextResponse.json({ error: 'At least one cart item is required.' }, { status: 400 })
  }

  try {
    const order = await checkoutOrder(payload, token)
    return NextResponse.json(order)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not complete checkout.'
    console.error('[/api/orders/checkout]', err)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
