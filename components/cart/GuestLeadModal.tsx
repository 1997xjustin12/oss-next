'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, Check, MapPin, Phone, X } from 'lucide-react'
import { useGeoapify } from '@/hooks/useGeoapify'
import type { GeoapifyResult } from '@/hooks/useGeoapify'
import Link from 'next/link'
import { PlpLink } from '@/components/shared/PlpLink'
import { ROUTES } from '@/config/routes'
import { CONTACT_NUMBER } from '@/lib/helpers'
import { getGuestLead } from '@/lib/guestCapture'
import type { GuestLead } from '@/lib/guestCapture'

/**
 * Asks a signed-out visitor who they are, at the moment they add a container,
 * then shows them the quote their details bought.
 *
 * Two views on one track:
 *
 *   1. **Details** — name, email, phone, address. One action: Get Quote.
 *   2. **Quote** — the priced selection, with Continue shopping / Add to cart.
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
  /** Details captured. The modal then advances to the quote itself. */
  onSubmit: (lead: Omit<GuestLead, 'capturedAt'>) => void
  /**
   * File the quote. The caller saves it and flips `quoteSaved`, which is what
   * moves step two from "here is your quote" to "we will email it to you".
   */
  onSaveQuote: () => void
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
  /**
   * True once the caller has filed this quote.
   *
   * This is the whole difference between step two's two states: unsaved offers
   * Save Quote, saved says the quotation is coming by email and turns that same
   * button into "Quote Saved!" — the confirmation sits where the action was.
   */
  quoteSaved?: boolean
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
  onSaveQuote,
  onDismiss,
  onAddressZipChange,
  quoteSaved = false,
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
  const [address, setAddress] = useState(stored?.address ?? '')
  const [error, setError] = useState<string | null>(null)
  const [addressOpen, setAddressOpen] = useState(false)

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

                    {/* Opens downward, capped below the 226px the slide
                        track leaves under this field — the track clips
                        overflow, so an uncapped list would be cut off. Upward
                        fits too, but lands squarely on the Email input and
                        reads as that field's suggestions rather than this
                        one's. */}
                    {addressOpen &&
                      (addressResults.length > 0 || addressLoading || !!addressError) && (
                        <ul
                          role="listbox"
                          className="absolute left-0 right-0 top-full z-20 mt-1 max-h-52 overflow-y-auto rounded-md border border-theme-border bg-theme-bg shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
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
              {/* The two states of this step, in one sentence each. Before
                  saving it is a quote they are reading; after, it is a promise
                  about what happens next — and repeating "here is your quote"
                  at that point would read as though nothing had happened. */}
              {quoteSaved ? (
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-theme-muted">
                  Thank you for providing your information. We will send your final
                  quotation to your email address within 24 hours.
                </p>
              ) : (
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-theme-muted">
                  {fullName ? (
                    <>
                      Thanks, <span className="font-bold text-theme-dark dark:text-white">{fullName.split(' ')[0]}</span>.{' '}
                    </>
                  ) : null}
                  Here&rsquo;s what you asked about — a specialist will follow up.
                  {email ? (
                    <>
                      {' '}We&rsquo;ve got you at{' '}
                      <span className="font-bold text-theme-dark dark:text-white">{email}</span>.
                    </>
                  ) : null}
                </p>
              )}

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

              {/* One button, two jobs: the action, then the receipt for it.
                  Disabled rather than removed once saved — the confirmation is
                  worth more in the place the visitor just pressed than in a line
                  of text somewhere below it, and leaving it live would invite a
                  second press that files nothing. */}
              <button
                type="button"
                onClick={quoteSaved ? undefined : onSaveQuote}
                disabled={quoteSaved}
                className={`${PRIMARY_BUTTON} mt-5 h-12 w-full text-base disabled:cursor-default disabled:hover:bg-theme-primary`}
              >
                {quoteSaved ? (
                  <>
                    <Check className="mr-2 h-5 w-5" aria-hidden />
                    Quote Saved!
                  </>
                ) : (
                  'Save Quote'
                )}
              </button>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <PlpLink href={ROUTES.PLP} className={`${SECONDARY_BUTTON} gap-2`}>
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  Continue Shopping
                </PlpLink>
                <Link
                  href={`tel:${CONTACT_NUMBER.replace(/[^\d+]/g, '')}`}
                  className={`${SECONDARY_BUTTON} gap-2`}
                >
                  <Phone className="h-4 w-4" aria-hidden />
                  {/* Before saving, the offer is expertise; after, the quote is
                      already coming and the reason to ring is the price. */}
                  {quoteSaved ? 'Call for Lowest Price' : `Talk to an expert ${CONTACT_NUMBER}`}
                </Link>
              </div>

              {quoteSaved && (
                <p className="mt-5 text-center text-xs text-theme-muted">
                  Saved to this browser.{' '}
                  <Link href={ROUTES.SAVED_QUOTES} className="underline underline-offset-2">
                    View saved quotes
                  </Link>
                </p>
              )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
