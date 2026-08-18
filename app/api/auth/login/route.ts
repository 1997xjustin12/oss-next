import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_SESSION_TTL_SECONDS } from '@/config/admin'
import { isAdminIdentity } from '@/lib/admin'
import { ADMIN_COOKIE, adminCookieOptions, signAdminToken } from '@/lib/adminSession'
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

    // The admin session, if this account is one of ours. Checked against the
    // identity the backend returned — never against the `username` the browser
    // submitted, which is unverified until loginUser() has accepted it.
    //
    // Both fields are offered because ADMIN_USERNAMES holds a mix of usernames
    // and email addresses, and an account may have been entered under either.
    if (isAdminIdentity(session.user.username, session.user.email)) {
      const token = await signAdminToken(session.user.username || session.user.email)
      if (token) {
        response.cookies.set(ADMIN_COOKIE, token, adminCookieOptions(ADMIN_SESSION_TTL_SECONDS))
      }
      // A null token means ADMIN_SESSION_SECRET is missing or too short.
      // signAdminToken has already logged it; the login itself still succeeds,
      // the user simply has no admin access. Failing the whole login here would
      // lock an admin out of their own storefront account over a config gap.
    }

    return response
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed. Please try again.'
    console.error('[/api/auth/login]', err)
    return NextResponse.json({ error: message }, { status: 401 })
  }
}
