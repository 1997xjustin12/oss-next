import { NextRequest, NextResponse } from 'next/server'
import { chargeBraintreeCheckout } from '@/services/payment.service'
import { verifyRecaptcha } from '@/lib/recaptcha'

export async function POST(request: NextRequest) {
  const { nonce, amount, recaptchaToken } = await request.json().catch(() => ({}))

  if (!nonce || !amount) {
    return NextResponse.json({ error: 'Payment nonce and amount are required.' }, { status: 400 })
  }

  const recaptchaOk = await verifyRecaptcha(recaptchaToken)
  if (!recaptchaOk) {
    return NextResponse.json({ error: 'reCAPTCHA verification failed.' }, { status: 400 })
  }

  try {
    const transaction = await chargeBraintreeCheckout(nonce, amount)
    return NextResponse.json({ transaction })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Payment could not be processed.'
    console.error('[/api/braintree_checkout]', err)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
