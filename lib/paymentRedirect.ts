import { STORE_KEY } from '@/config/store'
import { getRedisClient } from '@/lib/redis'

/**
 * Whether a placed order goes on to the payment page, per domain: Admin →
 * Checkout.
 *
 * Checkout itself is open everywhere: anyone can place an order, and it is
 * recorded as `unpaid`. What this decides is the step after. On a listed
 * domain the customer is sent to the backend's payment link; on every other
 * domain they get the "Order placed" confirmation and stay here, and the team
 * contacts them to take payment (the backend emails the order either way).
 * Read by the order route (app/api/checkout/place-order), which leaves the
 * link out of its answer, so the browser never has it to follow.
 *
 * **Off unless a domain is listed, and off if the list cannot be read.** Not
 * sending someone to pay is the cheaper mistake: the order is recorded either
 * way, and the team follows it up.
 *
 * Until 2026-10-30 this was the checkout gate: an unlisted domain sent
 * /checkout to /checkout-unavailable and refused orders. The Redis key kept
 * its old name, so the domains switched on then still get the payment page.
 *
 * Cached in module scope for a short time, as lib/maintenance.ts does: at most
 * one Redis read per TTL per instance. A change applies at once on the
 * instance that made it and within the TTL everywhere else.
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

async function redirectHosts(now: number): Promise<Set<string>> {
  if (cache && now - cache.at < TTL_MS) return cache.hosts
  const hosts = new Set<string>()
  try {
    for (const host of await getRedisClient().smembers(KEY)) hosts.add(String(host))
  } catch (err) {
    // Off: see the module comment.
    console.error('[payment-redirect] list read failed, not sending anyone to the payment page:', err)
  }
  cache = { hosts, at: now }
  return hosts
}

/** Does an order placed on this domain go on to the payment page? Off unless listed, and off if the list cannot be read. */
export async function isPaymentRedirectOn(host: string, now: number = Date.now()): Promise<boolean> {
  const clean = normalizeHost(host)
  return !!clean && (await redirectHosts(now)).has(clean)
}

/**
 * The payment link to hand the browser: the backend's, on a domain where the
 * redirect is on; none otherwise, which the checkout shows as the "Order
 * placed" confirmation.
 */
export function paymentLinkToSend(paymentUrl: string | undefined, redirectOn: boolean): string | undefined {
  return redirectOn ? paymentUrl : undefined
}

/**
 * The domains the redirect is on, for the admin screen, read fresh. `error`
 * is set when Redis could not be read (the redirect is then off everywhere).
 */
export async function readPaymentRedirectHosts(): Promise<{ hosts: string[]; error?: string }> {
  try {
    return { hosts: (await getRedisClient().smembers(KEY)).map(String).sort() }
  } catch (err) {
    return { hosts: [], error: err instanceof Error ? err.message : String(err) }
  }
}

/** Turn the redirect on or off for one domain. Throws on a Redis failure, so the admin is told. */
export async function setPaymentRedirect(host: string, on: boolean): Promise<void> {
  const clean = normalizeHost(host)
  if (!clean) throw new Error(`Not a domain: "${host}"`)
  const redis = getRedisClient()
  if (on) await redis.sadd(KEY, clean)
  else await redis.srem(KEY, clean)
  // This instance reflects the change at once; others within the TTL.
  cache = null
}

/** How long other server instances can take to pick up a change, for the admin screen. */
export const PAYMENT_REDIRECT_TTL_SECONDS = TTL_MS / 1000
