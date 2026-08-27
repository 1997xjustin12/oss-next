'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, MapPin, Pencil } from 'lucide-react'
import { useGeoapify } from '@/hooks/useGeoapify'
import type { GeoapifyResult } from '@/hooks/useGeoapify'
import { findEquivalentContainer, getCustomFieldValue, isGenericDisplayHit } from '@/lib/pricing'
import { useStoredZip } from '@/hooks/useStoredZip'
import type { ProductHit, FormattedContainerHit } from '@/types/product'

/**
 * What happens when the visitor picks a ZIP served by a different depot.
 *
 * Two strategies, because they are genuinely different behaviours and the
 * choice belongs to whoever renders this control:
 *
 *   - `redirect` — navigate to the equivalent container's own page. The
 *     original behaviour, and still the right one anywhere the surrounding
 *     page cannot re-render itself around a new product.
 *   - `swap` — hand the resolved depot to `onChange` and let the caller
 *     replace the product in place. No navigation, so the gallery, options and
 *     cart state re-render rather than being torn down and rebuilt.
 *
 * `swap` requires `onChange`; without it the component falls back to
 * `redirect` rather than silently doing nothing.
 */
export type LocationChangeStrategy = {
  mode: 'redirect' | 'swap'
  /** Called with the resolved depot label, e.g. `Sacramento, CA`. */
  onChange?: (location: string) => void
  /** True while the caller is loading that depot's containers. */
  loading?: boolean
  /** Shown under the field — e.g. that depot doesn't stock this container. */
  notice?: string | null
}

type Props = {
  product: ProductHit
  /**
   * Fires with the resolved postcode whenever the visitor picks one, so the
   * panel around this can price delivery. Passes the bare postcode rather than
   * the formatted label — the delivery endpoint wants the code alone.
   */
  onZipChange?: (postcode: string) => void
  /**
   * How to react to a depot change. Defaults to `redirect` so existing callers
   * keep the behaviour they already have — opting into `swap` is deliberate.
   */
  locationChange?: LocationChangeStrategy
}

