'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Check, Loader2 } from 'lucide-react'
import { useAddContainerToCart } from '@/hooks/useAddContainerToCart'
import { useCart } from '@/hooks/useCart'
import type { ChatProductCard } from '@/app/api/chat/products/route'

/**
 * The products one reply recommended, rendered directly beneath it.
 *
 * Attached to the message rather than collected into a single shelf at the foot
 * of the panel. A shelf can only ever show the *latest* recommendation, so
 * scrolling back through a conversation — or restoring one from history — left
 * every earlier answer stripped of the products it was talking about. Anchoring
 * the cards to their own reply means a restored thread looks exactly like the
 * live one did.
 */
export function ChatProductCards({ products }: { products: ChatProductCard[] }) {
  const { addContainerToCart } = useAddContainerToCart()
  const { addItem } = useCart()
  // Keyed by handle so two cards never share a spinner.
  const [busy, setBusy] = useState<string | null>(null)
  const [added, setAdded] = useState<string | null>(null)

  if (products.length === 0) return null

  function handleAdd(card: ChatProductCard) {
    setBusy(card.handle)

    // Containers go through addContainerToCart so the cart's one-depot-per-order
    // rule and the generic-listing guard apply here exactly as they do on the
    // product page. Accessories have neither constraint.
    //
    // showModal = false in both cases: the app's added-to-cart modal would open
    // behind this panel. The card confirms inline instead.
    const ok = card.cartItem.isContainer
      ? addContainerToCart({ ...card.cartItem, isContainer: true, location: card.cartItem.location ?? '' }, false)
      : (addItem(card.cartItem, false), true)

    setBusy(null)
    if (ok) {
      setAdded(card.handle)
      setTimeout(() => setAdded((current) => (current === card.handle ? null : current)), 2000)
    }
  }

  return (
    <section aria-label="Products mentioned in this reply" className="mt-2 max-w-[85%]">
      <ul className="flex snap-x gap-2 overflow-x-auto pb-1">
        {products.map((card) => (
          <li
            key={card.handle}
            className="w-44 shrink-0 snap-start overflow-hidden rounded-lg border border-theme-border bg-theme-bg dark:border-neutral-700 dark:bg-neutral-900"
          >
            <Link href={card.url} className="block">
              <div className="relative aspect-4/3 bg-theme-subtle dark:bg-neutral-800">
                {card.image && (
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    sizes="176px"
                    className="object-cover"
                  />
                )}
              </div>
            </Link>

            <div className="p-2.5">
              <Link
                href={card.url}
                className="line-clamp-2 text-xs font-bold leading-snug text-theme-dark hover:text-theme-primary dark:text-neutral-100 dark:hover:text-red-400"
              >
                {card.title}
              </Link>

              <p className="mt-1.5 text-sm font-extrabold text-theme-dark dark:text-white">{card.priceLabel}</p>
              {/* Never the amount on its own — ~8,000 listings are priced per month. */}
              <p className="text-[10px] leading-tight text-theme-muted dark:text-neutral-500">{card.priceBasis}</p>

              {card.addable ? (
                <button
                  type="button"
                  onClick={() => handleAdd(card)}
                  disabled={busy === card.handle || !card.inStock}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md bg-theme-primary px-2 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-theme-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy === card.handle ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                  ) : added === card.handle ? (
                    <>
                      <Check className="h-3.5 w-3.5" aria-hidden />
                      Added
                    </>
                  ) : card.inStock ? (
                    'Add to cart'
                  ) : (
                    'Out of stock'
                  )}
                </button>
              ) : (
                // A generic listing has no depot behind it, so there is nothing
                // to add — but the page is real and the assistant pointed at it.
                <Link
                  href={card.url}
                  className="mt-2 flex w-full items-center justify-center rounded-md border border-theme-border px-2 py-1.5 text-[11px] font-bold text-theme-dark transition-colors hover:border-theme-primary hover:text-theme-primary dark:border-neutral-600 dark:text-neutral-200 dark:hover:text-red-400"
                >
                  View details
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
