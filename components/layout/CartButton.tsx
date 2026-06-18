'use client'

import Link from 'next/link'
import { useCart } from '@/hooks/useCart'

export function CartButton() {
  const { cart } = useCart()

  const label = cart.totalItems === 0
    ? 'Cart is empty'
    : `${cart.totalItems} item${cart.totalItems !== 1 ? 's' : ''} — $${cart.totalPrice.toFixed(2)}`

  return (
    <Link
      href="/cart"
      aria-label={`View cart — ${label}`}
      className="flex items-center gap-[5px] text-[13px] text-theme-muted px-[10px] py-[6px] border border-theme-border rounded transition-colors hover:border-theme-primary hover:text-theme-primary"
    >
      🛒
      <span className="font-semibold tabular-nums">
        ${cart.totalPrice.toFixed(2)}
      </span>
      <span className="bg-theme-primary text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
        {cart.totalItems}
      </span>
    </Link>
  )
}
