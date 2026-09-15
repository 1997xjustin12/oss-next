'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, RefreshCw, Truck } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useStoredZip } from '@/hooks/useStoredZip'
import { DEFAULT_SHIPPING_METHOD, completeZip } from '@/lib/shippingQuote'
import { cartItemsToLineItems } from '@/lib/cart'
import { applyEnrichParams } from '@/lib/linkEnrich'
import { readVisitorZip } from '@/lib/visitorZip'
import { ROUTES } from '@/config/routes'
import { CartItemRow } from '@/components/cart/CartItemRow'
import { CartSummary } from '@/components/cart/CartSummary'
import { CartSkeleton, SummarySkeleton } from './CartSkeleton'
import type { CartItem } from '@/types/cart'
import type { GetOrderTotalPayload, OrderTotal } from '@/types/order'

export function CartPageClient() {
  const { cart } = useCart()
  const [mounted, setMounted] = useState(false)
  const [liveTotal, setLiveTotal] = useState<OrderTotal | null>(null)
  const [totalsLoading, setTotalsLoading] = useState(false)
  // The backend's reason it can't deliver to the stored ZIP, when that is the answer.
  const [refusal, setRefusal] = useState<string | null>(null)
  const { postcode, resolved: zipResolved } = useStoredZip()

  useEffect(() => {
    // Hydration-safe mount detection — cart data is client-only (localStorage),
    // so the server render and first client render must intentionally differ.
    // No external system to synchronize with here, so there's no non-effect way
    // to do this (same accepted pattern used elsewhere in this codebase).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  // Real backend totals — same /api/orders/get-total endpoint checkout uses,
  // so the two pages never disagree. With the visitor's stored ZIP the backend
  // also quotes delivery (for the default method), which CartSummary shows as
  // an estimate billed after the order.
  async function fetchTotals(items: CartItem[], zip: string) {
    const lineItems = cartItemsToLineItems(items)
    const hasContainer = items.some((item) => item.isContainer)
    const country = /^\d/.test(zip.trim()) ? 'US' : 'CA'
    // Only a complete ZIP is priced — each request carrying one can cost the
    // backend a paid Google lookup.
    const pricedZip = completeZip(zip, country)
    // A container can't be totalled without a delivery address — the backend
    // refuses it outright ("no_address"). Without a stored ZIP there is none to
    // send, so skip a request that always fails; CartSummary then says
    // "Calculated at checkout".
    if (lineItems.length === 0 || (hasContainer && !pricedZip)) {
      setLiveTotal(null)
      setRefusal(null)
      return
    }

    setTotalsLoading(true)
    try {
      const payload: GetOrderTotalPayload = {
        items: lineItems,
        ...(pricedZip
          ? {
              shipping_zip_code: pricedZip,
              shipping_country: country,
              ...(hasContainer ? { shipping_method: DEFAULT_SHIPPING_METHOD } : {}),
            }
          : {}),
      }
      const res = await fetch('/api/orders/get-total', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => null)
      if (res.ok && data) {
        setLiveTotal(data as OrderTotal)
        setRefusal(null)
      } else if (data?.code === 'undeliverable') {
        setLiveTotal(null)
        setRefusal(data.error)
      }
    } catch {
      // keep whatever total we last had
    } finally {
      setTotalsLoading(false)
    }
  }

  // Debounced so rapid qty +/- clicks batch into one call instead of one per
  // click. Waits for the stored ZIP to be read, so a container cart isn't
  // first skipped and then priced.
  useEffect(() => {
    if (!mounted || !zipResolved) return
    const handle = setTimeout(() => {
      fetchTotals(cart.items, postcode)
    }, 600)
    return () => clearTimeout(handle)
  }, [mounted, zipResolved, postcode, cart.items, cart.totalPrice])

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
                onClick={() => fetchTotals(cart.items, postcode)}
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
          <CartSummary
            shipping={liveTotal?.total_shipping}
            tax={liveTotal?.total_tax}
            quote={liveTotal?.shipping}
            refusal={refusal}
            loading={totalsLoading}
          />
        )}
      </div>
    </section>
  )
}

function EmptyCart() {
  // Carry the visitor's zip/depot onto the PLP link so "Shop Containers" lands
  // on a location-scoped listing, not an empty-zip page — same enrichment the
  // Navbar and ZipLookup apply. Lazy-read from localStorage: this component only
  // renders once the parent has mounted (client-side), so there's no SSR pass to
  // mismatch against, and applyEnrichParams no-ops when nothing is stored.
  const [href] = useState<string>(() => {
    if (typeof window === 'undefined') return ROUTES.PLP
    const { postcode, depot } = readVisitorZip()
    return applyEnrichParams(ROUTES.PLP, postcode, depot)
  })

  return (
    <div className="rounded-xl border border-theme-border bg-white p-10 sm:p-16 text-center">
      <ShoppingCart className="w-14 h-14 mx-auto text-theme-border mb-4" />
      <h2 className="text-2xl font-bold mb-1.5">Your cart is empty</h2>
      <p className="text-sm text-theme-muted mb-6 max-w-xs mx-auto">
        Browse our containers and add items to get started.
      </p>
      <Link
        href={href}
        className="rounded-md bg-theme-primary hover:bg-theme-primary-dark text-white font-semibold px-6 py-3 text-sm transition-colors inline-block"
      >
        Shop Containers
      </Link>
    </div>
  )
}
