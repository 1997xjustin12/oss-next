import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_TAGS, SHELL_OUTAGE_CACHE_LIFE } from '@/config/cache'
import { PLP_DEFAULT_ORDER, type PlpOrder } from '@/config/plpOrder'
import { STORE_KEY } from '@/config/store'
import { conformPlpOrder } from '@/lib/plpOrder'
import { getRedisClient } from '@/lib/redis'

/**
 * The container listing's Default order as set in Admin → Listing Order:
 * config/plpOrder.ts reordered, kept in Redis. No record means the default.
 *
 * Read through `use cache: remote` under the settings tag, as lib/productPanel.ts
 * is: the listing's search reads it on every query, and the admin action busts
 * the tag (and the search results'), so a save applies at once.
 *
 * **Fails to the default.** If Redis cannot be read, the listing uses
 * config/plpOrder.ts, cached briefly so the saved order returns soon after.
 */

const KEY = `oss-next:${STORE_KEY}:plp-order`

/** The order the listing uses. */
export async function getPlpOrder(): Promise<PlpOrder> {
  'use cache: remote'
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.SETTINGS)

  try {
    const raw = await getRedisClient().get<unknown>(KEY)
    cacheLife('hours')
    return raw ? conformPlpOrder(raw) : PLP_DEFAULT_ORDER
  } catch (err) {
    console.error('[plp-order] read failed, using the default order:', err)
    cacheLife(SHELL_OUTAGE_CACHE_LIFE)
    return PLP_DEFAULT_ORDER
  }
}

/**
 * The stored order, bypassing the cache, for the admin screen: `custom` when a
 * saved order is in use, `error` when Redis could not be read.
 */
export async function readPlpOrderSetting(): Promise<{ order: PlpOrder; custom: boolean; error?: string }> {
  try {
    const raw = await getRedisClient().get<unknown>(KEY)
    return { order: raw ? conformPlpOrder(raw) : PLP_DEFAULT_ORDER, custom: !!raw }
  } catch (err) {
    return { order: PLP_DEFAULT_ORDER, custom: false, error: err instanceof Error ? err.message : String(err) }
  }
}

/** Save an order (already conformed), or `null` to go back to the default. Throws on a Redis failure. */
export async function savePlpOrder(order: PlpOrder | null): Promise<void> {
  const redis = getRedisClient()
  if (order) await redis.set(KEY, order)
  else await redis.del(KEY)
}
