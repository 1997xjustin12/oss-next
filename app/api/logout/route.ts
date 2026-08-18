import { NextResponse } from 'next/server'
import { ADMIN_COOKIE, adminCookieOptions } from '@/lib/adminSession'

export async function POST() {
  const response = NextResponse.json({ ok: true })

  response.cookies.set('isLoggedIn', '', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })

  // Cleared unconditionally — this endpoint has no idea whether the caller had
  // one, and clearing a cookie that was never set costs nothing. Attributes
  // must match the ones it was issued with or the browser keeps the original.
  response.cookies.set(ADMIN_COOKIE, '', adminCookieOptions(0))

  return response
}
