'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { MapPin, Phone, X } from 'lucide-react'
import { useGeoapify } from '@/hooks/useGeoapify'
import type { GeoapifyResult } from '@/hooks/useGeoapify'
import Link from 'next/link'
import { ROUTES } from '@/config/routes'
import { CONTACT_NUMBER } from '@/lib/helpers'
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
  /** Quote view's primary action. */
  onAddToCart: () => void
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
  onAddToCart,
  onDismiss,
  onAddressZipChange,
}: Props) {
  const [step, setStep] = useState<Step>('details')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
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

  useEffect(() => {
    if (!open) return

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onDismiss()
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
  }, [open, onDismiss])

  if (!open) return null

  function close() {
    setStep('details')
    onDismiss()
  }

  function addToCart() {
    setStep('details')
    onAddToCart()
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    // Only the two fields worth following up on are required. Asking for an
    // address and then blocking on it costs more leads than it captures.
    if (!fullName.trim()) return setError('Enter your name so we know who to reach.')
    if (!EMAIL_PATTERN.test(email.trim())) return setError('Enter a valid email address.')

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
          className="absolute right-3 top-3 z-10 rounded-md p-2 text-theme-muted transition-colors hover:bg-theme-subtle hover:text-theme-dark dark:hover:bg-white/10 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
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
            <section
              className="w-1/2 px-5 py-8 sm:px-10 sm:py-9"
              aria-hidden={onQuote}
              inert={onQuote}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-theme-primary">
                Step 1 of 2
              </p>
              <h2
                id="guest-lead-title"
                className="mt-2 text-2xl font-extrabold tracking-tight text-theme-dark dark:text-white sm:text-3xl"
              >
                Where should we send your quote?
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-theme-muted">
                Delivery is priced by site access and distance from the depot, so
                the final figure comes from a person rather than a calculator.
                Leave your details and we&rsquo;ll price this container for your
                address.
              </p>

              <div className="mt-5 flex items-baseline justify-between gap-4 rounded-md border border-theme-border bg-theme-subtle px-4 py-3 dark:border-neutral-800 dark:bg-neutral-800/60">
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
                      Full name <span className="text-theme-primary">*</span>
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
                    <label htmlFor="guest-email" className={LABEL}>
                      Email <span className="text-theme-primary">*</span>
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

                  <div>
                    <label htmlFor="guest-phone" className={LABEL}>
                      Phone
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

                  <div className="relative">
                    <label htmlFor="guest-address" className={LABEL}>
                      Delivery address
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

                <div className="mt-6 flex">
                  <button type="submit" className={PRIMARY_BUTTON}>
                    Get Quote
                  </button>
                </div>
              </form>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-theme-border pt-4 dark:border-neutral-800">
                <p className="text-xs text-theme-muted">
                  We use this to send your quote. We do not sell your details.
                </p>
                <Link
                  href={`tel:${CONTACT_NUMBER.replace(/[^\d+]/g, '')}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-theme-primary hover:underline"
                >
                  <Phone className="h-3.5 w-3.5" aria-hidden />
                  Prefer to talk? {CONTACT_NUMBER}
                </Link>
              </div>
            </section>

            {/* ── Step 2: the quote ───────────────────────────────────────── */}
            <section
              className="w-1/2 px-5 py-8 sm:px-10 sm:py-9"
              aria-hidden={!onQuote}
              inert={!onQuote}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-theme-primary">
                Step 2 of 2
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-theme-dark dark:text-white sm:text-3xl">
                Your quote
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-theme-muted">
                {fullName ? `Thanks, ${fullName.split(' ')[0]}. ` : ''}
                Here&rsquo;s what you selected
                {email ? <> — we&rsquo;ve got you at <span className="font-semibold text-theme-dark dark:text-white">{email}</span></> : null}.
              </p>

              <div className="mt-5 overflow-hidden rounded-md border border-theme-border dark:border-neutral-800">
                <div className="border-b border-theme-border bg-theme-subtle px-4 py-3 text-sm font-bold text-theme-dark dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-white">
                  {productTitle}
                </div>
                <ul className="divide-y divide-theme-border px-4 text-sm dark:divide-neutral-800">
                  {quoteLines.map((line) => (
                    <li
                      key={line.label}
                      className="flex items-baseline justify-between gap-6 py-2.5"
                    >
                      <span className="shrink-0 text-theme-muted">{line.label}</span>
                      <span
                        className={`text-right tabular-nums ${
                          line.muted
                            ? 'text-theme-muted'
                            : 'font-medium text-theme-dark dark:text-white'
                        }`}
                      >
                        {line.value}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-end justify-between gap-4 border-t border-theme-border bg-theme-subtle px-4 py-3 dark:border-neutral-800 dark:bg-neutral-800/60">
                  <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-theme-muted">
                    Estimated total
                  </span>
                  <span className="text-2xl font-bold leading-none tabular-nums tracking-tight text-theme-dark dark:text-white">
                    {quoteTotal}
                    {quoteTotalSuffix && (
                      <span className="ml-0.5 text-sm font-semibold text-theme-muted">
                        {quoteTotalSuffix}
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-theme-muted">
                Delivery is an estimate until we confirm site access. Sales tax is
                calculated at checkout.
              </p>

              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row-reverse">
                <button type="button" onClick={addToCart} className={PRIMARY_BUTTON}>
                  Add to cart
                </button>
                <Link href={ROUTES.PLP} className={SECONDARY_BUTTON}>
                  Continue shopping
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-theme-border pt-4 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="text-xs font-semibold text-theme-muted underline underline-offset-2 hover:text-theme-dark dark:hover:text-white"
                >
                  Edit my details
                </button>
                <Link
                  href={`tel:${CONTACT_NUMBER.replace(/[^\d+]/g, '')}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-theme-primary hover:underline"
                >
                  <Phone className="h-3.5 w-3.5" aria-hidden />
                  Questions? {CONTACT_NUMBER}
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
