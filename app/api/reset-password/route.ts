import { NextRequest, NextResponse } from 'next/server'
import { resetPassword } from '@/services/user.service'

export async function POST(request: NextRequest) {
  const { token, uidb64, newPassword } = await request.json().catch(() => ({}))

  if (!token || !uidb64 || !newPassword) {
    return NextResponse.json({ error: 'Token, uidb64, and new password are required.' }, { status: 400 })
  }

  try {
    await resetPassword(token, uidb64, newPassword)
    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not reset password. The link may have expired.'
    console.error('[/api/reset-password]', err)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
