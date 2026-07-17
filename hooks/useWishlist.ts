'use client'

import { use } from 'react'
import { WishlistContext } from '@/context/WishlistContext'
import type { WishlistContextValue } from '@/context/WishlistContext'

export function useWishlist(): WishlistContextValue {
  const ctx = use(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used inside <WishlistProvider>')
  return ctx
}
