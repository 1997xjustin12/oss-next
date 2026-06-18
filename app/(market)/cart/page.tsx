'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, RefreshCw, Truck, CheckCircle2, Tag } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { CartItemRow } from '@/components/cart/CartItemRow'
import { CartSummary } from '@/components/cart/CartSummary'
import { CartSkeleton, SummarySkeleton } from './_components/CartSkeleton'

const DELIVERY_FEE = 195

export default function CartPage() {
  const { cart } = useCart()
  const [mounted, setMounted] = useState(false)
  const [cartLoading, setCartLoading] = useState(true)
  const [promoInput, setPromoInput] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoError, setPromoError] = useState(false)

  useEffect(() => {
    setMounted(true)
    const t = setTimeout(() => setCartLoading(false), 1100)
    return () => clearTimeout(t)
  }, [])

  function reloadCart() {
    setCartLoading(true)
    setTimeout(() => setCartLoading(false), 1100)
  }

  function applyPromo() {
    if (promoInput.trim().toUpperCase() === 'SAVE10') {
      setPromoApplied(true)
      setPromoError(false)
    } else {
      setPromoApplied(false)
      setPromoError(true)
    }
  }

  const subtotal = cart.totalPrice
  const discount = promoApplied ? Math.round(subtotal * 0.1 * 100) / 100 : 0
  const deliveryFee = mounted && cart.totalItems > 0 ? DELIVERY_FEE : 0

  return (
    <section className="px-[5%] py-8 sm:py-10">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8 items-start">

        {/* ── Left: items column ── */}
        <div>
          <div className="flex items-baseline justify-between gap-3 mb-5 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-2.5">
              <ShoppingCart className="w-7 h-7 text-theme-primary shrink-0" />
              Shopping Cart
              {!cartLoading && mounted && (
                <span className="text-base sm:text-lg font-normal text-theme-muted">
                  ({cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'})
                </span>
              )}
            </h1>
            <button
              onClick={reloadCart}
              className="flex items-center gap-1.5 text-sm font-semibold text-theme-primary hover:text-theme-primary-dark transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${cartLoading ? 'animate-spin' : ''}`} />
              Refresh cart
            </button>
          </div>

          {cartLoading ? (
            <CartSkeleton />
          ) : !mounted || cart.totalItems === 0 ? (
            <EmptyCart />
          ) : (
            <>
              <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-2.5 text-sm font-semibold text-green-700 mb-5">
                <Truck className="w-4 h-4 shrink-0" />
                Estimated delivery: 2–4 business days to your location
              </div>

              <div className="flex flex-col gap-3.5 mb-6">
                {cart.items.map((item) => (
                  <CartItemRow key={item.id} item={item} />
                ))}
              </div>

              {/* Promo code */}
              <div className="rounded-xl border border-theme-border bg-white p-4 sm:p-5">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-theme-muted mb-3">
                  <Tag className="w-3.5 h-3.5" />
                  Promo / Coupon Code
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => {
                      setPromoInput(e.target.value)
                      setPromoError(false)
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && applyPromo()}
                    placeholder="Enter code (try SAVE10)"
                    className="flex-1 min-w-0 rounded-md border border-theme-border bg-theme-subtle px-3.5 py-2.5 text-sm outline-none focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 transition-colors"
                  />
                  <button
                    onClick={applyPromo}
                    className="rounded-md bg-theme-dark hover:bg-theme-primary text-white font-semibold px-5 py-2.5 text-sm whitespace-nowrap transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {promoApplied && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600 mt-2.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Code SAVE10 applied — {Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(discount)} off!
                  </div>
                )}
                {promoError && (
                  <p className="text-xs font-semibold text-theme-primary mt-2.5">
                    ✗ Invalid promo code. Try SAVE10
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Right: summary column ── */}
        {cartLoading ? (
          <SummarySkeleton />
        ) : (
          <CartSummary
            deliveryFee={deliveryFee}
            discount={discount}
            promoCode={promoApplied ? 'SAVE10' : undefined}
          />
        )}
      </div>
    </section>
  )
}

function EmptyCart() {
  return (
    <div className="rounded-xl border border-theme-border bg-white p-10 sm:p-16 text-center">
      <ShoppingCart className="w-14 h-14 mx-auto text-theme-border mb-4" />
      <h2 className="text-2xl font-bold mb-1.5">Your cart is empty</h2>
      <p className="text-sm text-theme-muted mb-6 max-w-xs mx-auto">
        Browse our containers and add items to get started.
      </p>
      <Link
        href="/buy-shipping-containers"
        className="rounded-md bg-theme-primary hover:bg-theme-primary-dark text-white font-semibold px-6 py-3 text-sm transition-colors inline-block"
      >
        Shop Containers
      </Link>
    </div>
  )
}
