'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, Loader2, Phone, X } from 'lucide-react'
import { useZohoQuoteForm } from '@/hooks/useZohoQuoteForm'
import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import { PlpLink } from '@/components/shared/PlpLink'
import { ZohoQuotePost } from '@/components/shared/ZohoQuotePost'
import { ROUTES } from '@/config/routes'
import { CONTACT_NUMBER } from '@/lib/helpers'
import { ZOHO_QUOTE_FORM, zohoQuoteToLead } from '@/lib/zohoQuoteForm'
import type { GuestLead } from '@/lib/guestCapture'

/**
 * Asks a signed-out visitor who they are, at the moment they add a container,
 * then shows them the quote their details bought.
 *
 * Two views on one track:
 *
 *   1. **Details** — the Zoho "Save Quote Form" (lib/zohoQuoteForm.ts). One
 *      action: Get Quote, which posts the details to Zoho CRM (where the lead
 *      is kept; this app stores none) and saves the quote in this browser.
 *   2. **Quote** — the priced selection, and confirmation that the quotation
 *      is coming by email. One state: there is nothing left to press.
 *
 * The second view is the point. Asking for contact details in exchange for
 * nothing is a toll gate; asking in exchange for a quote the visitor can read
 * back is a trade, and it gives the details somewhere to be used rather than
 * just collected.
 *
 * The form's fields, prefill, ZIP lookup and posting come from
 * `useZohoQuoteForm`, shared with the other areas that show the same form;
 * this component brings the look and the two steps.
 */

/** One row of the quote. The caller formats the value; this only lays it out. */
export type QuoteLine = {
  label: string
  value: string
  /** Renders quieter — for context lines like distance rather than money. */
  muted?: boolean
  /**
   * A cost rather than a description of what is being bought.
   *
   * The first one gets a rule above it, which is what separates "here is the
   * container" from "here is what it costs" without a second heading.
   */
  charge?: boolean
}

type Props = {
  open: boolean
  /** What is being quoted, so the modal never reads as a random interruption. */
  productTitle: string
  priceLabel: string
  /** Rows of the quote view, already formatted. */
  quoteLines: QuoteLine[]
  /** Headline figure of the quote view. */
  quoteTotal: string
  /** e.g. `/mo` — kept separate so it can be set smaller than the figure. */
  quoteTotalSuffix?: string
  /**
   * Details captured, and the quote filed.
   *
   * One action, because that is what the visitor pressed. A separate Save
   * Quote button lived on step two between 2026-09-22 and 2026-09-23 and was
   * removed: the step announces that the quotation is coming by email, so
   * there is nothing left for a second press to do.
   */
  onSubmit: (lead: Omit<GuestLead, 'capturedAt'>) => void
  /** Close without adding — the X, Escape, or the backdrop. */
  onDismiss: () => void
  /**
   * Fires when the ZIP typed in the form resolves to a place, with its bare postcode.
   *
   * Lets the caller re-price delivery for where the container is actually
   * going. Without it the quote on step 2 would still be priced to whatever ZIP
   * was in the page's own field — which is the wrong number wearing the right
   * label, and worse than showing none.
   */
  onAddressZipChange?: (postcode: string) => void
}

const FIELD =
  'w-full rounded-md border border-theme-border bg-theme-bg px-3 py-2.5 text-sm text-theme-dark outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white transition-colors placeholder:text-theme-muted focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20'
const LABEL = 'mb-1.5 block text-[13px] font-semibold text-theme-dark-2 dark:text-gray-200'

const PRIMARY_BUTTON =
  'flex h-11 flex-1 items-center justify-center rounded-md bg-theme-primary px-5 text-sm font-bold text-white transition-colors hover:bg-theme-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2'
const SECONDARY_BUTTON =
  'flex h-11 flex-1 items-center justify-center rounded-md border border-theme-border bg-theme-bg px-5 text-sm font-semibold text-theme-dark transition-colors hover:border-theme-primary hover:text-theme-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary dark:border-neutral-700 dark:bg-neutral-900 dark:text-white'

type Step = 'details' | 'quote'

