import { NextRequest, NextResponse } from 'next/server'
import { subscribeToNewsletter } from '@/services/subscriber.service'
import { rateLimitedReply } from '@/lib/backendError'
import { isRecaptchaConfigured, verifyRecaptcha } from '@/lib/recaptcha'

/** Loose on purpose: the backend is the authority; this only stops obvious junk. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function POST(request: NextRequest) {
  const { email, recaptchaToken } = (await request.json().catch(() => ({}))) as {
    email?: unknown
    recaptchaToken?: unknown
  }

  const address = typeof email === 'string' ? email.trim().slice(0, 254) : ''
  if (!address) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
  }
  if (!EMAIL.test(address)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  // A public form that writes to the backend: same bot check as login,
  // register and checkout, once a reCAPTCHA key is configured.
  if (isRecaptchaConfigured() && !(await verifyRecaptcha(typeof recaptchaToken === 'string' ? recaptchaToken : '', 'newsletter'))) {
    return NextResponse.json({ error: 'We could not verify this request. Please try again.' }, { status: 400 })
  }

  try {
    await subscribeToNewsletter(address)
    return NextResponse.json({ ok: true })
  } catch (err) {
    // The backend's 429 travels as itself, with its message and Retry-After.
    const limited = rateLimitedReply(err)
    if (limited) return limited
    const message = err instanceof Error ? err.message : 'Could not subscribe. Please try again.'
    console.error('[/api/subscribers/subscribe]', err)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
