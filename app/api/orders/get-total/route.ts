import { NextRequest, NextResponse } from 'next/server'
import { getOrderTotal } from '@/services/order.service'
import type { GetOrderTotalPayload } from '@/types/order'

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => null)) as GetOrderTotalPayload | null

  if (!payload?.items?.length) {
    return NextResponse.json({ error: 'At least one cart item is required.' }, { status: 400 })
  }

  try {
    const total = await getOrderTotal(payload)
    return NextResponse.json(total)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not calculate order total.'
    console.error('[/api/orders/get-total]', err)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
