import { createHash } from 'node:crypto'
import { getRedisClient } from '@/lib/redis'
import type { GetOrderTotalPayload } from '@/types/order'

/**
 * Limits how often the storefront makes the backend price an order.
 *
 * Pricing a container calls Google's Distance Matrix on the backend, which is
 * billed per request. One ordinary checkout used to send 11 identical pricing
 * requests (2026-09-15): reloads, the cart-to-checkout hop and method switches
 * all asked again. The backend is not ours to change, so this layer:
 *
 * - caches each answer briefly, shared by every visitor, so the same question
 *   (same products and quantities, ZIP, country, method) is asked once;
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

/** Long enough to cover a visit from cart to checkout; short enough for price edits to show. */
const CACHE_TTL_SECONDS = 20 * 60

/** A real visit sends a handful per minute; this only stops floods. */
const RATE_LIMIT = 30
const RATE_WINDOW_SECONDS = 60

export type CachedTotalReply = { status: number; body: unknown }

function redisOrNull() {
  try {
    return getRedisClient()
  } catch {
    return null
  }
}

/**
 * The cache key for a pricing request: only what the backend prices from. Item
 * order is ignored, and the key is hashed so no customer detail sits in Redis.
 */
export function orderTotalCacheKey(payload: GetOrderTotalPayload): string {
  const items = (payload.items ?? [])
    .map((item) => `${item.product_id}x${item.quantity}`)
    .sort()
    .join(',')
  const raw = [
    items,
    (payload.shipping_zip_code ?? '').trim().toUpperCase(),
    (payload.shipping_country ?? '').trim().toUpperCase(),
    payload.shipping_method ?? '',
    // Part of the key because they are part of the question: the backend
    // geocodes from city and state, so two addresses sharing a cached answer
    // would be two addresses quoted the same distance. Safe to include — the
    // key is hashed, so the street never sits in Redis in the clear.
    (payload.shipping_address_1 ?? '').trim().toUpperCase(),
    (payload.shipping_address_2 ?? '').trim().toUpperCase(),
    (payload.shipping_city ?? '').trim().toUpperCase(),
    (payload.shipping_state ?? '').trim().toUpperCase(),
  ].join('|')
  return `${KEY_PREFIX}get-total:${createHash('sha256').update(raw).digest('hex').slice(0, 40)}`
}

export async function readCachedTotal(key: string): Promise<CachedTotalReply | null> {
  const redis = redisOrNull()
  if (!redis) return null
  try {
    return (await redis.get<CachedTotalReply>(key)) ?? null
  } catch (err) {
    console.error('[pricingGuard] cache read failed:', err)
    return null
  }
}

export async function writeCachedTotal(key: string, reply: CachedTotalReply): Promise<void> {
  const redis = redisOrNull()
  if (!redis) return
  try {
    await redis.set(key, reply, { ex: CACHE_TTL_SECONDS })
  } catch (err) {
    console.error('[pricingGuard] cache write failed:', err)
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
    const count = await redis.incr(key)
    if (count === 1) await redis.expire(key, RATE_WINDOW_SECONDS)
    return count > RATE_LIMIT
  } catch (err) {
    console.error('[pricingGuard] rate limit check failed:', err)
    return false
  }
}
