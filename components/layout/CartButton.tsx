'use client'

import Link from 'next/link'
import { useCart } from '@/hooks/useCart'

function CartIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" className={className}>
      <path d="M0 0h24v24H0z" fill="none" />
      <path fill="currentColor" d="M15.55 13c.75 0 1.41-.41 1.75-1.03l3.58-6.49A.996.996 0 0 0 20.01 4H5.21l-.94-2H1v2h2l3.6 7.59l-1.35 2.44C4.52 15.37 5.48 17 7 17h12v-2H7l1.1-2zM6.16 6h12.15l-2.76 5H8.53zM7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2s-.9-2-2-2m10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2s2-.9 2-2s-.9-2-2-2" />
    </svg>
  )
}

export function CartButton() {
  const { cart } = useCart()

  const label = cart.totalItems === 0
    ? 'Cart is empty'
    : `${cart.totalItems} item${cart.totalItems !== 1 ? 's' : ''} — $${cart.totalPrice.toFixed(2)}`

  return (
    <Link
      href="/cart"
      aria-label={`View cart — ${label}`}
      className="flex flex-col items-center justify-center px-1.5 text-theme-muted transition-colors hover:text-theme-primary"
    >
      <span className="relative">
        <CartIcon className="w-5.5 h-5.5" />
        {cart.totalItems > 0 && (
          <span className="absolute -top-1.5 -right-2 bg-theme-primary text-white text-[10px] font-bold rounded-full min-w-4 h-4 px-0.5 flex items-center justify-center leading-none">
            {cart.totalItems > 99 ? '99+' : cart.totalItems}
          </span>
        )}
      </span>
      <span className="text-[10px] font-semibold tabular-nums leading-none mt-1">
        ${cart.totalPrice.toFixed(2)}
      </span>
    </Link>
  )
}