export function DeliveryZipCheck({ product, onZipChange, locationChange }: Props) {
  const router = useRouter()
  // Null until the visitor touches the field; the stored ZIP shows through
  // until then. Derived rather than copied into state on mount, so there is no
  // effect racing the first paint.
  const [typedZip, setTypedZip] = useState<string | null>(null)
  const storedZip = useStoredZip()
  const zip = typedZip ?? storedZip.label ?? ''
  const setZip = setTypedZip
  const [open, setOpen] = useState(false)
  const [matching, setMatching] = useState(false)
  const [locateError, setLocateError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  /**
   * The depot this container ships from, e.g. `Los Angeles, CA`.
   *
   * Blank for reference listings — their location is the placeholder
   * "Various North America", and "from Various North America Depot" claims a
   * yard that does not exist.
   */
  const depotLabel = isGenericDisplayHit(product)
    ? ''
    : getCustomFieldValue(product, 'location')



  // Busy while either strategy is working — the redirect's own fetch, or the
  // caller loading the new depot's containers for a swap.
  const busy = matching || locationChange?.loading === true

  const { results, loading, error, clear, selectResult } = useGeoapify(zip, {
    type: 'postcode',
    countries: 'us,ca',
    debounceMs: 300,
    limit: 5,
  })

  // The last result auto-selected, so it is not selected again.
  //
  // `results` gets a fresh array identity on every hook update, so without this
  // the effect below re-fires for a suggestion it has already acted on —
  // measured at three depot lookups and two product swaps for a single ZIP
  // entry. Harmless when the outcome was a redirect (the navigation ended the
  // component's life); wasteful and visible now that it swaps in place.
  const autoSelectedRef = useRef<string | null>(null)

  // Auto-select once the suggestions narrow to exactly one match — same
  // convenience ZipLookup1 offers on the homepage.
  useEffect(() => {
    if (!open || results.length !== 1) return
    if (autoSelectedRef.current === results[0].placeId) return

    autoSelectedRef.current = results[0].placeId
    handleSelect(results[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, open])

  // Fetches the same container pool ZipLookup1/useGeoapify already use for
  // `depotContainers`, but awaited directly here so the match runs against
  // the freshly-resolved location instead of racing the hook's own state.
  async function redirectToEquivalentAt(location: string) {
    setMatching(true)
    try {
      const res = await fetch(`/api/shipping-containers/by-location?location=${encodeURIComponent(location)}`)
      if (!res.ok) return
      const json = (await res.json()) as { data?: FormattedContainerHit[] }
      const match = findEquivalentContainer(json.data ?? [], product)
      if (match?.handle) router.push(`/product/${String(match.handle)}`)
      // No equivalent stocked at that depot — do nothing, stay on this page.
    } catch {
      // Network hiccup — same as no match, stay put rather than error out.
    } finally {
      setMatching(false)
    }
  }

  function handleSelect(result: GeoapifyResult) {
    setZip(result.formatted)
    selectResult(result) // persists zipcode/zipcode_label/zipcode_depot for the rest of the site
    onZipChange?.(result.postcode)
    setOpen(false)
    if (!result.nearestLocation) return

    // Falls back to redirecting when `swap` was asked for without a handler —
    // a missing callback should not turn the ZIP box into a dead control.
    if (locationChange?.mode === 'swap' && locationChange.onChange) {
      locationChange.onChange(result.nearestLocation)
    } else {
      void redirectToEquivalentAt(result.nearestLocation)
    }
  }

  /**
   * Apply the location the site already detected for this visitor.
   *
   * Not a geolocation prompt: `ZipAutoDetect` asks the browser once on load
   * and stores the result, so by the time this link is clickable the answer is
   * already sitting in `userZipCode`. Prompting again would be a second
   * permission dialog for something we know.
   *
   * Read at click time rather than on mount, because that detection finishes
   * asynchronously and may well land after this component has rendered.
   */
  function handleUseMyLocation() {
    let detected = ''
    let depot = ''
    let label = ''
    try {
      detected = localStorage.getItem('userZipCode') ?? ''
      depot = localStorage.getItem('zipcode_depot') ?? ''
      label = localStorage.getItem('zipcode_label') ?? ''
    } catch {
      // Storage unavailable — treated the same as never having detected it.
    }

    if (!detected) {
      setLocateError("We don't have your location yet — enter your ZIP code instead.")
      return
    }

    setLocateError(null)
    setZip(label || detected)
    setOpen(false)
    onZipChange?.(detected)

    // Same two strategies as picking a suggestion, so a detected ZIP and a
    // typed one behave identically from here on.
    if (!depot) return
    if (locationChange?.mode === 'swap' && locationChange.onChange) {
      locationChange.onChange(depot)
    } else {
      void redirectToEquivalentAt(depot)
    }
  }

  function handleCheck() {
    if (results.length === 1) handleSelect(results[0])
  }

  const showDropdown = open && (results.length > 0 || loading || !!error)

  return (
    <div className="mb-5 rounded-lg bg-theme-subtle px-4 py-3.5">
      {/* Which depot this container actually ships from. Named before the
          field, because "delivery" only means something once you know where it
          leaves from — and it is the fact that changes when a new ZIP resolves
          to a different depot. Hidden for reference listings, whose location is
          the placeholder "Various North America" rather than a real yard. */}
      {depotLabel && (
        <p className="text-[15px] leading-snug text-theme-muted">
          from{' '}
          <span className="font-bold text-theme-dark dark:text-white">
            {depotLabel} Depot
          </span>
        </p>
      )}

      <div className="mt-2 grid grid-cols-1 items-center gap-x-3 gap-y-1.5 @[25rem]:grid-cols-[max-content_minmax(0,1fr)]">
        <label
          htmlFor="delivery-zip"
          className="text-[15px] font-bold text-theme-dark dark:text-white"
        >
          Delivery Zip Code
        </label>

        <div className="flex items-center gap-2 min-w-0">
          <div className="relative flex-1 min-w-0">
            <input
              id="delivery-zip"
              ref={inputRef}
              type="text"
              inputMode="numeric"
              value={zip}
              onChange={(e) => { setZip(e.target.value); setOpen(true) }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              onKeyDown={(e) => {
                if (e.key === 'Enter')  { setOpen(false); handleCheck() }
                if (e.key === 'Escape') { setOpen(false); clear() }
              }}
              placeholder="Enter Zip to see your price"
              aria-label="Delivery ZIP or postal code"
              aria-autocomplete="list"
              aria-expanded={showDropdown}
              className="w-full rounded border border-transparent bg-theme-bg px-3 py-2.5 text-sm text-theme-dark outline-none transition-colors placeholder:text-[13px] placeholder:text-theme-muted focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/10 dark:bg-neutral-900 dark:text-white"
            />
            {(loading || busy) && (
              <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-theme-muted" />
            )}

            {showDropdown && (
              <ul
                role="listbox"
                className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md border border-theme-border bg-white shadow-lg dark:bg-neutral-900 dark:border-neutral-700"
              >
                {loading && results.length === 0 && (
                  <li className="px-3 py-2.5 text-sm text-theme-muted">Searching…</li>
                )}
                {error && !loading && (
                  <li className="px-3 py-2.5 text-sm text-theme-primary">{error}</li>
                )}
                {results.map((r) => (
                  <li key={r.placeId} role="option" aria-selected={false}>
                    <button
                      type="button"
                      onMouseDown={() => handleSelect(r)}
                      className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-theme-subtle dark:hover:bg-white/10"
                    >
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-theme-primary" />
                      <span>
                        <span className="font-semibold text-theme-dark dark:text-white">{r.formatted}</span>
                        <span className="block text-[11px] text-theme-muted">{r.country}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Focuses and selects the field rather than toggling a mode: the
              input is always editable, and the pencil is the affordance that
              says so on a control that otherwise reads as static text. */}
          <button
            type="button"
            onClick={() => { inputRef.current?.focus(); inputRef.current?.select(); setOpen(true) }}
            aria-label="Edit delivery ZIP code"
            className="shrink-0 rounded p-1 text-theme-dark transition-colors hover:text-theme-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary dark:text-white"
          >
            <Pencil className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Second row of the grid, in the field's column — so it lines up with
            the input rather than the label, without anyone computing a width. */}
        <div className="@[25rem]:col-start-2">
          <button
            type="button"
            onClick={handleUseMyLocation}
            className="text-[13px] text-theme-primary underline underline-offset-2 transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
          >
            Use my current location
          </button>
          {locateError && (
            <p role="status" className="mt-1 text-[12px] text-theme-muted">
              {locateError}
            </p>
          )}
        </div>
      </div>

      {/* A depot that doesn't stock this exact container used to be silent —
          the ZIP box simply appeared to ignore the input. */}
      {locationChange?.notice && (
        <p role="status" className="mt-2.5 text-[12px] leading-relaxed text-theme-mid">
          {locationChange.notice}
        </p>
      )}
    </div>
  )
}
