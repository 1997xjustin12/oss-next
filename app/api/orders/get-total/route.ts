import { NextRequest, NextResponse } from 'next/server'
import { ShippingRefusedError } from '@/lib/shippingQuote'
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
    // An expected answer, not a fault: `code` lets the page tell "we can't
    // deliver there" apart from a failed request.
    if (err instanceof ShippingRefusedError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: 400 })
    }
    const message = err instanceof Error ? err.message : 'Could not calculate order total.'
    console.error('[/api/orders/get-total]', err)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
