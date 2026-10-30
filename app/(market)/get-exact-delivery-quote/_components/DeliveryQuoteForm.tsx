'use client'

import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2 } from 'lucide-react'
import { ROUTES } from '@/config/routes'
import { useZohoQuoteForm } from '@/hooks/useZohoQuoteForm'
import { completeZip } from '@/lib/shippingQuote'
import { ZOHO_HONEYPOT } from '@/lib/zohoQuoteForm'
import { QUOTE_FORM_ID, QUOTE_SENDING_EVENT } from './quoteFormId'

/**
 * Step 3's form: the Zoho "Save Quote Form" (lib/zohoQuoteForm.ts), the same
 * one the product page's guest lead modal shows, in this page's style.
 *
 * What it shares with the modal comes from `useZohoQuoteForm`: it opens filled
 * in from the details this browser already has, fills City and State from the
 * ZIP, and sends to Zoho CRM (app/api/zoho-quote), moving on only once Zoho has
 * accepted. What is this page's own: the ZIP starts from the one the quote
 * beside it is priced to, and an accepted submission continues to checkout,
 * which fills itself in from the details just saved.
 *
 * Submitted by the summary panel's "Proceed with checkout" (QuoteProceedButton),
 * which sits outside this tree: it names this form, and this form tells it when
 * a send starts and ends (QUOTE_SENDING_EVENT), so it can show the wait and
 * come back to life after a refusal.
 *
 * Asked here until 2026-10-30 and dropped with the move to Zoho: an apartment
 * line, the country, "Invoice address is the same as delivery address" and a
 * shipping note. Zoho's form has none of them, and checkout asks for the
 * address in full before an order can be placed.
 */

const FIELD =
  'h-12 w-full rounded-md border border-theme-border bg-theme-bg px-4 text-sm text-theme-dark outline-none transition-colors focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/25 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white'
const LABEL = 'mb-1.5 block text-xs font-semibold text-theme-dark dark:text-neutral-200'
const REQUIRED = <span className="text-theme-primary">*</span>

type Props = {
  /** The ZIP the quote beside the form is priced to (the URL's), if any. */
  quotedZip?: string
  /** The step heading, server-rendered. */
  children: ReactNode
}

export function DeliveryQuoteForm({ quotedZip, children }: Props) {
  const router = useRouter()
  const form = useZohoQuoteForm({ prefer: { zip: quotedZip ?? '' } })
  const field = form.fieldProps
  // Accepted and on the way to checkout: still busy, so the button does not
  // come back to life for the moment the navigation takes.
  const [leaving, setLeaving] = useState(false)
  const busy = form.sending || leaving

  // Tell "Proceed with checkout" when a send starts and ends.
  useEffect(() => {
    document.dispatchEvent(new CustomEvent(QUOTE_SENDING_EVENT, { detail: busy }))
  }, [busy])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (leaving) {
      event.preventDefault()
      return
    }
    const submitted = await form.handleSubmit(event)
    if (!submitted) return
    setLeaving(true)
    router.push(ROUTES.CHECKOUT)
  }

  const zip = form.values.zip.trim()
  const zipDiffers = !!quotedZip && !!completeZip(zip, undefined) && completeZip(zip, undefined) !== completeZip(quotedZip, undefined)

  return (
    <form
      // Named so the summary panel's "Proceed with checkout" can submit it from
      // outside this tree — see QuoteProceedButton.
      id={QUOTE_FORM_ID}
      onSubmit={handleSubmit}
      noValidate
      aria-busy={busy}
      className="rounded-lg border border-theme-border bg-theme-bg p-5 shadow-sm sm:p-7 dark:border-neutral-800 dark:bg-neutral-900"
    >
      {/* Zoho's honeypot: off screen and out of the tab order, so only a bot
          fills it; the server then sends nothing. */}
      <input type="text" name={ZOHO_HONEYPOT} tabIndex={-1} autoComplete="off" aria-hidden className="sr-only" />

      {children}

      {form.error && (
        <p
          role="alert"
          className="mt-4 rounded-md border border-theme-primary/30 bg-theme-primary/5 px-4 py-3 text-sm font-medium text-theme-primary dark:border-theme-primary/40 dark:bg-theme-primary/10 dark:text-red-300"
        >
          {form.error}
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className={LABEL}>
            First Name {REQUIRED}
          </label>
          <input id="firstName" autoComplete="given-name" placeholder="First Name" className={FIELD} {...field('firstName')} />
        </div>
        <div>
          <label htmlFor="lastName" className={LABEL}>
            Last Name {REQUIRED}
          </label>
          <input id="lastName" autoComplete="family-name" placeholder="Last Name" className={FIELD} {...field('lastName')} />
        </div>
        <div>
          <label htmlFor="phone" className={LABEL}>
            Phone Number {REQUIRED}
          </label>
          <input id="phone" type="tel" autoComplete="tel" placeholder="Phone Number" className={FIELD} {...field('phone')} />
          <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-theme-success-dark dark:text-emerald-400">
            <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
            We&rsquo;ll use this to send you your exact delivery quote.
          </p>
        </div>
        <div>
          <label htmlFor="email" className={LABEL}>
            Email Address {REQUIRED}
          </label>
          <input id="email" type="email" autoComplete="email" placeholder="Email Address" className={FIELD} {...field('email')} />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-bold text-theme-primary sm:text-xl">Delivery Address:</h3>
        <p className="mt-1 text-xs text-theme-muted">
          Where the container is going. We use this to price the delivery and to fill in your checkout.
        </p>

        <div className="mt-3 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="street" className={LABEL}>
              Street Address
            </label>
            <input id="street" autoComplete="shipping address-line1" placeholder="Street Address" className={FIELD} {...field('street')} />
          </div>

          {/* ZIP first: City and State fill in from it. */}
          <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:col-span-2 sm:grid-cols-3">
            <div>
              <label htmlFor="zip" className={LABEL}>
                Zipcode {REQUIRED}
              </label>
              <input id="zip" autoComplete="shipping postal-code" placeholder="Zipcode" className={FIELD} {...field('zip')} />
              {zipDiffers && (
                <p className="mt-1.5 text-xs font-medium text-theme-primary">
                  Checkout will price delivery to {zip} instead of {quotedZip}.
                </p>
              )}
            </div>
            <div>
              <label htmlFor="city" className={LABEL}>
                City
              </label>
              <div className="relative">
                <input
                  id="city"
                  autoComplete="shipping address-level2"
                  placeholder={form.zipLooking ? 'Looking up…' : 'City'}
                  className={FIELD}
                  {...field('city')}
                />
                {form.zipLooking && (
                  <Loader2 aria-hidden className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-theme-muted" />
                )}
              </div>
            </div>
            <div>
              <label htmlFor="state" className={LABEL}>
                State
              </label>
              <input id="state" autoComplete="shipping address-level1" placeholder="State" className={FIELD} {...field('state')} />
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
