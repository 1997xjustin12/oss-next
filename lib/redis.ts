import { Redis } from '@upstash/redis'

// Same Upstash instance as the reference app — every key this app writes
// must stay under its own prefix (see services/abandonedCart.service.ts)
// so it can't collide with the reference app's own keys in that instance.
let client: Redis | null = null

/** Longest a single Redis command (retry included) may take before it fails. */
const REDIS_TIMEOUT_MS = 3_000

export function getRedisClient(): Redis {
  const url = process.env.NEXT_UPSTASH_REDIS_REST_URL
  const token = process.env.NEXT_UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    throw new Error('Upstash Redis is not configured — missing NEXT_UPSTASH_REDIS_REST_URL/NEXT_UPSTASH_REDIS_REST_TOKEN.')
  }

  // The client refuses a bare host ("kv.onsitestorage.com") as an invalid URL,
  // which silently disabled every Redis feature after the 2026-10 database
  // switch. Accept the host alone; the REST API is only ever served over https.
  client ??= new Redis({
    url: /^https?:\/\//i.test(url) ? url : `https://${url}`,
    token,
    // Every caller has a fallback, so failing fast beats waiting. The default —
    // 5 retries, exponential backoff, no timeout — kept the proxy's maintenance
    // check and every Redis-backed cached read waiting about 4 s (or until the
    // platform timeout) per call whenever Redis was unreachable.
    retry: { retries: 1, backoff: () => 100 },
    // A fresh signal per command, covering its retry too. Upstash throws when a
    // function-supplied signal aborts, which the callers already catch.
    signal: () => AbortSignal.timeout(REDIS_TIMEOUT_MS),
  })
  return client
}

/**
 * A cached page read from Redis: one GET, one more try after a short pause,
 * and a hard deadline over both that does not depend on the client's own
 * per-command abort.
 *
 * The build prerenders every GBP and location page at once, and Next fails the
 * whole build when a `'use cache'` fill takes over 50 s ("Filling a cache
 * during prerender timed out"). That happened once on a local build
 * (2026-11-16, getGbpTemplate) although each command is capped at 3 s; the
 * cause was not found. With this deadline a stalled read rejects, and the
 * caller's fallback (the snapshot, else the code seed) renders the page.
 */
const PAGE_READ_DEADLINE_MS = 10_000

export async function getWithRetry<T = unknown>(key: string): Promise<T | null> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Redis read of ${key} exceeded ${PAGE_READ_DEADLINE_MS} ms`)), PAGE_READ_DEADLINE_MS)
  })
  const read = (async () => {
    try {
      return await getRedisClient().get<T>(key)
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 400))
      return getRedisClient().get<T>(key)
    }
  })()
  // The losing read may still reject later; that must not surface as unhandled.
  read.catch(() => {})
  try {
    return await Promise.race([read, deadline])
  } finally {
    clearTimeout(timer)
  }
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
