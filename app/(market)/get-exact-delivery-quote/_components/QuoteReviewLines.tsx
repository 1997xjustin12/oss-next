'use client'

import Image from 'next/image'
import { Container } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { formatMoney } from '@/lib/formatters'
import type { QuoteLine } from '@/types/deliveryQuote'

/**
 * The quote's header and line items on step 4, cart first.
 *
 * Same precedence as the summary panel on step 3, for the same reason: someone
 * who submitted from a full cart is owed a confirmation of that cart, not of
 * whichever container the URL happens to name. Falls back to the server's lines
 * when there is no cart — a Save Quote from a product page, or a direct visit.
 *
 * The header is in here rather than left in the page because it has to make the
 * same choice. A cart of two containers under the heading "Your shipping
 * container" reads as one order that lost an item.
 */
export function QuoteReviewLines({
  lines,
  productTitle,
}: {
  lines: QuoteLine[]
  /** The single container from the URL, used when there is no cart. */
  productTitle: string
}) {
  const { cart } = useCart()
  const fromCart = cart.items.length > 0

  const rows: QuoteLine[] = fromCart
    ? cart.items.map((item) => ({
        label: item.quantity > 1 ? `${item.name} x ${item.quantity}` : item.name,
        value: formatMoney(item.price * item.quantity),
        image: item.image ?? null,
      }))
    : lines

  const heading = fromCart
    ? `Your order — ${cart.totalItems} item${cart.totalItems === 1 ? '' : 's'}`
    : productTitle

  return (
    <>
      <div className="border-b border-theme-border bg-theme-subtle px-4 py-3 text-sm font-bold text-theme-dark dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-white">
        {heading}
      </div>

      {rows.length === 0 ? (
        <p className="px-4 py-4 text-sm leading-relaxed text-theme-muted">
          We&rsquo;ll confirm the container and its delivery price when we come back to you.
        </p>
      ) : (
        <ul className="divide-y divide-theme-border px-4 text-sm dark:divide-neutral-800">
          {rows.map((line) => (
            <li key={line.label} className="flex items-center justify-between gap-4 py-2.5">
              {/* A thumbnail only where there is a product to show. Delivery and
                  tax rows carry no image, and an empty frame beside them would
                  read as a picture that failed to load rather than a row that
                  never had one. */}
              {line.image !== undefined && (
                <span className="relative h-11 w-14 shrink-0 overflow-hidden rounded bg-theme-subtle dark:bg-neutral-800">
                  {line.image ? (
                    <Image src={line.image} alt="" fill sizes="56px" className="object-cover" />
                  ) : (
                    <Container
                      className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-theme-muted"
                      aria-hidden
                    />
                  )}
                </span>
              )}
              <span className="min-w-0 flex-1 text-theme-muted">{line.label}</span>
              <span
                className={
                  line.muted
                    ? 'shrink-0 text-right text-theme-muted'
                    : 'shrink-0 text-right font-medium tabular-nums text-theme-dark dark:text-white'
                }
              >
                {line.value}
              </span>
            </li>
          ))}
        </ul>
      )}

      {fromCart && (
        <div className="flex items-baseline justify-between gap-6 border-t border-theme-border px-4 py-2.5 text-sm dark:border-neutral-800">
          <span className="font-semibold text-theme-mid dark:text-neutral-300">Subtotal</span>
          <span className="font-semibold tabular-nums text-theme-dark dark:text-white">
            {formatMoney(cart.totalPrice)}
          </span>
        </div>
      )}
    </>
  )
}
