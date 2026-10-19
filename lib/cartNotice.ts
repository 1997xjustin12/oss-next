import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_TAGS, OUTAGE_CACHE_LIFE } from '@/config/cache'
import { getRedisClient } from '@/lib/redis'

/**
 * How the site confirms an add to cart, as a runtime switch.
 *
 * Two components answer the same moment differently, and which one sells better
 * is a question about customers rather than code:
 *
 *   modal (default) — AddedToCartModal: the full dialog, with the item's specs
 *                     and a row of accessories to add next. It interrupts, which
 *                     is the point when there is something else to offer.
 *   toast           — AddedToCartToast: a line in the corner that says it
 *                     worked and gets out of the way, for when the interruption
 *                     costs more than the cross-sell earns.
 *
 * Flipped from Admin → Cart Notice, live in seconds, the same arrangement as
 * the product panel switch and the chat country switch.
 *
 * **Fails to the modal**, the component that has been serving customers. An
 * unreachable Redis should not change what the store does.
 *
 * Read through `'use cache'` rather than per request: this is read in the root
 * layout, so an uncached Redis round trip would put one on every page of the
 * site. The Server Action busts the tag, so a flip still applies immediately.
 *
 * `use cache: remote`, not plain `use cache`: the plain one keeps its entry in
 * one serverless instance's memory, so on Vercel most requests missed it and
 * read Redis anyway. Hours rather than minutes because the admin action busts
 * the tag on save — and the shortest lifetime in the root layout sets how often
 * every page on the site is re-rendered, so `minutes` was re-rendering (and
 * re-reading Redis for) every page about once a minute.
 */

const REDIS_KEY = 'oss-next:cart-added-notice'

export type CartNoticeMode = 'modal' | 'toast'

/**
 * Absent means the modal. Storing only the non-default keeps "no key" and
 * "never configured" meaning the same thing, and switching back deletes the key
 * rather than leaving a stale value behind.
 */
const TOAST_VALUE = 'toast'

/**
 * Which confirmation the storefront is showing.
 *
 * A Redis failure falls back to the modal and is cached only briefly
 * (OUTAGE_CACHE_LIFE), so the real setting returns within a minute.
 */
export async function cartNoticeMode(): Promise<CartNoticeMode> {
  'use cache: remote'
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.SETTINGS)

  try {
    const mode = (await getRedisClient().get(REDIS_KEY)) === TOAST_VALUE ? 'toast' : 'modal'
    cacheLife('hours')
    return mode
  } catch (err) {
    // Fail to the modal — see the module comment.
    console.error('[cart-notice] switch read failed, using the modal:', err)
    cacheLife(OUTAGE_CACHE_LIFE)
    return 'modal'
  }
}

/**
 * The stored value, bypassing the cache. For the admin screen, which has to
 * show what is actually stored — a settings page rendering a stale state reads
 * as the save having failed.
 */
export async function readCartNoticeFlag(): Promise<CartNoticeMode> {
  try {
    return (await getRedisClient().get(REDIS_KEY)) === TOAST_VALUE ? 'toast' : 'modal'
  } catch (err) {
    // Fail to the modal — see the module comment.
    console.error('[cart-notice] switch read failed, using the modal:', err)
    return 'modal'
  }
}

/** Flip the switch. Called by the admin Server Action. */
export async function setCartNoticeMode(mode: CartNoticeMode): Promise<void> {
  const redis = getRedisClient()
  if (mode === 'toast') await redis.set(REDIS_KEY, TOAST_VALUE)
  else await redis.del(REDIS_KEY)
}
