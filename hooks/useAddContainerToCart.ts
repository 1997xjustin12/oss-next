'use client'

import { useState } from 'react'
import { useCart } from '@/hooks/useCart'
import { findLocationConflict } from '@/lib/cart'
import type { CartItem } from '@/types/cart'

type ContainerCartItem = CartItem & { isContainer: true; location: string }

// Shared by every entry point that adds a shipping container to the cart
// (PDP variant selector, PLP quick view, ...) so the same-location rule
// stays in one place instead of being re-implemented per call site.
export function useAddContainerToCart() {
  const { cart, addItem, clearCart } = useCart()
  const [conflict, setConflict] = useState<{ currentLocation: string; newLocation: string } | null>(null)

  function addContainerToCart(item: ContainerCartItem, showModal?: boolean): boolean {
    const existing = findLocationConflict(cart, { isContainer: true, location: item.location })
    if (existing) {
      setConflict({ currentLocation: existing.location!, newLocation: item.location })
      return false
    }
    addItem(item, showModal)
    return true
  }

  return {
    conflict,
    clearConflict: () => setConflict(null),
    addContainerToCart,
    clearCart,
  }
}
