import { NextRequest, NextResponse } from 'next/server'
import { resetPassword } from '@/services/user.service'
import { authRateLimited } from '@/lib/authRateLimit'
import { rateLimitedReply } from '@/lib/backendError'

export async function POST(request: NextRequest) {
  const limited = await authRateLimited(request)
  if (limited) return limited

  const { token, uidb64, newPassword } = await request.json().catch(() => ({}))

  if (!token || !uidb64 || !newPassword) {
    return NextResponse.json({ error: 'Token, uidb64, and new password are required.' }, { status: 400 })
  }

  try {
    await resetPassword(token, uidb64, newPassword)
    return NextResponse.json({ ok: true })
  } catch (err) {
    // The backend's 429 travels as itself, with its message and Retry-After.
    const limited = rateLimitedReply(err)
    if (limited) return limited
    const message = err instanceof Error ? err.message : 'Could not reset password. The link may have expired.'
    console.error('[/api/reset-password]', err)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
