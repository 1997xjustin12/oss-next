import { connection } from 'next/server'
import { chatRegion } from '@/lib/chatRegion'
import { withRateLimit } from '@/lib/agentApi'

/**
 * GET /api/chat/availability — may this visitor be shown the assistant?
 *
 * **A separate endpoint rather than a value computed during render.** The
 * storefront layout that mounts the widget is statically rendered across
 * thousands of pages; reading a geolocation header while rendering it would opt
 * every one of them into dynamic rendering — trading the whole site's static
 * generation for one button. A tiny per-session request is far cheaper.
 *
 * The answer is **advisory**. POST /api/chat enforces the same rule
 * independently, so a client that skips this call, caches it forever, or lies
 * about the result gains nothing.
 */
export async function GET(request: Request): Promise<Response> {
  await connection()

  return withRateLimit(
    request,
    async (headers) => {
      const { allowed, country } = chatRegion(request)

      return Response.json(
        { available: allowed, country },
        {
          // `private, no-store` is not optional. One cached `available: false`
          // served to a US shopper turns a regional restriction into an outage.
          headers: { 'Cache-Control': 'private, no-store', ...headers },
        },
      )
    },
    'light',
  )
}
