import { NextRequest, NextResponse } from 'next/server'
import { refreshAccessToken } from '@/services/user.service'
import { rateLimitedReply } from '@/lib/backendError'

export async function POST(request: NextRequest) {
  const { refreshToken } = await request.json().catch(() => ({}))

  if (!refreshToken) {
    return NextResponse.json({ error: 'Refresh token is required.' }, { status: 400 })
  }

  try {
    const access = await refreshAccessToken(refreshToken)
    return NextResponse.json({ access })
  } catch (err) {
    // The backend's 429 travels as itself, with its message and Retry-After.
    const limited = rateLimitedReply(err)
    if (limited) return limited
    const message = err instanceof Error ? err.message : 'Could not refresh session.'
    console.error('[/api/refresh]', err)
    return NextResponse.json({ error: message }, { status: 401 })
  }
}