export function GuestLeadModal({
  open,
  productTitle,
  priceLabel,
  quoteLines,
  quoteTotal,
  quoteTotalSuffix,
  onSubmit,
  onDismiss,
  onAddressZipChange,
}: Props) {
  const [step, setStep] = useState<Step>('details')

  /**
   * The form, opened with the visitor's saved details (their last submission
   * here or in the other areas with this form, else the guest lead and the
   * page's ZIP), so someone who has given them once confirms rather than
   * retypes. City and State fill from the ZIP.
   *
   * The ZIP lookup runs only while open: the modal is mounted closed on every
   * product page. A resolved ZIP re-prices delivery behind the modal, so the
   * quote on step 2 is for where the container is going. Not saved as the
   * visitor's location and no depot swap: this is a form field, and silently
   * relocating the page would be a surprising thing for it to do.
   */
  const form = useZohoQuoteForm({
    active: open,
    onZipResolved: (zip) => onAddressZipChange?.(zip),
  })

  /**
   * Fill blanks again each time the dialog opens.
   *
   * The panel renders this component on every page load, so the form's first
   * values are read before the visitor has typed anything — and typing a ZIP
   * into the page behind is usually the first thing they do. Re-reading on open
   * picks that up, and anything submitted elsewhere since.
   *
   * Adjusted during render rather than from an effect: this is state derived
   * from a prop changing, which is React's own pattern for it, and it avoids a
   * paint with the wrong value in the box. It only fills blanks, so it never
   * overwrites what the visitor typed here.
   */
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) form.fillBlanks()
  }

  const firstFieldRef = useRef<HTMLInputElement>(null)

  // The latest onDismiss, read by the open/close effect below — and kept OUT of
  // that effect's dependencies on purpose. ProductInfoPanel passes a new
  // function on every render, and each new one re-ran the effect, which
  // re-focused the Name field. So whenever the product page re-rendered behind
  // the open modal (delivery rates arriving, the depot swap settling), the
  // cursor was pulled out of whatever the visitor was typing in, and the rest
  // of their email went into the Name field. Found by the e2e journeys.
  const onDismissRef = useRef(onDismiss)
  useEffect(() => {
    onDismissRef.current = onDismiss
  }, [onDismiss])

  useEffect(() => {
    if (!open) return

    function onKey(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      // Rewind here too, not just in the close button's handler: this fires the
      // prop directly, so without it Escape on the quote view leaves the step
      // behind and the next visitor to open the modal lands on a stale quote
      // instead of the form.
      setStep('details')
      onDismissRef.current()
    }
    window.addEventListener('keydown', onKey)

    // The page behind must not scroll while a full-screen sheet is open.
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    firstFieldRef.current?.focus()

    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  if (!open) return null

  function close() {
    setStep('details')
    onDismiss()
  }


  /**
   * The checks and saving are the form's (useZohoQuoteForm). When they pass,
   * the event is left alone so the browser posts the form to Zoho, in the
   * hidden frame, while this slides to the quote and the caller files it.
   */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const submitted = form.handleSubmit(event)
    if (!submitted) return
    onSubmit(zohoQuoteToLead(submitted))
    setStep('quote')
  }

  const field = form.fieldProps

  const onQuote = step === 'quote'

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="guest-lead-title"
      className="fixed inset-0 z-9999 flex items-start justify-center overflow-y-auto bg-black/55 p-0 sm:items-center sm:p-6"
    >
      <div className="relative min-h-full w-full bg-theme-bg dark:bg-neutral-900 sm:min-h-0 sm:max-w-2xl sm:rounded-lg sm:border sm:border-theme-border sm:shadow-2xl dark:sm:border-neutral-800">
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          // Step one puts a red band behind this, where a muted grey X is
          // nearly invisible; step two is white card behind it as before.
          className={`absolute right-3 top-3 z-10 rounded-md p-2 transition-colors focus:outline-none focus-visible:ring-2 ${
            onQuote
              ? 'text-theme-muted hover:bg-theme-subtle hover:text-theme-dark focus-visible:ring-theme-primary dark:hover:bg-white/10 dark:hover:text-white'
              : 'text-white/80 hover:bg-white/15 hover:text-white focus-visible:ring-white'
          }`}
        >
          <X className="h-5 w-5" aria-hidden />
        </button>

        {/* Two panels on one track, slid by transform. Both stay mounted so the
            typed details survive a step back and the transition has something
            to move; the off-screen one is hidden from assistive tech and taken
            out of the tab order rather than merely scrolled past. */}
        <div className="overflow-hidden sm:rounded-lg">
          <div
            className={`flex w-[200%] items-start transition-transform duration-300 ease-out motion-reduce:transition-none ${
              onQuote ? '-translate-x-1/2' : 'translate-x-0'
            }`}
          >
            {/* ── Step 1: details ─────────────────────────────────────────── */}
            <section className="w-1/2" aria-hidden={onQuote} inert={onQuote}>
              {/* The step band belongs to the panel, not the shell, so it
                  slides away with the step it names. */}
              <div className="bg-theme-primary px-5 py-4 sm:px-8">
                <p className="text-lg font-bold text-white">Step 1 of 2</p>
              </div>

              <div className="px-5 py-6 sm:px-8 sm:py-7">
              <h2
                id="guest-lead-title"
                className="text-xl font-extrabold tracking-tight text-theme-dark dark:text-white sm:text-2xl"
              >
                Where should we send your quote?
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-theme-muted">
                Delivery price and sales tax is based on the delivery location, site
                access, and distance from the depot. Fill in details below to get the
                exact delivery price and sales tax.
              </p>

              <div className="mt-5 flex items-baseline justify-between gap-4 rounded-md bg-theme-subtle px-4 py-3.5 dark:bg-neutral-800/60">
                <span className="text-sm font-semibold text-theme-dark dark:text-white">
                  {productTitle}
                </span>
                <span className="shrink-0 text-sm font-bold tabular-nums text-theme-dark dark:text-white">
                  {priceLabel}
                </span>
              </div>

              <form
                action={ZOHO_QUOTE_FORM.action}
                method="POST"
                acceptCharset="UTF-8"
                target={form.frameName}
                onSubmit={handleSubmit}
                className="mt-6"
                noValidate
              >
                <ZohoQuotePost frameName={form.frameName} />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="guest-first-name" className={LABEL}>
                      First Name <span className="text-theme-primary">*</span>
                    </label>
                    <input
                      ref={firstFieldRef}
                      id="guest-first-name"
                      autoComplete="given-name"
                      placeholder="Jane"
                      className={FIELD}
                      {...field('firstName')}
                    />
                  </div>

                  <div>
                    <label htmlFor="guest-last-name" className={LABEL}>
                      Last Name <span className="text-theme-primary">*</span>
                    </label>
                    <input
                      id="guest-last-name"
                      autoComplete="family-name"
                      placeholder="Alvarez"
                      className={FIELD}
                      {...field('lastName')}
                    />
                  </div>

                  <div>
                    <label htmlFor="guest-phone" className={LABEL}>
                      Phone Number <span className="text-theme-primary">*</span>
                    </label>
                    <input
                      id="guest-phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="(555) 123-4567"
                      className={FIELD}
                      {...field('phone')}
                    />
                  </div>

                  <div>
                    <label htmlFor="guest-email" className={LABEL}>
                      Email Address <span className="text-theme-primary">*</span>
                    </label>
                    <input
                      id="guest-email"
                      type="email"
                      autoComplete="email"
                      placeholder="jane@company.com"
                      className={FIELD}
                      {...field('email')}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="guest-street" className={LABEL}>
                      Delivery Street
                    </label>
                    <input
                      id="guest-street"
                      autoComplete="shipping address-line1"
                      placeholder="123 Main St"
                      className={FIELD}
                      {...field('street')}
                    />
                  </div>

                  {/* ZIP first: City and State fill in from it. */}
                  <div className="grid grid-cols-1 gap-4 sm:col-span-2 sm:grid-cols-[1fr_1.4fr_1fr]">
                    <div>
                      <label htmlFor="guest-zip" className={LABEL}>
                        Delivery ZIP <span className="text-theme-primary">*</span>
                      </label>
                      <input
                        id="guest-zip"
                        autoComplete="shipping postal-code"
                        placeholder="ZIP / postal code"
                        className={FIELD}
                        {...field('zip')}
                      />
                    </div>
                    <div>
                      <label htmlFor="guest-city" className={LABEL}>
                        City
                      </label>
                      <div className="relative">
                        <input
                          id="guest-city"
                          autoComplete="shipping address-level2"
                          placeholder={form.zipLooking ? 'Looking up…' : 'From your ZIP'}
                          className={FIELD}
                          {...field('city')}
                        />
                        {form.zipLooking && (
                          <Loader2
                            aria-hidden
                            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-theme-muted"
                          />
                        )}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="guest-state" className={LABEL}>
                        State
                      </label>
                      <input
                        id="guest-state"
                        autoComplete="shipping address-level1"
                        placeholder="From your ZIP"
                        className={FIELD}
                        {...field('state')}
                      />
                    </div>
                  </div>
                </div>

                {form.error && (
                  <p
                    role="alert"
                    className="mt-4 rounded-md bg-theme-primary-light px-3 py-2 text-sm font-semibold text-theme-primary"
                  >
                    {form.error}
                  </p>
                )}

                <button type="submit" className={`${PRIMARY_BUTTON} mt-5 h-12 w-full text-base`}>
                  Get Quote
                </button>

                {/* Both ways out, side by side and the same weight: leaving
                    empty-handed and phoning instead are the same size of
                    decision. Go Back closes — step one has nothing behind it. */}
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button type="button" onClick={close} className={`${SECONDARY_BUTTON} gap-2`}>
                    <ArrowLeft className="h-4 w-4" aria-hidden />
                    Go Back
                  </button>
                  <Link
                    href={`tel:${CONTACT_NUMBER.replace(/[^\d+]/g, '')}`}
                    className={`${SECONDARY_BUTTON} gap-2`}
                  >
                    <Phone className="h-4 w-4" aria-hidden />
                    Call for Lowest Price
                  </Link>
                </div>
              </form>

              <p className="mt-5 text-center text-xs text-theme-muted">
                We use your contact info only to process your request. We do not sell
                your personal data.
              </p>
              </div>
            </section>

            {/* ── Step 2: the quote ───────────────────────────────────────── */}
            <section className="w-1/2" aria-hidden={!onQuote} inert={!onQuote}>
              <div className="bg-theme-primary px-5 py-4 sm:px-8">
                <p className="text-lg font-bold text-white">Step 2 of 2</p>
              </div>

              <div className="px-5 py-6 sm:px-8 sm:py-7">
              <h2 className="text-xl font-extrabold tracking-tight text-theme-dark dark:text-white sm:text-2xl">
                Your Quote:
              </h2>
              {/* One state since 2026-09-23. Get Quote files the quote, so by
                  the time this step is on screen the quotation is already on
                  its way and there is nothing conditional left to say. */}
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-theme-muted">
                Thank you for providing your information. We will send your final
                quotation to your email address within 24 hours.
              </p>

              <div className="mt-5 overflow-hidden rounded-md border border-theme-border dark:border-neutral-800">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-theme-subtle px-4 py-3 dark:bg-neutral-800/60">
                  <span className="min-w-0 text-sm font-bold text-theme-dark dark:text-white">
                    {productTitle}
                  </span>
                  {/* Beside what it describes, not at the foot of the modal:
                      the details are what produced these figures, so the way
                      back to them belongs next to them. */}
                  <button
                    type="button"
                    onClick={() => setStep('details')}
                    className="shrink-0 text-sm font-semibold text-theme-primary underline underline-offset-2 hover:text-theme-primary-dark"
                  >
                    Edit my details
                  </button>
                </div>
                <ul className="px-4 text-sm">
                  {quoteLines.map((line, index) => {
                    // A single rule where the costs start, rather than one
                    // between every row: the rows above describe the container,
                    // the rows below are what it comes to.
                    const firstCharge =
                      !!line.charge && !quoteLines.slice(0, index).some((l) => l.charge)
                    return (
                      <li
                        key={line.label}
                        className={`flex items-baseline justify-between gap-6 py-2.5 ${
                          firstCharge
                            ? 'mt-1 border-t border-theme-border pt-3.5 dark:border-neutral-800'
                            : ''
                        }`}
                      >
                        <span className="shrink-0 text-theme-muted">{line.label}</span>
                        <span
                          className={`text-right tabular-nums ${
                            line.muted && !line.charge
                              ? 'text-theme-muted'
                              : 'font-bold text-theme-dark dark:text-white'
                          }`}
                        >
                          {line.value}
                        </span>
                      </li>
                    )
                  })}
                </ul>
                <div className="flex items-center justify-between gap-4 bg-theme-subtle px-4 py-3.5 dark:bg-neutral-800/60">
                  <span className="text-sm font-bold text-theme-dark dark:text-white">
                    Estimated Total
                  </span>
                  <span className="text-lg font-bold leading-none tabular-nums text-theme-primary">
                    {quoteTotal}
                    {quoteTotalSuffix && (
                      <span className="ml-0.5 text-sm font-semibold">{quoteTotalSuffix}</span>
                    )}
                  </span>
                </div>
              </div>

              {/* No Save Quote button: Get Quote on step one already filed it.
                  A button here had nothing left to do but be pressed twice. */}
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <PlpLink href={ROUTES.PLP} className={`${SECONDARY_BUTTON} gap-2`}>
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  Continue Shopping
                </PlpLink>
                <Link
                  href={`tel:${CONTACT_NUMBER.replace(/[^\d+]/g, '')}`}
                  className={`${SECONDARY_BUTTON} gap-2`}
                >
                  <Phone className="h-4 w-4" aria-hidden />
                  {/* The quotation is already coming, so the reason to ring is
                      the price rather than the advice. */}
                  Call for Lowest Price
                </Link>
              </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
