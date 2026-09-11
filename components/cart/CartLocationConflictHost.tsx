'use client'

import { useEffect, useState } from 'react'
import { useCart } from '@/hooks/useCart'
import {
  CART_LOCATION_CONFLICT_EVENT,
  type CartLocationConflictRequest,
} from '@/lib/cart'
import { CartLocationConflictModal } from './CartLocationConflictModal'

/**
 * The one location-conflict prompt, for every page.
 *
 * Mounted once inside CartProvider, beside AddedToCartModal. Anything that
 * would put two depots in play — an add-to-cart, or a ZIP change through
 * `useGeoapify` — calls `requestCartLocationConflict()` and this shows it.
 * Nothing that can cause a conflict renders its own copy, which is what makes
 * a new ZIP input covered without doing anything.
 */
export function CartLocationConflictHost() {
  const { cart, clearCart } = useCart()
  const [request, setRequest] = useState<CartLocationConflictRequest | null>(null)
  const [pendingRetry, setPendingRetry] = useState<(() => void) | null>(null)

  useEffect(() => {
    function onRequest(event: Event) {
      setRequest((event as CustomEvent<CartLocationConflictRequest>).detail)
    }
    window.addEventListener(CART_LOCATION_CONFLICT_EVENT, onRequest)
    return () => window.removeEventListener(CART_LOCATION_CONFLICT_EVENT, onRequest)
  }, [])

  // Finish the blocked action only once the cleared cart has rendered.
  //
  // Running it straight after `clearCart()` would hand it the same cart that
  // blocked it — the reducer update has not committed yet — and it would be
  // refused a second time, reopening this prompt. Waiting for the render that
  // carries no containers also lets every guard that reads the cart through a
  // ref pick up the new value first.
  useEffect(() => {
    if (!pendingRetry) return
    if (cart.items.some((item) => item.isContainer)) return
    const retry = pendingRetry
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot: consumed here, and the retry runs after
    setPendingRetry(null)
    retry()
  }, [cart, pendingRetry])

  if (!request) return null

  return (
    <CartLocationConflictModal
      open
      reason={request.reason}
      currentLocation={request.currentLocation}
      newLocation={request.newLocation}
      onClose={() => setRequest(null)}
      onClearCart={() => {
        clearCart()
        // Stored as a thunk: a bare function passed to a state setter is read
        // as an updater and would be called immediately, before the clear.
        if (request.retry) setPendingRetry(() => request.retry!)
      }}
    />
  )
}
