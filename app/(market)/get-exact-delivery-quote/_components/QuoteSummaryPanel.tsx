'use client'

import Image from 'next/image'
import { Clock, Container, Info, Lock } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/formatters'
import type { DeliveryQuoteContext } from '@/types/deliveryQuote'
import { DeliveryZipEditor } from './DeliveryZipEditor'

/**
 * What the visitor is being quoted on, beside the form.
 *
 * Two sources, in priority order. When there is a cart, the cart is the answer:
 * someone who came here from checkout is asking about everything in it, and a
 * summary showing one container of several would understate the order they are
 * about to be quoted for. When the cart is empty — arriving from a product
 * page's Save Quote, or from an ad — the server-resolved `quote` describes the
 * single container in the URL instead.
 *
 * That split is why this is a Client Component: the cart lives in localStorage,
 * which no server render can see. The page around it stays server-rendered, so
 * the copy that matters for search is still in the HTML.
 *
 * The cart hydrates from storage in an effect, so the first paint has no items
 * and falls through to the server's version. That is the same branch an empty
 * cart takes, which is what makes the flash harmless rather than wrong.
 *
 * Sticky from `lg` up: the reason someone tolerates a contact form is the
 * number beside it, and scrolling it away removes the reason.
 */

const money = (n: number) => '$' + formatPrice(n)

export function QuoteSummaryPanel({ quote }: { quote: DeliveryQuoteContext }) {
  const { cart } = useCart()
  const fromCart = cart.items.length > 0

  const lines = fromCart
    ? cart.items.map((item) => ({
        key: item.id,
        title: item.name,
        image: item.image ?? null,
        quantity: item.quantity,
        value: money(item.price * item.quantity),
      }))
    : [
        {
          key: 'url',
          title: quote.productTitle,
          image: quote.productImage,
          quantity: quote.quantity,
          value: quote.subtotal ?? '',
        },
      ]

  const subtotal = fromCart ? money(cart.totalPrice) : quote.subtotal

  return (
    <aside className="lg:sticky lg:top-6 lg:self-start">
      <div className="rounded-lg border border-theme-border bg-theme-bg p-5 shadow-sm sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-base font-bold text-theme-primary sm:text-lg">Your quote summary</h2>

        <ul className="mt-4 space-y-4">
          {lines.map((line) => (
            <li key={line.key} className="flex items-start gap-4">
              <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md bg-theme-subtle dark:bg-neutral-800">
                {line.image ? (
                  <Image
                    src={line.image}
                    alt={line.title}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <Container
                    className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-theme-muted"
                    aria-hidden
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold leading-snug text-theme-dark dark:text-white">
                  {line.title}
                </p>
                {line.quantity > 1 && (
                  <p className="mt-0.5 text-xs text-theme-muted">Qty {line.quantity}</p>
                )}
              </div>

              {line.value && (
                <p className="shrink-0 text-sm font-semibold tabular-nums text-theme-dark dark:text-white">
                  {line.value}
                </p>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-5 border-t border-theme-border pt-4 dark:border-neutral-800">
          {subtotal && (
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <span className="font-semibold text-theme-mid dark:text-neutral-300">
                Subtotal
                {fromCart && (
                  <span className="ml-1 font-normal text-theme-muted">
                    ({cart.totalItems} item{cart.totalItems === 1 ? '' : 's'})
                  </span>
                )}
              </span>
              <span className="font-semibold tabular-nums text-theme-dark dark:text-white">
                {subtotal}
              </span>
            </div>
          )}

          {/* Edit sits with the destination it edits, not with the price above
              it — the ZIP is the only part of this panel a visitor can change
              from here, and putting the control anywhere else invites them to
              click it expecting to change the container. */}
          <div className="mt-1 flex justify-end">
            <DeliveryZipEditor handle={quote.handle} zip={quote.zip} quantity={quote.quantity} />
          </div>

          <div className="mt-2 flex items-start justify-between gap-4 text-sm">
            <span className="shrink-0 font-semibold text-theme-mid dark:text-neutral-300">
              Delivery to
            </span>
            <span className="text-right font-semibold text-[#0F6FBF] dark:text-sky-400">
              {quote.deliveryLabel ?? 'Not set yet'}
            </span>
          </div>

          <div className="mt-4 flex items-start justify-between gap-4 border-t border-theme-border pt-4 text-sm dark:border-neutral-800">
            <span className="shrink-0 font-semibold text-theme-mid dark:text-neutral-300">
              Est. delivery charge
            </span>
            <span
              className={
                quote.deliveryPending
                  ? 'text-right text-xs leading-relaxed text-theme-muted'
                  : 'text-right font-semibold tabular-nums text-theme-dark dark:text-white'
              }
            >
              {quote.deliveryCharge ?? 'Add a ZIP code to see this'}
            </span>
          </div>

          {/* Deliberately no combined total for a multi-item cart. Delivery for
              several containers is not the sum of their separate rates — it
              depends on how many trucks and how much total length — so adding
              one line's quote to the order value would produce a confident
              number that is wrong. */}
          {!fromCart && quote.total && !quote.deliveryPending && (
            <div className="mt-4 flex items-end justify-between gap-4 border-t border-theme-border pt-4 dark:border-neutral-800">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-theme-muted">
                Estimated total
              </span>
              <span className="text-2xl font-bold leading-none tabular-nums tracking-tight text-theme-dark dark:text-white">
                {quote.total}
              </span>
            </div>
          )}
        </div>

        <div className="mt-5 space-y-2.5 rounded-md border border-sky-100 bg-sky-50 p-4 dark:border-sky-900/60 dark:bg-sky-950/40">
          <p className="flex gap-2.5 text-xs leading-relaxed text-theme-mid dark:text-neutral-300">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600 dark:text-sky-400" aria-hidden />
            You&rsquo;ll receive your exact delivery price including taxes after we confirm your
            details.
          </p>
          <p className="flex gap-2.5 text-xs leading-relaxed text-theme-mid dark:text-neutral-300">
            <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600 dark:text-sky-400" aria-hidden />
            We typically respond in under 15 minutes during business hours.
          </p>
        </div>
      </div>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-theme-muted">
        <Lock className="h-3 w-3" aria-hidden />
        Your information is secure and will never be shared.
      </p>
    </aside>
  )
}
