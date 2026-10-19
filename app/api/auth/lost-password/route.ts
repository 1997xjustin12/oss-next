import { NextRequest, NextResponse } from 'next/server'
import { requestPasswordReset } from '@/services/user.service'
import { authRateLimited } from '@/lib/authRateLimit'
import { rateLimitedReply } from '@/lib/backendError'

export async function POST(request: NextRequest) {
  const limited = await authRateLimited(request)
  if (limited) return limited

  const { email } = await request.json().catch(() => ({}))

  if (!email) {
    return NextResponse.json({ error: 'Email address is required.' }, { status: 400 })
  }

  try {
    await requestPasswordReset(email)
    return NextResponse.json({ ok: true })
  } catch (err) {
    // The backend's 429 travels as itself, with its message and Retry-After.
    const limited = rateLimitedReply(err)
    if (limited) return limited
    const message = err instanceof Error ? err.message : 'Could not send reset link. Please try again.'
    console.error('[/api/auth/lost-password]', err)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
