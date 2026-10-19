import { checkRateLimit, rateLimitHeaders } from '@/lib/agentApi'

/**
 * This site's own limit on its sign-in, lost-password and reset-password
 * routes: the `auth` bucket in config/rateLimits.ts, per visitor, per minute.
 *
 * Recommended by the backend's rate-limit checklist (2026-10-18). The backend
 * locks an account after repeated wrong passwords, but only once the attempts
 * reach it; this turns a password-guessing script away at the door, and keeps
 * a looping form from tripping the customer's own lockout.
 *
 * Returns the 429 to send, or null to carry on. Allows the request when Redis
 * cannot be reached, like every limiter here.
 */
export async function authRateLimited(request: Request): Promise<Response | null> {
  const result = await checkRateLimit(request, 'auth')
  if (result.allowed) return null

  return Response.json(
    { error: 'Too many attempts. Please wait a minute and try again.' },
    {
      status: 429,
      headers: {
        'Cache-Control': 'no-store',
        'Retry-After': String(result.resetSeconds),
        ...rateLimitHeaders(result),
      },
    },
  )
}
