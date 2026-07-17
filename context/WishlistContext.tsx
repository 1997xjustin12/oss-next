'use client'

import { createContext, useEffect, useReducer } from 'react'
import type { WishlistItem } from '@/types/wishlist'

export interface WishlistContextValue {
  items: WishlistItem[]
  isWishlisted: (id: string) => boolean
  toggleWishlist: (item: WishlistItem) => void
  removeItem: (id: string) => void
}

export const WishlistContext = createContext<WishlistContextValue | null>(null)

const STORAGE_KEY = 'oss-wishlist'

type Action =
  | { type: 'RESTORE'; payload: WishlistItem[] }
  | { type: 'TOGGLE'; payload: WishlistItem }
  | { type: 'REMOVE'; id: string }

// No backend for this feature — persistence is device-local only (same
// caveat as a guest's cart before login), not cross-device. Kept intentionally
// simple: no debounced sync, no server round-trip, just localStorage.
function loadWishlist(): WishlistItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as WishlistItem[]) : []
  } catch {
    return []
  }
}

function reducer(state: WishlistItem[], action: Action): WishlistItem[] {
  switch (action.type) {
    case 'RESTORE':
      return action.payload
    case 'TOGGLE':
      return state.some((i) => i.id === action.payload.id)
        ? state.filter((i) => i.id !== action.payload.id)
        : [...state, action.payload]
    case 'REMOVE':
      return state.filter((i) => i.id !== action.id)
    default:
      return state
  }
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, dispatch] = useReducer(reducer, [])

  // Hydration-safe: starts empty (matching the server render), then restores
  // from localStorage once mounted on the client — same pattern CartContext
  // uses for the same reason.
  useEffect(() => {
    const stored = loadWishlist()
    if (stored.length > 0) dispatch({ type: 'RESTORE', payload: stored })
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const value: WishlistContextValue = {
    items,
    isWishlisted: (id) => items.some((i) => i.id === id),
    toggleWishlist: (item) => dispatch({ type: 'TOGGLE', payload: item }),
    removeItem: (id) => dispatch({ type: 'REMOVE', id }),
  }

  return <WishlistContext value={value}>{children}</WishlistContext>
}
