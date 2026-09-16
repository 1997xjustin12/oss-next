'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShieldCheck, BadgeCheck } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { getGuestLead } from '@/lib/guestCapture'
import { readVisitorZip } from '@/lib/visitorZip'
import { ROUTES } from '@/config/routes'
import { formatMoney } from '@/lib/formatters'
import { useCartDeliveryEstimate } from '@/hooks/useCartDeliveryEstimate'
import {
  DEFAULT_SHIPPING_METHOD,
  cheapestQuotedMethod,
  deliveryPriceLabel,
  isDeliveryBilledLater,
  selectedShippingOption,
} from '@/lib/shippingQuote'
import type { ShippingQuote } from '@/types/order'

type Props = {
  /** Real total_shipping from /api/orders/get-total — undefined/0 until checkout knows a ZIP. */
  shipping?: number
  /** Real total_tax from /api/orders/get-total — undefined/0 until checkout knows a ZIP. */
  tax?: number
  /** True while a get-total request is in flight. */
  loading?: boolean
  /** The backend's delivery quote for the stored ZIP, when it gave one. */
  quote?: ShippingQuote
  /** The backend's reason it can't deliver to the stored ZIP. */
  refusal?: string | null
}


export function CartSummary({ shipping = 0, tax = 0, loading = false, quote, refusal = null }: Props) {
  const { cart, clearCart } = useCart()
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  // Delivery is billed after the order (backend `estimate_only`, decided
  // 2026-09-15), so an estimate is shown beside the total, never inside it —
  // the total is what checkout will charge. The backend's quote for the default
  // method comes first; the product page's own estimate is the fallback when
  // the backend gave none.
  const estimate = useCartDeliveryEstimate(cart.items)
  const charged = shipping > 0
  // The cheapest method that delivers — the same one the product page quotes
  // and checkout now pre-selects, so the figure does not change between pages.
  const quoted =
    !charged && quote && !quote.accessories_only && isDeliveryBilledLater(quote)
      ? (cheapestQuotedMethod(quote) ?? selectedShippingOption(quote, DEFAULT_SHIPPING_METHOD))
      : null
  const fallbackAmount = !charged && !quote && !refusal ? estimate.amount : null
  const estimateAmount = quoted ? quoted.cost : fallbackAmount
  const total = Math.max(0, cart.totalPrice + (charged ? shipping : 0) + tax)

  /**
   * Checkout, or a detour for someone we cannot yet reach.
   *
   * Delivery is priced per address and quoted by a person, so an order from a
   * visitor we have no name, email or phone for cannot actually be progressed —
   * it becomes a cart that sits there. Guests are sent to the quote flow to
   * give us those, and land back at checkout knowing what delivery costs.
   *
   * Decided on click rather than baked into `href`: the lead lives in
   * localStorage, and reading it during render would differ between the server
   * pass and the browser's, which is a hydration mismatch. The href stays
   * `/checkout` so the link is right for everyone who is already known to us.
   *
   * A single-container cart carries its handle so the quote page can price
   * delivery straight away. A mixed cart does not: combined delivery is not the
   * sum of separate rates — it depends on trucks and total length — so quoting
   * one line's rate for the whole order would be a wrong number, confidently
   * displayed.
   */
  function handleCheckout(event: React.MouseEvent<HTMLAnchorElement>) {
    if (isAuthenticated || getGuestLead()) return

    event.preventDefault()

    const containers = cart.items.filter((item) => item.isContainer)
    const only = containers.length === 1 ? containers[0] : null
    // `rawHit` is the loosely-typed search hit, so every field off it is
    // `unknown` — and it is absent entirely on carts saved before that field
    // existed. Both cases just mean no handle to pass.
    const handle = typeof only?.rawHit?.handle === 'string' ? only.rawHit.handle : undefined
    // The app's own reader rather than the raw key: it prefers a ZIP in the
    // URL over a stored one and handles storage throwing in private mode. It
    // can still come back empty — a visitor whose ZIP only ever arrived as a
    // query parameter has nothing stored — in which case the quote page shows
    // "Not set yet" and its Edit control is how they set one.
    const zip = readVisitorZip().postcode || undefined

    router.push(
      ROUTES.DELIVERY_QUOTE_FOR({
        handle,
        zip,
        qty: only?.quantity,
      }),
    )
  }

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
          <span className="font-semibold">{formatMoney(cart.totalPrice)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-theme-muted">
            {quoted
              ? `Est. delivery (${quoted.plain_label})`
              : fallbackAmount !== null
                ? `Est. delivery to ${estimate.zip}`
                : 'Delivery fee'}
          </span>
          {loading || (!charged && !quote && !refusal && estimate.loading) ? (
            <span className="font-semibold text-theme-muted italic">Calculating…</span>
          ) : charged ? (
            <span className="font-semibold">{formatMoney(shipping)}</span>
          ) : quoted ? (
            <span className="font-semibold">{deliveryPriceLabel(quoted)}</span>
          ) : fallbackAmount !== null ? (
            <span className="font-semibold">{formatMoney(fallbackAmount)}</span>
          ) : refusal ? (
            <span className="font-semibold text-theme-muted italic">Not available</span>
          ) : (
            <span className="font-semibold text-theme-muted italic">Calculated at checkout</span>
          )}
        </div>
        {!loading && estimateAmount !== null && estimateAmount > 0 && (
          <p className="-mt-1 text-[11px] text-theme-muted">
            Billed after your order — not included in the total.
          </p>
        )}
        {!loading && refusal && (
          <p role="alert" className="rounded-md bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
            {refusal} Call us at{' '}
            <a href="tel:8889779085" className="underline">(888) 977-9085</a>.
          </p>
        )}
        {!loading && quote?.need_to_call && !refusal && (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
            {quote.restriction || 'Delivery to this address needs a quick call to arrange.'} Call us at{' '}
            <a href="tel:8889779085" className="underline">(888) 977-9085</a>.
          </p>
        )}
        <hr className="border-theme-border" />
        <div className="flex justify-between">
          <span className="text-theme-muted">Est. Tax</span>
          {loading ? (
            <span className="font-semibold text-theme-muted italic">Calculating…</span>
          ) : tax > 0 ? (
            <span className="font-semibold">{formatMoney(tax)}</span>
          ) : (
            <span className="font-semibold text-theme-muted italic">At checkout</span>
          )}
        </div>
      </div>

      <div className="flex justify-between items-baseline pt-3.5 border-t-2 border-theme-dark mb-1">
        <span className="text-lg font-extrabold">Total</span>
        <span className="text-3xl font-extrabold text-theme-primary">{formatMoney(total)}</span>
      </div>
      <p className="text-[11px] text-theme-muted mb-5">
        *Tax calculated at checkout. No sales tax on most container orders.
      </p>

      <Link
        href={ROUTES.CHECKOUT}
        onClick={handleCheckout}
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
          Clear Cart
        </button>
      )}
    </aside>
  )
}
