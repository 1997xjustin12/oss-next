'use client'

import { use } from 'react'
import { CartContext } from '@/context/CartContext'
import type { CartContextValue } from '@/context/CartContext'

export function useCart(): CartContextValue {
  const ctx = use(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
