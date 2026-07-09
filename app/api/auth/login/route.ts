import { NextRequest, NextResponse } from 'next/server'
import { loginUser } from '@/services/user.service'

export async function POST(request: NextRequest) {
  const { username, password } = await request.json()

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 })
  }

  try {
    const session = await loginUser(username, password)
    const response = NextResponse.json(session)

    // Non-httpOnly flag cookie so middleware can gate protected routes
    // without decoding the session token.
    response.cookies.set('isLoggedIn', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed. Please try again.'
    console.error('[/api/auth/login]', err)
    return NextResponse.json({ error: message }, { status: 401 })
  }
}
