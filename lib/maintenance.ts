import { getRedisClient } from '@/lib/redis'

/**
 * Maintenance-wall state, layered so neither source is a single point of
 * failure:
 *
 *   1. MAINTENANCE_MODE env var — a hard kill-switch. When set (1|true|on) the
 *      wall is ON regardless of Redis, so you can always wall the site with a
 *      redeploy even if Redis itself is unreachable.
 *   2. Redis flag (`oss-next:maintenance`) — the runtime toggle, flipped in
 *      seconds via POST /api/maintenance with no redeploy.
 *
 * If Redis errors we fail OPEN (site stays up). Walling the whole site because
 * a flag read blipped is the exact false-positive that's worse than the outage
 * it would be guarding against.
 */

const REDIS_KEY = 'oss-next:maintenance'

/** Env kill-switch — evaluated once at module load; needs a redeploy to change. */
const ENV_FORCED_ON = /^(1|true|on)$/i.test(process.env.MAINTENANCE_MODE ?? '')

// The proxy runs this on matched requests, so the Redis read is cached in
// module scope with a short TTL: at most one read per TTL per proxy instance,
// not one per request. Turning the wall on/off takes effect within the TTL.
const TTL_MS = 20_000
let cache: { on: boolean; at: number } | null = null

/** Redis value that counts as "on". */
function truthy(v: unknown): boolean {
  return v === 1 || v === true || v === 'on' || v === '1' || v === 'true'
}

/**
 * Whether the maintenance wall is currently up. Reads a value passed to the
 * proxy via `now` so tests/callers can't be tripped by a wall clock, but
 * defaults to Date.now() in normal use.
 */
export async function isMaintenanceMode(now: number = Date.now()): Promise<boolean> {
  if (ENV_FORCED_ON) return true

  if (cache && now - cache.at < TTL_MS) return cache.on

  let on = false
  try {
    on = truthy(await getRedisClient().get(REDIS_KEY))
  } catch (err) {
    // Fail open: an unreachable flag must not take the site down.
    console.error('[maintenance] flag read failed, treating as OFF:', err)
    on = false
  }

  cache = { on, at: now }
  return on
}

/** Flip the runtime flag. Called by the token-protected toggle route. */
export async function setMaintenanceMode(on: boolean): Promise<void> {
  const redis = getRedisClient()
  if (on) await redis.set(REDIS_KEY, 'on')
  else await redis.del(REDIS_KEY)
  // Drop the local cache so this instance reflects the change immediately;
  // other instances pick it up within the TTL.
  cache = null
}

/** For the toggle route's response — does not consult the env kill-switch. */
export async function readMaintenanceFlag(): Promise<boolean> {
  try {
    return truthy(await getRedisClient().get(REDIS_KEY))
  } catch {
    return false
  }
}

export const MAINTENANCE_ENV_FORCED_ON = ENV_FORCED_ON
