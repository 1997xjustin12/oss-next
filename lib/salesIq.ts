import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_TAGS, OUTAGE_CACHE_LIFE } from '@/config/cache'
import { conformSalesIqPaths, SALES_IQ_DEFAULT_EXCLUDED_PATHS } from '@/config/salesIq'
import { STORE_KEY } from '@/config/store'
import { getRedisClient } from '@/lib/redis'

/**
 * Which storefront pages leave out the Zoho SalesIQ chat: Admin → Live Chat.
 *
 * Served to the browser by a CDN-cached route (GET /api/live-chat) rather than read
 * in the storefront layout, as lib/cartNotice.ts explains: that would tie every
 * page shell to Redis. The Server Action busts the tag; the CDN copy follows within
 * a minute.
 *
 * **Fails to the defaults**, config/salesIq.ts, so an unreachable Redis can't bring
 * the chat onto the cart or checkout. Stored as one list, so a saved empty list
 * (chat on every page) stays different from nothing saved yet.
 */

const KEY = `oss-next:${STORE_KEY}:salesiq:excluded-paths`

/** The list the storefront uses. */
export async function getSalesIqExcludedPaths(): Promise<string[]> {
  'use cache: remote'
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.SETTINGS)

  try {
    const raw = await getRedisClient().get<unknown>(KEY)
    cacheLife('hours')
    return conformSalesIqPaths(raw)
  } catch (err) {
    console.error('[live-chat] list read failed, using the default pages:', err)
    cacheLife(OUTAGE_CACHE_LIFE)
    return [...SALES_IQ_DEFAULT_EXCLUDED_PATHS]
  }
}

/** The stored list, bypassing the cache, for the admin screen. `error` is set when Redis could not be read. */
export async function readSalesIqExcludedPaths(): Promise<{ paths: string[]; error?: string }> {
  try {
    return { paths: conformSalesIqPaths(await getRedisClient().get<unknown>(KEY)) }
  } catch (err) {
    return { paths: [...SALES_IQ_DEFAULT_EXCLUDED_PATHS], error: err instanceof Error ? err.message : String(err) }
  }
}

/**
 * Add a page to the list or take it off. `path` is already normalized. Throws on a
 * Redis failure, reads included, so a failed read can't save over the list.
 */
export async function setSalesIqPathExcluded(path: string, excluded: boolean): Promise<void> {
  const redis = getRedisClient()
  const current = conformSalesIqPaths(await redis.get<unknown>(KEY))
  const next = excluded ? [...current, path] : current.filter((p) => p !== path)
  await redis.set(KEY, conformSalesIqPaths(next))
}
