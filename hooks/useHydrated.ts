'use client'

import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}

/**
 * False during the server render and hydration, true after.
 *
 * For UI that depends on browser-only state (localStorage, the auth session):
 * render the server's version first so hydration matches, then the real one.
 * Unlike a `mounted` flag set in an effect, this is already true on a
 * client-side navigation, so there is no blank frame there.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false)
}
