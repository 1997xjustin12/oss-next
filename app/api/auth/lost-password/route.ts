import { NextRequest, NextResponse } from 'next/server'
import { requestPasswordReset } from '@/services/user.service'

export async function POST(request: NextRequest) {
  const { email } = await request.json().catch(() => ({}))

  if (!email) {
    return NextResponse.json({ error: 'Email address is required.' }, { status: 400 })
  }

  try {
    await requestPasswordReset(email)
    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not send reset link. Please try again.'
    console.error('[/api/auth/lost-password]', err)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
