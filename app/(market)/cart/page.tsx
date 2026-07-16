'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, RefreshCw, Truck } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { cartItemsToLineItems } from '@/lib/cart'
import { CartItemRow } from '@/components/cart/CartItemRow'
import { CartSummary } from '@/components/cart/CartSummary'
import { CartSkeleton, SummarySkeleton } from './_components/CartSkeleton'
import type { CartItem } from '@/types/cart'
import type { GetOrderTotalPayload, OrderTotal } from '@/types/order'

export default function CartPage() {
  const { cart } = useCart()
  const [mounted, setMounted] = useState(false)
  const [liveTotal, setLiveTotal] = useState<OrderTotal | null>(null)
  const [totalsLoading, setTotalsLoading] = useState(false)

  useEffect(() => {
    // Hydration-safe mount detection — cart data is client-only (localStorage),
    // so the server render and first client render must intentionally differ.
    // No external system to synchronize with here, so there's no non-effect way
    // to do this (same accepted pattern used elsewhere in this codebase).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  // Real backend totals — same /api/orders/get-total endpoint checkout uses,
  // so the two pages never disagree. No shipping address exists yet at this
  // stage, so shipping/tax legitimately come back as 0 until checkout knows
  // a ZIP; CartSummary shows "Calculated at checkout" rather than implying
  // they're actually free.
  async function fetchTotals(items: CartItem[]) {
    const lineItems = cartItemsToLineItems(items)
    if (lineItems.length === 0) {
      setLiveTotal(null)
      return
    }

    setTotalsLoading(true)
    try {
      const payload: GetOrderTotalPayload = { items: lineItems }
      const res = await fetch('/api/orders/get-total', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => null)
      if (res.ok && data) setLiveTotal(data as OrderTotal)
    } catch {
      // keep whatever total we last had
    } finally {
      setTotalsLoading(false)
    }
  }

  // Debounced so rapid qty +/- clicks batch into one call instead of one per click.
  useEffect(() => {
    if (!mounted) return
    const handle = setTimeout(() => {
      fetchTotals(cart.items)
    }, 600)
    return () => clearTimeout(handle)
  }, [mounted, cart.items, cart.totalPrice])

  return (
    <section className="px-[5%] py-8 sm:py-10">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8 items-start">

        {/* ── Left: items column ── */}
        <div>
          <div className="flex items-baseline justify-between gap-3 mb-5 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-2.5">
              <ShoppingCart className="w-7 h-7 text-theme-primary shrink-0" />
              Shopping Cart
              {mounted && (
                <span className="text-base sm:text-lg font-normal text-theme-muted">
                  ({cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'})
                </span>
              )}
            </h1>
            {mounted && cart.totalItems > 0 && (
              <button
                type="button"
                onClick={() => fetchTotals(cart.items)}
                disabled={totalsLoading}
                className="flex items-center gap-1.5 text-sm font-semibold text-theme-primary hover:text-theme-primary-dark transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${totalsLoading ? 'animate-spin' : ''}`} />
                Refresh totals
              </button>
            )}
          </div>

          {!mounted ? (
            <CartSkeleton />
          ) : cart.totalItems === 0 ? (
            <EmptyCart />
          ) : (
            <>
              <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-2.5 text-sm font-semibold text-green-700 mb-5">
                <Truck className="w-4 h-4 shrink-0" />
                Nationwide delivery: 1–5 business days to your location
              </div>

              <div className="flex flex-col gap-3.5 mb-6">
                {cart.items.map((item) => (
                  <CartItemRow key={item.id} item={item} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Right: summary column ── */}
        {!mounted ? (
          <SummarySkeleton />
        ) : (
          <CartSummary shipping={liveTotal?.total_shipping} tax={liveTotal?.total_tax} loading={totalsLoading} />
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
        href="/sale-shipping-containers"
        className="rounded-md bg-theme-primary hover:bg-theme-primary-dark text-white font-semibold px-6 py-3 text-sm transition-colors inline-block"
      >
        Shop Containers
      </Link>
    </div>
  )
}
