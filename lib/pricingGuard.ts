import { createHash } from 'node:crypto'
import { getRedisClient, incrementWindow } from '@/lib/redis'

/**
 * Limits how often the storefront makes the backend price an order.
 *
 * Pricing a container calls Google's Distance Matrix on the backend, which is
 * billed per request. One ordinary checkout used to send 11 identical pricing
 * requests (2026-09-15): reloads, the cart-to-checkout hop and method switches
 * all asked again. The backend is not ours to change, so this layer:
 *
 * - caches each answer briefly, shared by every visitor, so the same question
 *   is asked once — that cache is `getCachedOrderTotal` in order.service, held
 *   in the platform's shared cache rather than Redis since 2026-10-19;
 * - rate-limits pricing per visitor, so a bot or a looping bug cannot use this
 *   site to run up the bill.
 *
 * Server-only. Everything fails open: with Redis missing or down, requests go
 * straight to the backend as before rather than breaking pricing. The charge at
 * Place Order never reads this cache — it re-prices fresh before taking money.
 */

// Shared Upstash instance: keep every key under this app's prefix
// (see services/abandonedCart.service.ts).
const KEY_PREFIX = 'oss-next:'

/** A real visit sends a handful per minute; this only stops floods. */
const RATE_LIMIT = 30
const RATE_WINDOW_SECONDS = 60

function redisOrNull() {
  try {
    return getRedisClient()
  } catch {
    return null
  }
}

/** The visitor's address as the platform reports it; 'unknown' when absent. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || request.headers.get('x-real-ip')?.trim() || 'unknown'
}

/**
 * True once this visitor has sent more than RATE_LIMIT pricing requests in the
 * current minute. A fixed window counted in Redis; allows the request whenever
 * Redis cannot be reached.
 */
export async function isOverPricingRateLimit(ip: string): Promise<boolean> {
  const redis = redisOrNull()
  if (!redis) return false
  const window = Math.floor(Date.now() / 1000 / RATE_WINDOW_SECONDS)
  const key = `${KEY_PREFIX}rl:get-total:${createHash('sha256').update(ip).digest('hex').slice(0, 24)}:${window}`
  try {
    return (await incrementWindow(key, RATE_WINDOW_SECONDS)) > RATE_LIMIT
  } catch (err) {
    console.error('[pricingGuard] rate limit check failed:', err)
    return false
  }
}
