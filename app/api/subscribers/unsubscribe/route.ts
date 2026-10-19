import { NextRequest, NextResponse } from 'next/server'
import { unsubscribeFromNewsletter } from '@/services/subscriber.service'
import { rateLimitedReply } from '@/lib/backendError'

export async function POST(request: NextRequest) {
  const { email } = await request.json().catch(() => ({}))

  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
  }

  try {
    await unsubscribeFromNewsletter(email)
    return NextResponse.json({ ok: true })
  } catch (err) {
    // The backend's 429 travels as itself, with its message and Retry-After.
    const limited = rateLimitedReply(err)
    if (limited) return limited
    const message = err instanceof Error ? err.message : 'Could not unsubscribe. Please try again.'
    console.error('[/api/subscribers/unsubscribe]', err)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
