import Link from 'next/link'
import { Phone, ShoppingBag } from 'lucide-react'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { ROUTES } from '@/config/routes'
import { CONTACT_NUMBER } from '@/lib/helpers'
import { resolvePageMetadata } from '@/lib/seo'

/**
 * Where checkout goes while it is closed on this domain (Admin → Checkout).
 *
 * The proxy sends /checkout here whenever lib/checkoutGate.ts says checkout is
 * not open on the domain being visited, which by default is every domain: the
 * store takes no orders online until someone opens it. The cart is untouched,
 * so the visitor loses nothing, and the way forward is the phone.
 *
 * Static: the same for everyone, and nothing here reads the request.
 */

export function generateMetadata() {
  return resolvePageMetadata(ROUTES.CHECKOUT_UNAVAILABLE)
}

const TEL_HREF = `tel:${CONTACT_NUMBER.replace(/[^\d+]/g, '')}`

export default function CheckoutUnavailablePage() {
  return (
    <>
      <PageHeadScripts path={ROUTES.CHECKOUT_UNAVAILABLE} />

      {/* The (market) layout provides <main>; `page-fill` carries the
          background down to the footer on a short page in a tall window. */}
      <section
        aria-labelledby="checkout-unavailable-title"
        className="page-fill flex items-center justify-center bg-theme-subtle px-[5%] py-16 sm:py-24 dark:bg-neutral-950"
      >
        <div className="w-full max-w-xl rounded-lg border border-theme-border bg-theme-bg px-6 py-10 text-center shadow-sm sm:px-10 sm:py-12 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md border border-theme-border bg-theme-subtle dark:border-neutral-700 dark:bg-neutral-800">
            <ShoppingBag className="h-6 w-6 text-theme-primary dark:text-red-400" aria-hidden />
          </div>

          <p className="mt-5 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-theme-primary dark:text-red-400">
            Checkout
          </p>
          <h1
            id="checkout-unavailable-title"
            className="mt-2 text-2xl font-extrabold tracking-tight text-theme-dark sm:text-3xl dark:text-white"
          >
            Checkout isn&rsquo;t open yet
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-theme-muted sm:text-base dark:text-neutral-300">
            We&rsquo;re putting the finishing touches on our new store, so online ordering is switched off
            for now. Your cart is saved, and our team can place your order over the phone.
          </p>

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <a
              href={TEL_HREF}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-theme-primary px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-theme-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900"
            >
              <Phone className="h-4 w-4" aria-hidden />
              Call {CONTACT_NUMBER}
            </a>
            <Link
              href={ROUTES.CART}
              className="inline-flex items-center justify-center rounded-md border border-theme-border bg-theme-bg px-6 py-3.5 text-sm font-bold text-theme-dark transition-colors hover:border-theme-primary hover:text-theme-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
            >
              Back to cart
            </Link>
          </div>

          <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.15em] text-theme-muted dark:text-neutral-500">
            Your cart is saved &mdash; nothing has been charged
          </p>
        </div>
      </section>
    </>
  )
}
