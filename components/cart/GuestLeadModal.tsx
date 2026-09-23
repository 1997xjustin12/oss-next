'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, MapPin, Phone, X } from 'lucide-react'
import { useGeoapify } from '@/hooks/useGeoapify'
import type { GeoapifyResult } from '@/hooks/useGeoapify'
import Link from 'next/link'
import { PlpLink } from '@/components/shared/PlpLink'
import { ROUTES } from '@/config/routes'
import { CONTACT_NUMBER } from '@/lib/helpers'
import { getGuestLead } from '@/lib/guestCapture'
import { readVisitorZip } from '@/lib/visitorZip'
import type { GuestLead } from '@/lib/guestCapture'

/**
 * Asks a signed-out visitor who they are, at the moment they add a container,
 * then shows them the quote their details bought.
 *
 * Two views on one track:
 *
 *   1. **Details** — name, email, phone, ZIP. One action: Get Quote, which
 *      both records the lead and files the quote.
 *   2. **Quote** — the priced selection, and confirmation that the quotation
 *      is coming by email. One state: there is nothing left to press.
 *
 * The second view is the point. Asking for contact details in exchange for
 * nothing is a toll gate; asking in exchange for a quote the visitor can read
 * back is a trade, and it gives the details somewhere to be used rather than
 * just collected.
 *
 * **Placeholder form.** The fields stand in for a Zoho form that will replace
 * them. The surrounding flow — when it opens, the two steps, where the details
 * go — is the part meant to survive that swap.
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
   * Fires when the visitor picks a delivery address, with its bare postcode.
   *
   * Lets the caller re-price delivery for where the container is actually
   * going. Without it the quote on step 2 would still be priced to whatever ZIP
   * was in the page's own field — which is the wrong number wearing the right
   * label, and worse than showing none.
   */
  onAddressZipChange?: (postcode: string) => void
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
   * Seeded from the stored lead, so someone who has given their details once
   * confirms them rather than typing them again — and can still edit any of
   * them before submitting.
   *
   * Lazy initialisers rather than an effect: this only ever renders in the
   * browser, behind the caller's `open` flag, so there is no server pass to
   * mismatch against and no need to wait for one.
   */
  const stored = useState(() => getGuestLead())[0]
  const [fullName, setFullName] = useState(stored?.fullName ?? '')
  const [email, setEmail] = useState(stored?.email ?? '')
  const [phone, setPhone] = useState(stored?.phone ?? '')
  /**
   * The ZIP, from the lead if we have one and from the browser's own ZIP if
   * not.
   *
   * Nobody reaches this modal without having given a ZIP — the product page
   * behind it will not price anything until they do — so an empty box here was
   * the site asking twice for something it had already been told.
   */
  const [address, setAddress] = useState(stored?.address || readVisitorZip().postcode || '')
  const [error, setError] = useState<string | null>(null)
  const [addressOpen, setAddressOpen] = useState(false)

  /**
   * Re-seed the ZIP each time the dialog opens.
   *
   * The panel renders this component on every page load, so the initialiser
   * above runs before the visitor has typed anything — and typing a ZIP into
   * the page behind is usually the first thing they do. Seeding only at mount
   * therefore left the box empty in exactly the case where we knew the answer.
   *
   * Adjusted during render rather than from an effect: this is state derived
   * from a prop changing, which is React's own pattern for it, and it avoids a
   * paint with the wrong value in the box. It only fills a blank, so it never
   * overwrites what the visitor typed here.
   */
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setAddress((current) => current || readVisitorZip().postcode || '')
  }

  const firstFieldRef = useRef<HTMLInputElement>(null)

  // Same postcode lookup the PDP's ZIP field uses, so an address typed here is
  // resolved the same way as one typed there.
  const {
    results: addressResults,
    loading: addressLoading,
    error: addressError,
    clear: clearAddress,
  } = useGeoapify(address, {
    type: 'postcode',
    countries: 'us,ca',
    debounceMs: 300,
    limit: 5,
  })

  function selectAddress(result: GeoapifyResult) {
    setAddress(result.formatted)
    setAddressOpen(false)
    // Deliberately not persisted to localStorage and no depot swap: this is a
    // form field, and silently relocating the page behind the modal would be a
    // surprising thing for typing an address to do.
    onAddressZipChange?.(result.postcode)
  }

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


  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    // All four are required as of the 2026-09-22 design, which marks each with
    // an asterisk. This reverses an earlier call — "asking for an address and
    // then blocking on it costs more leads than it captures" — so it is worth
    // knowing which way it was decided if lead volume drops: the phone and
    // address checks below are the two to drop.
    if (!fullName.trim()) return setError('Enter your name so we know who to reach.')
    if (!phone.trim()) return setError('Enter a phone number we can reach you on.')
    if (!EMAIL_PATTERN.test(email.trim())) return setError('Enter a valid email address.')
    if (!address.trim()) return setError('Enter the delivery ZIP so we can price the trucking.')

    setError(null)
    onSubmit({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
    })
    setStep('quote')
  }

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

              <form onSubmit={handleSubmit} className="mt-6" noValidate>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="guest-name" className={LABEL}>
                      Full Name <span className="text-theme-primary">*</span>
                    </label>
                    <input
                      ref={firstFieldRef}
                      id="guest-name"
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Alvarez"
                      className={FIELD}
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
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      className={FIELD}
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@company.com"
                      className={FIELD}
                    />
                  </div>

                  <div className="relative">
                    <label htmlFor="guest-address" className={LABEL}>
                      Delivery Address <span className="text-theme-primary">*</span>
                    </label>
                    <input
                      id="guest-address"
                      autoComplete="postal-code"
                      inputMode="numeric"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value)
                        setAddressOpen(true)
                      }}
                      onFocus={() => setAddressOpen(true)}
                      // Deferred so a click on a suggestion lands before the
                      // list unmounts.
                      onBlur={() => setTimeout(() => setAddressOpen(false), 150)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setAddressOpen(false)
                          clearAddress()
                        }
                        if (e.key === 'Enter' && addressResults.length === 1) {
                          e.preventDefault()
                          selectAddress(addressResults[0])
                        }
                      }}
                      aria-autocomplete="list"
                      placeholder="Enter your ZIP code"
                      className={FIELD}
                    />

                    {/* Opens upward, capped so the slide track — which clips
                        overflow — cannot cut it off.

                        This used to drop downward, on the reasoning that
                        upward lands on the Email input and reads as that
                        field's suggestions. That is true and it is still the
                        cost of this. It is the smaller cost: this is the last
                        field on the form, so Get Quote sits ~16px below it and
                        a downward list covers the button at any height. On a
                        phone that made the primary action untappable — a tap
                        on Get Quote picked a suggestion instead. Measured at
                        390px: list y 645–703, button y 661–709. */}
                    {addressOpen &&
                      (addressResults.length > 0 || addressLoading || !!addressError) && (
                        <ul
                          role="listbox"
                          className="absolute bottom-full left-0 right-0 z-20 mb-1 max-h-52 overflow-y-auto rounded-md border border-theme-border bg-theme-bg shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
                        >
                          {addressLoading && addressResults.length === 0 && (
                            <li className="px-3 py-2.5 text-sm text-theme-muted">Searching…</li>
                          )}
                          {addressError && !addressLoading && (
                            <li className="px-3 py-2.5 text-sm text-theme-primary">
                              {addressError}
                            </li>
                          )}
                          {addressResults.map((r) => (
                            <li key={r.placeId} role="option" aria-selected={false}>
                              <button
                                type="button"
                                onMouseDown={() => selectAddress(r)}
                                className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-theme-subtle dark:hover:bg-white/10"
                              >
                                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-theme-primary" />
                                <span>
                                  <span className="font-semibold text-theme-dark dark:text-white">
                                    {r.formatted}
                                  </span>
                                  <span className="block text-[11px] text-theme-muted">
                                    {r.country}
                                  </span>
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>
                </div>

                {error && (
                  <p
                    role="alert"
                    className="mt-4 rounded-md bg-theme-primary-light px-3 py-2 text-sm font-semibold text-theme-primary"
                  >
                    {error}
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
