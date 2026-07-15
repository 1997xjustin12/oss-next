import { NextRequest, NextResponse } from 'next/server'
import { changePassword } from '@/services/user.service'

export async function PUT(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  const { oldPassword, newPassword } = await request.json().catch(() => ({}))

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  }

  if (!oldPassword || !newPassword) {
    return NextResponse.json({ error: 'Old and new password are required.' }, { status: 400 })
  }

  try {
    await changePassword(token, oldPassword, newPassword)
    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not change password. Please try again.'
    console.error('[/api/auth/change-password]', err)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
