'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { Phone, X } from 'lucide-react'
import Link from 'next/link'
import { ROUTES } from '@/config/routes'
import { CONTACT_NUMBER } from '@/lib/helpers'
import type { GuestLead } from '@/lib/guestCapture'

/**
 * Asks a signed-out visitor who they are, at the moment they add a container.
 *
 * **Placeholder implementation.** The fields here stand in for a Zoho form that
 * will replace them; the surrounding flow — when it opens, what each action
 * does, where the details go — is the part meant to survive that swap. Keep the
 * three outcomes intact when the real form lands.
 *
 * The three actions exist because a visitor at this point wants one of three
 * things, and a modal that only offers the one *we* want is a wall:
 *
 *   1. Keep browsing        — they are not ready. Nothing is added.
 *   2. Add without details  — they will not share, but they do want the item.
 *   3. Save and add         — the outcome this feature is for.
 *
 * Option 2 matters most for revenue. Putting an unavoidable form in front of an
 * add-to-cart is a reliable way to lose the sale outright, and someone who
 * refuses a form is not a lost lead — they are a customer who has not been
 * asked at a better moment.
 */

type Props = {
  open: boolean
  /** What is being added, shown so the modal never feels like a random interruption. */
  productTitle: string
  priceLabel: string
  /** Details captured; the caller stores them and completes the add. */
  onSubmit: (lead: Omit<GuestLead, 'capturedAt'>) => void
  /** Add the item without collecting anything. */
  onSkip: () => void
  /** Close without adding. */
  onDismiss: () => void
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const FIELD =
  'w-full rounded-md border border-theme-border bg-theme-bg px-3 py-2.5 text-sm text-theme-dark outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white transition-colors placeholder:text-theme-muted focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20'
const LABEL = 'mb-1.5 block text-[13px] font-semibold text-theme-dark-2 dark:text-gray-200'

export function GuestLeadModal({
  open,
  productTitle,
  priceLabel,
  onSubmit,
  onSkip,
  onDismiss,
}: Props) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState<string | null>(null)

  const firstFieldRef = useRef<HTMLInputElement>(null)

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

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    // Only the two fields we would actually follow up on are required. Asking
    // for an address and then blocking on it costs more leads than it captures.
    if (!fullName.trim()) return setError('Enter your name so we know who to reach.')
    if (!EMAIL_PATTERN.test(email.trim())) return setError('Enter a valid email address.')

    setError(null)
    onSubmit({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
    })
  }

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
          onClick={onDismiss}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-md p-2 text-theme-muted transition-colors hover:bg-theme-subtle hover:text-theme-dark dark:hover:bg-white/10 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>

        <div className="px-5 py-8 sm:px-10 sm:py-9">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-theme-primary">
            Almost there
          </p>
          <h2
            id="guest-lead-title"
            className="mt-2 text-2xl font-extrabold tracking-tight text-theme-dark dark:text-white sm:text-3xl"
          >
            Where should we send your delivery quote?
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-theme-muted">
            Delivery is priced by site access and distance from the depot, so the
            final figure comes from a person rather than a calculator. Leave your
            details and we will send an exact price — usually the same business day.
          </p>

          {/* What they are adding. Without this the modal reads as an
              interruption rather than a step in the thing they just started. */}
          <div className="mt-5 flex items-baseline justify-between gap-4 rounded-md border border-theme-border bg-theme-subtle px-4 py-3 dark:border-neutral-800 dark:bg-neutral-800/60">
            <span className="text-sm font-semibold text-theme-dark dark:text-white">{productTitle}</span>
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

              <div>
                <label htmlFor="guest-address" className={LABEL}>
                  Delivery address
                </label>
                <input
                  id="guest-address"
                  autoComplete="street-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="City or ZIP is enough for now"
                  className={FIELD}
                />
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

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row-reverse">
              <button
                type="submit"
                className="flex h-11 flex-1 items-center justify-center rounded-md bg-theme-primary px-5 text-sm font-bold text-white transition-colors hover:bg-theme-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2"
              >
                Save details and add to cart
              </button>
              <button
                type="button"
                onClick={onSkip}
                className="flex h-11 flex-1 items-center justify-center rounded-md border border-theme-border bg-theme-bg px-5 text-sm font-semibold text-theme-dark transition-colors dark:border-neutral-700 dark:bg-neutral-900 dark:text-white hover:border-theme-primary hover:text-theme-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
              >
                Add without details
              </button>
              <Link
                href={ROUTES.PLP}
                className="flex h-11 items-center justify-center rounded-md px-5 text-sm font-semibold text-theme-muted transition-colors hover:text-theme-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
              >
                Keep browsing
              </Link>
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
        </div>
      </div>
    </div>,
    document.body,
  )
}
