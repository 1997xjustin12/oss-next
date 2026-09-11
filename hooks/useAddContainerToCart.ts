'use client'

import { useCart } from '@/hooks/useCart'
import { findLocationConflict, requestCartLocationConflict } from '@/lib/cart'
import { isGenericDisplayHit } from '@/lib/pricing'
import { DEFAULT_LOCATION } from '@/lib/constants'
import type { CartItem } from '@/types/cart'

type ContainerCartItem = CartItem & { isContainer: true; location: string }

// Shared by every entry point that adds a shipping container to the cart
// (PDP variant selector, PLP quick view, ...) so the same-location rule
// stays in one place instead of being re-implemented per call site.
export function useAddContainerToCart() {
  const { cart, addItem, clearCart } = useCart()

  function addContainerToCart(item: ContainerCartItem, showModal?: boolean): boolean {
    // Defense in depth — the PDP/PLP UI already hides/disables add-to-cart for
    // generic display-only listings (no real depot behind them), but block it
    // here too so it can never be bypassed regardless of the call site.
    const isGenericDisplay =
      item.location === DEFAULT_LOCATION || (item.rawHit ? isGenericDisplayHit(item.rawHit) : false)
    if (isGenericDisplay) return false

    const existing = findLocationConflict(cart, { isContainer: true, location: item.location })
    if (existing) {
      // The one global prompt (CartLocationConflictHost), the same one a ZIP
      // change raises. Each add-to-cart surface used to render its own copy.
      requestCartLocationConflict({
        currentLocation: existing.location!,
        newLocation: item.location,
        reason: 'add',
      })
      return false
    }
    addItem(item, showModal)
    return true
  }

  return {
    addContainerToCart,
    clearCart,
  }
}
