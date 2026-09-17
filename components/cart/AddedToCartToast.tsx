'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, X } from 'lucide-react'
import { ROUTES } from '@/config/routes'
import { formatMoney } from '@/lib/formatters'
import type { CartItem } from '@/types/cart'

/**
 * The quiet confirmation that something reached the cart.
 *
 * The alternative is `AddedToCartModal`, which stops the page to show the item's
 * specs and a row of accessories. Both are kept and an admin chooses between
 * them — see lib/cartNotice.ts. This one exists for the case the modal cannot
 * serve: a visitor adding a second and third container does not need to be
 * introduced to their own cart each time, and an interruption they have to
 * dismiss to carry on shopping costs more than the cross-sell earns.
 *
 * ## Details that matter more than they look
 *
 * It does not trap focus and nothing here is focused on appearance. A toast
 * that stole focus would throw a keyboard user out of the page they were
 * working through — the opposite of the "gets out of the way" this exists for.
 * `role="status"` announces it to a screen reader without moving anyone.
 *
 * It dismisses itself after five seconds, and the timer restarts whenever
 * another item arrives, so adding three things in a row leaves one toast
 * showing the last of them rather than a stack. The close button is still there
 * for anyone who wants it gone sooner, and hovering holds it open — a toast
 * that vanishes while you are reaching for its link is a broken link.
 *
 * It sits clear of the chat launcher in the bottom-right corner. Covering that
 * button is how a confirmation becomes a support problem.
 */

const DISMISS_MS = 5_000

export function AddedToCartToast({ item, onClose }: { item: CartItem | null; onClose: () => void }) {
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (!item || paused) return
    const timer = setTimeout(onClose, DISMISS_MS)
    return () => clearTimeout(timer)
    // `item` by identity: every add dispatches a fresh object, so the timer
    // restarts even when the same product is added twice.
  }, [item, paused, onClose])

  if (!item) return null

  return (
    <div
      role="status"
      aria-live="polite"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="fixed inset-x-4 bottom-24 z-[60] sm:left-auto sm:right-4 sm:w-[22rem]"
    >
      <div className="flex items-start gap-3 rounded-lg border border-theme-border bg-theme-bg p-3.5 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-theme-success dark:text-emerald-400" aria-hidden />

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-theme-dark dark:text-white">Added To Cart</p>
          <p className="mt-0.5 truncate text-xs text-theme-muted dark:text-neutral-400">
            {item.name}
            {item.quantity > 1 ? ` × ${item.quantity}` : ''}
            {item.price > 0 ? ` · ${formatMoney(item.price * item.quantity)}` : ''}
          </p>

          <div className="mt-2 flex items-center gap-3">
            <Link
              href={ROUTES.CART}
              onClick={onClose}
              className="text-xs font-bold text-theme-primary underline-offset-2 hover:underline"
            >
              View Cart
            </Link>
            <Link
              href={ROUTES.CHECKOUT}
              onClick={onClose}
              className="text-xs font-semibold text-theme-muted underline-offset-2 hover:text-theme-primary hover:underline"
            >
              Checkout
            </Link>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="-mr-1 -mt-1 shrink-0 rounded-md p-1 text-theme-muted transition-colors hover:bg-theme-subtle hover:text-theme-dark dark:hover:bg-white/10 dark:hover:text-white"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}
