import { getRedisClient } from '@/lib/redis'
import { CHAT_COUNTRIES_RELAXED, CHAT_COUNTRIES_STRICT } from '@/config/chat'

/**
 * Which countries the AI assistant is offered in, as a runtime switch.
 *
 * Replaces the `CHAT_ALLOWED_COUNTRIES` env var. An env var could only be
 * changed by editing it in the Vercel dashboard and redeploying — so the person
 * who wanted the change (whoever runs the store) could not make it, and the
 * person who could was doing a deploy to flip a boolean. This is the same
 * arrangement `lib/maintenance.ts` already uses for the maintenance wall:
 * a Redis flag, flipped from an admin screen, live in seconds.
 *
 * Two fixed sets rather than an editable list — see `config/chat.ts` for why.
 *
 *   ON  (strict)  -> US, CA          the markets the catalogue ships to
 *   OFF (relaxed) -> US, CA, PH      adds the team's own country for testing
 *
 * **Fails to STRICT**, not to relaxed and not to off. If Redis is unreachable
 * the assistant keeps serving the sales markets, which is the state that costs
 * nothing unexpected and serves every paying customer. Note this is the
 * opposite choice to the maintenance wall, which fails open — there, failing
 * the other way would take the whole site down; here, the worst case is that
 * the team cannot use the assistant from Manila until Redis returns.
 */

const REDIS_KEY = 'oss-next:chat-strict-countries'

/**
 * Absent means strict. Storing only the relaxed state keeps "no key" and
 * "never configured" meaning the same safe thing, and means turning the switch
 * back ON deletes the key rather than leaving a stale value behind.
 */
const RELAXED_VALUE = 'relaxed'

// Read at most once per TTL per instance rather than once per chat request.
// A flip takes effect within the TTL on instances that did not serve it.
const TTL_MS = 20_000
let cache: { strict: boolean; at: number } | null = null

/**
 * Is the assistant restricted to the sales markets?
 *
 * True is the default and the production setting.
 */
export async function isChatStrict(now: number = Date.now()): Promise<boolean> {
  if (cache && now - cache.at < TTL_MS) return cache.strict

  let strict = true
  try {
    strict = (await getRedisClient().get(REDIS_KEY)) !== RELAXED_VALUE
  } catch (err) {
    // Fail strict — see the module comment.
    console.error('[chat] country switch read failed, treating as strict:', err)
    strict = true
  }

  cache = { strict, at: now }
  return strict
}

/** Flip the switch. Called by the admin Server Action. */
export async function setChatStrict(strict: boolean): Promise<void> {
  const redis = getRedisClient()
  if (strict) await redis.del(REDIS_KEY)
  else await redis.set(REDIS_KEY, RELAXED_VALUE)

  // Drop this instance's cache so the admin who just clicked sees the new state
  // on the redirect rather than up to TTL_MS of the old one.
  cache = null
}

/**
 * The stored value, bypassing the 20-second cache. For the admin screen.
 *
 * The screen has to show what is actually stored: reading through the cache
 * could render "Sales markets only" for up to 20 seconds after someone else
 * switched it, which on a settings page reads as the save having failed.
 *
 * Skipping the cache also keeps `Date.now()` out of the render path — under
 * `cacheComponents` an unstable value there fails the build outright, which is
 * how this function came to exist.
 */
export async function readChatStrictFlag(): Promise<boolean> {
  try {
    return (await getRedisClient().get(REDIS_KEY)) !== RELAXED_VALUE
  } catch {
    return true
  }
}

/** The live country list. */
export async function chatAllowedCountries(): Promise<string[]> {
  return (await isChatStrict())
    ? [...CHAT_COUNTRIES_STRICT]
    : [...CHAT_COUNTRIES_RELAXED]
}
