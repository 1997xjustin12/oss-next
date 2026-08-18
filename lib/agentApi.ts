import { getRedisClient } from '@/lib/redis'
import { STORE_KEY } from '@/config/store'
import {
  DEFAULT_RATE_LIMIT_BUCKET,
  RATE_LIMIT_BUCKETS,
  type RateLimitBucket,
} from '@/config/rateLimits'
import { clientIdentity } from '@/lib/clientIp'

/**
 * Shared plumbing for the public agent API (`/api/agent/v1/*`).
 *
 * The existing `/api/search` is an InstantSearch *transport* — a POST taking
 * `{requests:[{indexName, params:{...}}]}`. It works, but no agent will ever
 * discover or use it correctly, and it isn't a contract we'd want to keep
 * stable. These routes are the opposite: boring GETs, flat JSON, no envelope,
 * documented in `/openapi.json`, and versioned in the path.
 *
 * Approved 2026-08-10 (decision D2): public, no auth, rate-limited. The same
 * data is already public in the Merchant feed and on every PDP, so this is a
 * convenience question rather than a disclosure one.
 */

/** Version lives in the path. Bump the folder, not this constant, to add a v2. */
export const AGENT_API_VERSION = 'v1'
export const AGENT_API_BASE = `/api/agent/${AGENT_API_VERSION}`

/** Deprecation policy, surfaced in every response header and in the OpenAPI doc. */
export const AGENT_API_SUNSET_POLICY =
  'Versioned in the path. A version stays available for at least 6 months after its successor ships.'

// ─── Responses ───────────────────────────────────────────────────────────────

type JsonOptions = {
  /** Seconds for `s-maxage`. Match the underlying cacheLife. */
  cacheSeconds?: number
  status?: number
  extraHeaders?: Record<string, string>
}

export function agentJson(data: unknown, options: JsonOptions = {}): Response {
  const { cacheSeconds = 300, status = 200, extraHeaders = {} } = options

  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control':
        status === 200
          ? `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}, stale-while-revalidate=86400`
          : 'no-store',
      // CORS: the data is public, and a browser-based agent is a legitimate
      // consumer. GET only, so there is nothing to protect with a preflight.
      'Access-Control-Allow-Origin': '*',
      'X-Api-Version': AGENT_API_VERSION,
      ...extraHeaders,
    },
  })
}

/**
 * Errors carry a machine-readable `code` and a `hint` written for a model.
 * A bare 400 teaches an agent nothing; "zip must be 5 digits" gets it right
 * on the retry.
 */
export function agentError(
  code: string,
  message: string,
  status: number,
  hint?: string,
  extraHeaders: Record<string, string> = {},
): Response {
  return agentJson({ error: { code, message, ...(hint ? { hint } : {}) } }, { status, extraHeaders })
}

// ─── Rate limiting ───────────────────────────────────────────────────────────

/**
 * Fixed-window counter per client per minute.
 *
 * Fixed window rather than sliding: it is one INCR plus one EXPIRE, which
 * matters when the whole point of the endpoint is to be cheap. The burst edge
 * of a fixed window is acceptable for a public read API — the limit exists to
 * stop a runaway loop, not to meter a paid product.
 *
 * Fails **open**. If Redis is unreachable, serving an unlimited amount of
 * already-public data is a smaller problem than a broken API.
 */
export type RateLimitResult = {
  allowed: boolean
  limit: number
  remaining: number
  /** Seconds until the current window resets. */
  resetSeconds: number
}

// Shared with the chat proxy, so the address we throttle on is the same one the
// backend is told about. See lib/clientIp.ts.
function clientId(request: Request): string {
  return clientIdentity(request) ?? 'unknown'
}

export async function checkRateLimit(
  request: Request,
  bucket: RateLimitBucket = DEFAULT_RATE_LIMIT_BUCKET,
  now: Date = new Date(),
): Promise<RateLimitResult> {
  const limit = RATE_LIMIT_BUCKETS[bucket]
  const windowStart = Math.floor(now.getTime() / 60_000)
  const resetSeconds = 60 - (Math.floor(now.getTime() / 1000) % 60)
  // The bucket is part of the key, so each budget is counted independently.
  const key = `oss-next:${STORE_KEY}:ratelimit:${bucket}:${clientId(request)}:${windowStart}`

  try {
    const redis = getRedisClient()
    const count = await redis.incr(key)
    // Only the first request in a window needs the TTL; setting it every time
    // would keep pushing the expiry out and turn the window into a rolling one.
    if (count === 1) await redis.expire(key, 120)

    return {
      allowed: count <= limit,
      limit,
      remaining: Math.max(0, limit - count),
      resetSeconds,
    }
  } catch {
    return { allowed: true, limit, remaining: limit, resetSeconds }
  }
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.resetSeconds),
  }
}

/**
 * Wraps a handler with rate limiting.
 *
 * Returns 429 with `Retry-After` — an agent that respects it backs off
 * correctly, which is the entire reason the header exists.
 */
export async function withRateLimit(
  request: Request,
  handler: (headers: Record<string, string>) => Promise<Response>,
  bucket: RateLimitBucket = DEFAULT_RATE_LIMIT_BUCKET,
): Promise<Response> {
  const result = await checkRateLimit(request, bucket)
  const headers = rateLimitHeaders(result)

  if (!result.allowed) {
    return agentError(
      'rate_limited',
      `Rate limit of ${result.limit} requests per minute exceeded.`,
      429,
      `Wait ${result.resetSeconds} seconds and retry. For a higher limit, contact the address in /llms.txt.`,
      // The limit headers matter most on the response that enforces them, and
      // Retry-After is what a well-behaved agent actually backs off on.
      { ...headers, 'Retry-After': String(result.resetSeconds) },
    )
  }

  return handler(headers)
}
