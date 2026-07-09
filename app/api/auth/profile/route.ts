import { NextRequest, NextResponse } from 'next/server'
import { getUserProfile } from '@/services/user.service'

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  }

  try {
    const user = await getUserProfile(token)
    return NextResponse.json({ user })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not load account details.'
    console.error('[/api/auth/profile]', err)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
