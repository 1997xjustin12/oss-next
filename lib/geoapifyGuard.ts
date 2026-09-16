import { createHash } from 'node:crypto'
import { getRedisClient } from '@/lib/redis'

/**
 * Keeps address autocomplete inside Geoapify's daily allowance.
 *
 * Autocomplete is the one feature here that spends an external quota on
 * *keystrokes*. Three layers hold it down, in order of how much they save:
 *
 * 1. The shared result cache in `services/geoapify.service.ts` — `'use cache'`
 *    for days, keyed by the query. Every visitor typing "123 Peachtree" after
 *    the first costs nothing, and prefixes are re-typed constantly.
 * 2. This module's per-visitor rate limit, so one looping client or bot cannot
 *    spend the day's allowance on its own.
 * 3. This module's daily budget, counted across everyone: once the day's
 *    upstream calls reach it, suggestions stop and the field falls back to
 *    plain typing. An address typed by hand is a worse experience than one
 *    picked from a list; a quota exhausted by lunchtime is a worse one still,
 *    and it takes the ZIP lookups on the listing page down with it.
 *
 * The budget counts *upstream* calls only — it is incremented from inside the
 * cached function, whose body runs on a miss and not on a hit.
 *
 * Server-only. Both checks fail **open**: if Redis is unreachable the feature
 * keeps working rather than the address field going dead, since Redis being
 * down says nothing about how much quota is left. The daily counter is the
 * backstop for cost, not the only one — Geoapify's own dashboard caps the
 * account, and this is here so the cap is never what stops us.
 */

const KEY_PREFIX = 'oss-next:'

/**
 * Upstream calls allowed per day, across all visitors.
 *
 * Default sits under Geoapify's 3,000/day free tier with room for the listing
 * page's ZIP lookups, which share the same key. Raise it with
 * `GEOAPIFY_DAILY_BUDGET` when the plan changes — no deploy of this file.
 */
const DAILY_BUDGET = Number(process.env.GEOAPIFY_DAILY_BUDGET ?? 2_500)

/** Two days, so a counter is never read after the day it belongs to. */
const DAY_TTL_SECONDS = 60 * 60 * 48

/**
 * Lookups per visitor per minute.
 *
 * A person typing an address with a 450ms debounce sends a handful; this only
 * stops floods, and a visitor who trips it still has a working text field.
 */
const RATE_LIMIT = 30
const RATE_WINDOW_SECONDS = 60

function redisOrNull() {
  try {
    return getRedisClient()
  } catch {
    return null
  }
}

/** UTC, so the window does not shift with the server's locale or DST. */
function dayKey(now: Date): string {
  return `${KEY_PREFIX}geoapify:day:${now.toISOString().slice(0, 10)}`
}

/** The caller's IP, for rate limiting only — hashed before it is stored. */
export function visitorKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for') ?? ''
  const ip = forwarded.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
  return createHash('sha256').update(ip).digest('hex').slice(0, 24)
}

export async function isOverGeoapifyRateLimit(visitor: string): Promise<boolean> {
  const redis = redisOrNull()
  if (!redis) return false

  const window = Math.floor(Date.now() / 1000 / RATE_WINDOW_SECONDS)
  const key = `${KEY_PREFIX}rl:geoapify:${visitor}:${window}`
  try {
    const count = await redis.incr(key)
    if (count === 1) await redis.expire(key, RATE_WINDOW_SECONDS)
    return count > RATE_LIMIT
  } catch (err) {
    console.error('[geoapifyGuard] rate limit check failed:', err)
    return false
  }
}

/** Has today's allowance run out? Checked before a lookup, never after. */
export async function isOverDailyBudget(now: Date = new Date()): Promise<boolean> {
  const redis = redisOrNull()
  if (!redis) return false

  try {
    const used = Number((await redis.get(dayKey(now))) ?? 0)
    return used >= DAILY_BUDGET
  } catch (err) {
    console.error('[geoapifyGuard] budget check failed:', err)
    return false
  }
}

/**
 * Record one upstream call.
 *
 * Called from inside the cached lookup, so a cache hit costs nothing and is
 * counted as nothing. Deliberately not awaited by the caller's critical path
 * beyond what the cached body already awaits.
 */
export async function countGeoapifyCall(now: Date = new Date()): Promise<void> {
  const redis = redisOrNull()
  if (!redis) return

  const key = dayKey(now)
  try {
    const used = await redis.incr(key)
    if (used === 1) await redis.expire(key, DAY_TTL_SECONDS)
    // One line a day, at the point it matters, rather than a counter nobody
    // reads: this is the warning that tomorrow's suggestions may not run.
    if (used === Math.floor(DAILY_BUDGET * 0.8)) {
      console.warn(`[geoapifyGuard] 80% of today's Geoapify budget used (${used}/${DAILY_BUDGET})`)
    }
  } catch (err) {
    console.error('[geoapifyGuard] counter failed:', err)
  }
}

/** Today's usage, for the admin screens and for tests. */
export async function geoapifyUsage(
  now: Date = new Date(),
): Promise<{ used: number; budget: number }> {
  const redis = redisOrNull()
  if (!redis) return { used: 0, budget: DAILY_BUDGET }

  try {
    return { used: Number((await redis.get(dayKey(now))) ?? 0), budget: DAILY_BUDGET }
  } catch {
    return { used: 0, budget: DAILY_BUDGET }
  }
}
