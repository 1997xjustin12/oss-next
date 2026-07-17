'use client'

import Link from 'next/link'
import { ShieldCheck, BadgeCheck } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { ROUTES } from '@/config/routes'

type Props = {
  /** Real total_shipping from /api/orders/get-total — undefined/0 until checkout knows a ZIP. */
  shipping?: number
  /** Real total_tax from /api/orders/get-total — undefined/0 until checkout knows a ZIP. */
  tax?: number
  /** True while a get-total request is in flight. */
  loading?: boolean
}

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

export function CartSummary({ shipping = 0, tax = 0, loading = false }: Props) {
  const { cart, clearCart } = useCart()
  const total = Math.max(0, cart.totalPrice + shipping + tax)

  return (
    <aside className="rounded-xl border border-theme-border bg-white p-5 sm:p-6 lg:sticky lg:top-24">
      <div className="text-xl font-extrabold pb-3.5 mb-4 border-b border-theme-border">
        Order Summary
      </div>

      <div className="flex flex-col gap-2.5 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-theme-muted">
            Subtotal ({cart.totalItems} item{cart.totalItems !== 1 ? 's' : ''})
          </span>
          <span className="font-semibold">{fmt(cart.totalPrice)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-theme-muted">Delivery fee</span>
          {loading ? (
            <span className="font-semibold text-theme-muted italic">Calculating…</span>
          ) : shipping > 0 ? (
            <span className="font-semibold">{fmt(shipping)}</span>
          ) : (
            <span className="font-semibold text-theme-muted italic">Calculated at checkout</span>
          )}
        </div>
        <hr className="border-theme-border" />
        <div className="flex justify-between">
          <span className="text-theme-muted">Est. Tax</span>
          {loading ? (
            <span className="font-semibold text-theme-muted italic">Calculating…</span>
          ) : tax > 0 ? (
            <span className="font-semibold">{fmt(tax)}</span>
          ) : (
            <span className="font-semibold text-theme-muted italic">At checkout</span>
          )}
        </div>
      </div>

      <div className="flex justify-between items-baseline pt-3.5 border-t-2 border-theme-dark mb-1">
        <span className="text-lg font-extrabold">Total</span>
        <span className="text-3xl font-extrabold text-theme-primary">{fmt(total)}</span>
      </div>
      <p className="text-[11px] text-theme-muted mb-5">
        *Tax calculated at checkout. No sales tax on most container orders.
      </p>

      <Link
        href={ROUTES.CHECKOUT}
        aria-disabled={cart.totalItems === 0}
        className={`w-full rounded-md text-white font-extrabold text-lg py-3.5 flex items-center justify-center gap-2 transition-colors mb-2 ${
          cart.totalItems === 0
            ? 'bg-gray-300 pointer-events-none'
            : 'bg-theme-primary hover:bg-theme-primary-dark'
        }`}
      >
        Proceed to Checkout →
      </Link>

      <div className="flex items-center justify-center gap-4 flex-wrap pt-3.5 mt-1 border-t border-theme-border text-[11px] text-theme-muted">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
          Secure Checkout
        </span>
        <span className="flex items-center gap-1">
          <BadgeCheck className="w-3.5 h-3.5 text-green-600" />
          No Hidden Fees
        </span>
      </div>

      {cart.totalItems > 0 && (
        <button
          onClick={clearCart}
          className="mt-4 w-full text-center text-[12px] text-theme-muted hover:text-theme-primary underline transition-colors"
        >
          Clear cart
        </button>
      )}
    </aside>
  )
}
