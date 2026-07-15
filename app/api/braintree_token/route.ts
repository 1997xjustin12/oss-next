import { NextResponse } from 'next/server'
import { getBraintreeClientToken } from '@/services/payment.service'

export async function GET() {
  try {
    const clientToken = await getBraintreeClientToken()
    return NextResponse.json({ clientToken })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not generate payment token.'
    console.error('[/api/braintree_token]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
