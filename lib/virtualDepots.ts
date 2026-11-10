import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_TAGS, OUTAGE_CACHE_LIFE } from '@/config/cache'
import { STORE_KEY } from '@/config/store'
import { getRedisClient } from '@/lib/redis'

/**
 * Whether a ZIP may resolve to a virtual depot (a service area served from a
 * main depot, such as Abilene, TX from Dallas), as a runtime switch.
 *
 *   off (default) — only main depots are candidates: every ZIP resolves to the
 *                   nearest main depot by distance.
 *   on            — main and virtual depots are both candidates.
 *
 * Flipped from Admin → Depots, live within a minute, the same arrangement as
 * the cart notice switch (lib/cartNotice.ts). Only "on" is stored: no key means
 * off, and switching off deletes the key. **Fails to off**: an unreachable
 * Redis must not change where visitors are sent.
 */

const REDIS_KEY = `oss-next:${STORE_KEY}:virtual-depots`
const ON = 'on'

/** Whether virtual depots are suggested. Cached; the admin action busts the tag. */
export async function virtualDepotsEnabled(): Promise<boolean> {
  'use cache: remote'
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.SETTINGS)

  try {
    const on = (await getRedisClient().get(REDIS_KEY)) === ON
    cacheLife('hours')
    return on
  } catch (err) {
    console.error('[virtual-depots] switch read failed, using off:', err)
    cacheLife(OUTAGE_CACHE_LIFE)
    return false
  }
}

/** The stored value, bypassing the cache, for the admin screen. */
export async function readVirtualDepotsFlag(): Promise<boolean> {
  try {
    return (await getRedisClient().get(REDIS_KEY)) === ON
  } catch (err) {
    console.error('[virtual-depots] switch read failed, using off:', err)
    return false
  }
}

/** Flip the switch. Called by the admin Server Action. */
export async function setVirtualDepotsEnabled(on: boolean): Promise<void> {
  const redis = getRedisClient()
  if (on) await redis.set(REDIS_KEY, ON)
  else await redis.del(REDIS_KEY)
}
