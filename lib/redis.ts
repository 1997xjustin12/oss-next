import { Redis } from '@upstash/redis'

// Same Upstash instance as the reference app — every key this app writes
// must stay under its own prefix (see services/abandonedCart.service.ts)
// so it can't collide with the reference app's own keys in that instance.
let client: Redis | null = null

export function getRedisClient(): Redis {
  const url = process.env.NEXT_UPSTASH_REDIS_REST_URL
  const token = process.env.NEXT_UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    throw new Error('Upstash Redis is not configured — missing NEXT_UPSTASH_REDIS_REST_URL/NEXT_UPSTASH_REDIS_REST_TOKEN.')
  }

  client ??= new Redis({ url, token })
  return client
}

/**
 * Count one event in a window that expires on its own, in ONE request.
 *
 * Every rate limiter here used to send `INCR`, then — on the first hit of a
 * window — a second request for `EXPIRE`. Pipelined with `EXPIRE … NX` (set the
 * TTL only if none is set), it is a single HTTP round trip every time, and the
 * window still never slides: NX leaves an existing expiry alone.
 *
 * Upstash bills bandwidth per request and response, so halving the requests on
 * the busiest keys is the point.
 */
export async function incrementWindow(key: string, ttlSeconds: number): Promise<number> {
  const [count] = await getRedisClient()
    .pipeline()
    .incr(key)
    .expire(key, ttlSeconds, 'NX')
    .exec<[number, number]>()
  return count
}
