'use client'

import Link from 'next/link'
import { MapPinOff, Trash2, ArrowRight, ShoppingCart } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { ROUTES } from '@/config/routes'

type Props = {
  open:            boolean
  onClose:         () => void
  currentLocation: string
  newLocation:     string
  onClearCart:     () => void
  /**
   * What was blocked. `add` is a container from another depot going into the
   * cart; `zip` is the visitor moving their location to another depot while
   * the cart already holds a container. Same rule, different sentence — and
   * for a ZIP change, clearing the cart is a way *through*, so it finishes the
   * switch rather than just emptying the cart.
   */
  reason?:         'add' | 'zip'
}

const SECONDARY =
  'flex-1 inline-flex items-center justify-center gap-2 rounded-md border-2 border-theme-border px-4 py-2.5 text-sm font-bold text-theme-dark dark:text-white dark:border-neutral-700 hover:border-theme-primary hover:text-theme-primary transition-colors'
const PRIMARY =
  'flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-theme-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-theme-primary-dark transition-colors'

export function CartLocationConflictModal({
  open,
  onClose,
  currentLocation,
  newLocation,
  onClearCart,
  reason = 'add',
}: Props) {
  const isZip = reason === 'zip'

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isZip ? 'Your Cart Is From Another Location' : 'One Pickup Location at a Time'}
      footer={
        <>
          <button
            type="button"
            onClick={() => { onClearCart(); onClose() }}
            className={SECONDARY}
          >
            <Trash2 className="w-4 h-4" />
            {isZip ? 'Clear Cart & Switch' : 'Clear Cart'}
          </button>
          {/* A ZIP change has nothing to check out yet — the useful next step
              is to see what is holding the old location, so this goes to the
              cart. Adding a container keeps its original "finish this order"
              action. */}
          {isZip ? (
            <Link href={ROUTES.CART} onClick={onClose} className={PRIMARY}>
              <ShoppingCart className="w-4 h-4" /> Go to Cart
            </Link>
          ) : (
            <Link href={ROUTES.CHECKOUT} onClick={onClose} className={PRIMARY}>
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-theme-primary-light dark:bg-theme-primary/15">
          <MapPinOff className="w-6 h-6 text-theme-primary" />
        </div>

        <p className="text-center">
          {isZip ? (
            <>
              Your cart has a container from <strong>{currentLocation}</strong>. Each order ships
              from one location, so your location can&rsquo;t change while it&rsquo;s in your cart.
            </>
          ) : (
            <>
              For a smooth delivery process, you can only add shipping containers from the{' '}
              <strong>same location</strong> to your cart.
            </>
          )}
        </p>

        <div className="rounded-lg bg-theme-subtle dark:bg-white/5 border border-theme-border dark:border-neutral-800 px-4 py-3 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold uppercase tracking-wide text-theme-muted">In Your Cart</span>
            <span className="font-semibold text-theme-dark dark:text-white">{currentLocation}</span>
          </div>
          <div className="flex items-center justify-between gap-2 mt-1.5 pt-1.5 border-t border-theme-border dark:border-neutral-800">
            <span className="font-bold uppercase tracking-wide text-theme-muted">
              {isZip ? 'New Location' : 'This Container'}
            </span>
            <span className="font-semibold text-theme-primary">{newLocation}</span>
          </div>
        </div>

        <p className="text-center text-xs text-theme-muted">
          {isZip
            ? 'Finish that order first, or clear your cart to switch to the new location.'
            : 'Clear your cart to start a new order at this location, or complete checkout for your current order first.'}
        </p>
      </div>
    </Modal>
  )
}
