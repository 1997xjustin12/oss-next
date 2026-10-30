import { STORE_KEY } from '@/config/store'
import { getRedisClient } from '@/lib/redis'

/**
 * Whether checkout is open, per domain: Admin → Checkout.
 *
 * **Closed unless a domain is listed.** Redis holds the domains checkout is
 * open on; every other domain sends checkout to /checkout-unavailable (the
 * proxy, proxy.ts) and refuses orders (/api/checkout/*). So the live store
 * takes no orders until someone opens it, while a developer can open checkout
 * on their own domain (a preview URL, localhost) to test the flow end to end.
 *
 * **Fails closed.** If Redis cannot be read, checkout is treated as closed: a
 * blip that briefly turns orders away is the cheaper mistake than one that lets
 * orders through on a store that is not ready for them. The visitor still has
 * the phone number.
 *
 * CHECKOUT_OPEN_HOSTS (comma-separated) opens domains whatever Redis says, for
 * environments that must not depend on the shared list (the e2e server).
 *
 * Read on every checkout request by the proxy, so the list is cached in module
 * scope for a short time, as lib/maintenance.ts does: at most one Redis read
 * per TTL per instance. A change applies at once on the instance that made it
 * and within the TTL everywhere else.
 */

const KEY = `oss-next:${STORE_KEY}:checkout:open-hosts`
const TTL_MS = 30_000

let cache: { hosts: Set<string>; at: number } | null = null

/**
 * A domain as stored and compared: lower case, no scheme, path or port.
 * "https://Staging.OnsiteStorage.com:443/cart" → "staging.onsitestorage.com".
 * Empty for anything that is not a plausible host name.
 */
export function normalizeHost(value: string): string {
  const host = value
    .trim()
    .toLowerCase()
    .replace(/^[a-z]+:\/\//, '')
    .replace(/[/?#].*$/, '')
    .replace(/:\d+$/, '')
    .replace(/\.$/, '')
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/.test(host) && host.length <= 253 ? host : ''
}

/**
 * Domains open whatever Redis says: CHECKOUT_OPEN_HOSTS, comma-separated. For
 * environments that must not depend on the shared list, the e2e server
 * (playwright.config.ts: `localhost`) above all. Read once at load.
 */
const ENV_OPEN_HOSTS: readonly string[] = (process.env.CHECKOUT_OPEN_HOSTS ?? '')
  .split(',')
  .map((host) => normalizeHost(host))
  .filter(Boolean)

async function openHosts(now: number): Promise<Set<string>> {
  if (cache && now - cache.at < TTL_MS) return cache.hosts
  const hosts = new Set<string>(ENV_OPEN_HOSTS)
  try {
    for (const host of await getRedisClient().smembers(KEY)) hosts.add(String(host))
  } catch (err) {
    // Fail closed: see the module comment.
    console.error('[checkout-gate] list read failed, treating checkout as closed:', err)
  }
  cache = { hosts, at: now }
  return hosts
}

/** Is checkout open on this domain? Closed unless listed, and closed if the list cannot be read. */
export async function isCheckoutOpen(host: string, now: number = Date.now()): Promise<boolean> {
  const clean = normalizeHost(host)
  return !!clean && (await openHosts(now)).has(clean)
}

/**
 * The domains checkout is open on, for the admin screen, read fresh. `error`
 * is set when Redis could not be read (checkout is then closed everywhere).
 */
export async function readOpenHosts(): Promise<{ hosts: string[]; envHosts: readonly string[]; error?: string }> {
  try {
    const hosts = (await getRedisClient().smembers(KEY)).map(String).sort()
    return { hosts, envHosts: ENV_OPEN_HOSTS }
  } catch (err) {
    return { hosts: [], envHosts: ENV_OPEN_HOSTS, error: err instanceof Error ? err.message : String(err) }
  }
}

/** Open or close checkout on one domain. Throws on a Redis failure, so the admin is told. */
export async function setCheckoutOpen(host: string, open: boolean): Promise<void> {
  const clean = normalizeHost(host)
  if (!clean) throw new Error(`Not a domain: "${host}"`)
  const redis = getRedisClient()
  if (open) await redis.sadd(KEY, clean)
  else await redis.srem(KEY, clean)
  // This instance reflects the change at once; others within the TTL.
  cache = null
}

/** How long other server instances can take to pick up a change, for the admin screen. */
export const CHECKOUT_GATE_TTL_SECONDS = TTL_MS / 1000
