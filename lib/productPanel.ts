import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_TAGS } from '@/config/cache'
import { getRedisClient } from '@/lib/redis'

/**
 * Which version of the product page's info panel renders, as a runtime switch.
 *
 * Two components exist for it — `ProductInfoPanel` (the default) and
 * `ProductInfoPanelV2`, which drops the Distance, Delivery and Sales tax rows
 * from the Selected Container Summary. The switch lives in Redis and is flipped
 * from Admin → Product Panel, the same arrangement `lib/chatCountries.ts` uses,
 * so the person who wants the change can make it without a deploy.
 *
 * **Fails to the default panel.** If Redis is unreachable the page renders the
 * version that has been serving customers, not the newer one — an outage should
 * not change what the store shows.
 *
 * Read through `'use cache'` rather than the short in-process TTL that
 * `chatCountries` uses, because this one is read while *rendering* the product
 * page: a per-request Redis round trip would make every PDP dynamic, and a
 * `Date.now()` TTL check in a render path fails the build outright under
 * `cacheComponents`. The action below busts the tag, so a flip still applies
 * immediately rather than after the cache profile expires.
 */

const REDIS_KEY = 'oss-next:product-panel-v2'

/**
 * Absent means the default panel. Storing only the "on" state keeps "no key"
 * and "never configured" meaning the same thing, and switching back off deletes
 * the key rather than leaving a stale value behind.
 */
const ON_VALUE = 'on'

/** Is the product page rendering the V2 info panel? */
export async function isProductPanelV2(): Promise<boolean> {
  'use cache'
  cacheLife('minutes')
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.SETTINGS)

  return readProductPanelV2Flag()
}

/**
 * The stored value, bypassing the cache. For the admin screen, which has to
 * show what is actually stored — rendering a stale state on a settings page
 * reads as the save having failed.
 */
export async function readProductPanelV2Flag(): Promise<boolean> {
  try {
    return (await getRedisClient().get(REDIS_KEY)) === ON_VALUE
  } catch (err) {
    // Fail to the default panel — see the module comment.
    console.error('[product-panel] switch read failed, using the default panel:', err)
    return false
  }
}

/** Flip the switch. Called by the admin Server Action. */
export async function setProductPanelV2(on: boolean): Promise<void> {
  const redis = getRedisClient()
  if (on) await redis.set(REDIS_KEY, ON_VALUE)
  else await redis.del(REDIS_KEY)
}
