import { NextRequest, NextResponse } from 'next/server'
import { subscribeToNewsletter } from '@/services/subscriber.service'
import { rateLimitedReply } from '@/lib/backendError'

export async function POST(request: NextRequest) {
  const { email } = await request.json().catch(() => ({}))

  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
  }

  try {
    await subscribeToNewsletter(email)
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
