'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Modal } from '@/components/ui/Modal'
import { ROUTES } from '@/config/routes'
import { CONTACT_NUMBER } from '@/lib/helpers'

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

const CONTACT_TEL = `tel:${CONTACT_NUMBER.replace(/[^\d+]/g, '')}`

/**
 * The one-depot-per-order prompt, in the "Whoops!" design: a container photo
 * on the left, the problem and the way out on the right.
 *
 * Go to Cart is the main action for both cases — what is holding the other
 * location is in the cart. Clearing the cart stays available as the secondary
 * way through, so nobody is stuck with an order they no longer want.
 */
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
    <Modal open={open} onClose={onClose} title="Whoops! There seems to be a problem." bare maxWidth="max-w-2xl">
      <div className="grid sm:grid-cols-[5fr_7fr]">
        {/* Decorative, so it is dropped on phones where the width is needed. */}
        <div className="relative hidden min-h-[22rem] bg-stone-800 sm:block">
          <Image
            src="/images/home-banners/hero-image.webp"
            alt=""
            fill
            sizes="280px"
            className="object-cover object-[30%_center]"
          />
          <div className="absolute left-4 top-4 rounded bg-white/95 px-2 py-1.5 shadow-sm">
            <Image
              src="/images/logo/oss-logo.webp"
              alt="On Site Storage Solutions"
              width={497}
              height={98}
              className="h-auto w-28"
            />
          </div>
        </div>

        <div className="flex flex-col items-center px-6 pb-6 pt-10 text-center sm:px-8">
          <h2 className="max-w-xs text-xl font-bold leading-snug text-[#4B4B4B] dark:text-white">
            Whoops! There seems to be a problem.
          </h2>

          <p className="mt-3 text-[15px] leading-relaxed text-theme-primary">
            {isZip
              ? 'To ensure a smooth shopping experience, please complete your current order or clear your cart before changing your location.'
              : 'To ensure a smooth shopping experience, please complete your current order or clear your cart before adding items from another location.'}
          </p>

          <p className="mt-3 text-xs text-theme-muted">
            In your cart: <strong className="text-theme-dark dark:text-white">{currentLocation}</strong>
            {' · '}
            {isZip ? 'New location' : 'This container'}:{' '}
            <strong className="text-theme-dark dark:text-white">{newLocation}</strong>
          </p>

          <Link
            href={ROUTES.CART}
            onClick={onClose}
            className="mt-7 inline-flex items-center justify-center rounded-md bg-[#3F3F3F] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2"
          >
            Go to Cart
          </Link>

          <button
            type="button"
            onClick={() => { onClearCart(); onClose() }}
            className="mt-3 text-xs font-semibold text-theme-muted underline underline-offset-2 transition-colors hover:text-theme-primary"
          >
            {isZip ? 'Clear Cart And Switch Location' : 'Clear Cart'}
          </button>

          <p className="mt-auto pt-6 text-sm text-theme-mid dark:text-gray-300">
            Call Us for more details.{' '}
            <a href={CONTACT_TEL} className="text-theme-primary hover:underline">
              {CONTACT_NUMBER}
            </a>
          </p>
        </div>
      </div>
    </Modal>
  )
}
