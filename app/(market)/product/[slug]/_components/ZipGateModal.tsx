'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, MapPin, X } from 'lucide-react'
import { useGeoapify } from '@/hooks/useGeoapify'
import type { GeoapifyResult } from '@/hooks/useGeoapify'

/**
 * Asks for a ZIP code on arrival, when we have no idea where the visitor is.
 *
 * Container and delivery pricing are both location-dependent, so without a ZIP
 * the page can only show a depot's list price and "enter a ZIP for a rate" —
 * numbers the visitor cannot act on. Asking once up front is what turns the
 * rest of the page into real pricing.
 *
 * Only opens when nothing else has answered the question: no `?zipcode=` in the
 * URL, and nothing in storage from a previous visit or the geolocation prompt.
 * Anyone arriving from the homepage or listing lookup already has one and never
 * sees this.
 *
 * Resolving reuses `useGeoapify`'s `selectResult`, so a ZIP entered here lands
 * in exactly the same three storage keys as one entered anywhere else on the
 * site, depot included — rather than becoming a fourth way to record a
 * location.
 */

type Props = {
  open: boolean
  /** Fires with the resolved postcode once the visitor supplies one. */
  onResolved: (postcode: string) => void
  /** Closed without answering — the X or Escape. */
  onDismiss: () => void
}

export function ZipGateModal({ open, onResolved, onDismiss }: Props) {
  const [zip, setZip] = useState('')
  const [touched, setTouched] = useState(false)
  const [listOpen, setListOpen] = useState(false)
  /**
   * The suggestion the visitor actually chose.
   *
   * Tracked rather than assuming the first result: once the list is visible
   * they can pick any row, and submitting `results[0]` would quietly resolve a
   * different place than the one they clicked.
   */
  const [chosen, setChosen] = useState<GeoapifyResult | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)

  const { results, loading, selectResult } = useGeoapify(zip, {
    type: 'postcode',
    countries: 'us,ca',
    debounceMs: 300,
    limit: 5,
  })

  useEffect(() => {
    if (!open) return

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onDismiss()
    }
    window.addEventListener('keydown', onKey)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    inputRef.current?.focus()

    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onDismiss])

  if (!open) return null

  // All derived from the lookup rather than mirrored into state: the search is
  // already the source of truth for whether this ZIP exists, and copying its
  // outcome into an effect only creates a second version that can disagree.
  const trimmed = zip.trim()
  // What submitting will use: the row they clicked, or the best guess when they
  // typed a full ZIP and pressed the button without opening the list.
  const match = chosen ?? results[0]
  const busy = loading && trimmed.length > 1
  const showList = listOpen && !chosen && (results.length > 0 || busy)
  // Only complain once enough has been typed to be a real attempt, and only
  // after the search has settled — not while it is still running.
  const message =
    touched && !trimmed
      ? 'Enter a ZIP or postal code.'
      : touched && !busy && trimmed.length > 2 && !match
        ? "We couldn't find that ZIP code. Check it and try again."
        : null

  function pick(result: GeoapifyResult) {
    setChosen(result)
    setZip(result.formatted)
    setListOpen(false)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setTouched(true)
    setListOpen(false)
    // No match yet: `message` above explains why, rather than the button
    // sitting greyed out with nothing said.
    if (!match) return
    selectResult(match)
    onResolved(match.postcode)
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="zip-gate-title"
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/55 p-4"
    >
      <div className="relative w-full max-w-lg rounded-lg bg-theme-bg p-6 shadow-2xl sm:p-9 dark:bg-neutral-900">
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-md p-2 text-theme-muted transition-colors hover:bg-theme-subtle hover:text-theme-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary dark:hover:bg-white/10 dark:hover:text-white"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>

        <h2
          id="zip-gate-title"
          className="max-w-sm text-3xl font-extrabold leading-tight tracking-tight text-theme-dark sm:text-[34px] dark:text-white"
        >
          Get the Best Price on Your Container!
        </h2>

        <p className="mt-4 text-[15px] leading-relaxed text-theme-mid dark:text-gray-300">
          Container prices and delivery costs vary by location due to supply,
          demand, and trucking distance. Enter your ZIP code to see real-time
          pricing and the best deals near you!
        </p>

        <form onSubmit={handleSubmit} className="mt-6" noValidate>
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              value={zip}
              onChange={(e) => {
                setZip(e.target.value)
                setTouched(true)
                setListOpen(true)
                // Typing after choosing means they are choosing again.
                setChosen(null)
              }}
              onFocus={() => setListOpen(true)}
              // Deferred so a click on a suggestion lands before it unmounts.
              onBlur={() => setTimeout(() => setListOpen(false), 150)}
              onKeyDown={(e) => {
                if (e.key === 'Escape' && showList) {
                  // Close the list, not the modal — the window handler above
                  // would otherwise take Escape as "dismiss the whole thing".
                  e.stopPropagation()
                  setListOpen(false)
                }
                if (e.key === 'Enter' && showList && results[0]) {
                  e.preventDefault()
                  pick(results[0])
                }
              }}
              aria-autocomplete="list"
              aria-expanded={showList}
              placeholder="Enter delivery zip code"
              aria-label="Delivery ZIP or postal code"
              aria-invalid={!!message}
              className="w-full rounded border border-theme-border bg-theme-bg px-4 py-3 text-[15px] text-theme-dark outline-none transition-colors placeholder:text-theme-muted focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            />
            {busy && (
              <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-theme-muted" />
            )}

            {showList && (
              <ul
                role="listbox"
                className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-md border border-theme-border bg-theme-bg shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
              >
                {busy && results.length === 0 && (
                  <li className="px-3 py-2.5 text-sm text-theme-muted">Searching…</li>
                )}
                {results.map((r) => (
                  <li key={r.placeId} role="option" aria-selected={false}>
                    <button
                      type="button"
                      onMouseDown={() => pick(r)}
                      className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-theme-subtle dark:hover:bg-white/10"
                    >
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-theme-primary" />
                      <span>
                        <span className="font-semibold text-theme-dark dark:text-white">
                          {r.formatted}
                        </span>
                        <span className="block text-[11px] text-theme-muted">{r.country}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {message && (
            <p role="alert" className="mt-2 text-[13px] font-semibold text-theme-primary">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-4 flex h-12 w-full items-center justify-center rounded bg-theme-primary text-base font-bold text-white transition-colors hover:bg-theme-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Checking…' : 'Get your Best Price'}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  )
}
