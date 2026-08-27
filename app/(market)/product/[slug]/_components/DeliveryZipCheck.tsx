'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Truck, Loader2, MapPin } from 'lucide-react'
import { useGeoapify } from '@/hooks/useGeoapify'
import type { GeoapifyResult } from '@/hooks/useGeoapify'
import { findEquivalentContainer } from '@/lib/pricing'
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
  const [zip, setZip] = useState('')
  const [open, setOpen] = useState(false)
  const [matching, setMatching] = useState(false)

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

  function handleCheck() {
    if (results.length === 1) handleSelect(results[0])
  }

  const showDropdown = open && (results.length > 0 || loading || !!error)

  return (
    <div className="bg-theme-subtle border border-theme-border rounded-lg p-4 mb-5 focus-within:border-theme-primary transition-colors">
      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-theme-mid mb-2.5">
        <Truck className="w-3.5 h-3.5 text-theme-primary" />
        Check Delivery to Your ZIP Code
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1 min-w-0">
          <input
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
            placeholder="Enter ZIP code"
            aria-label="ZIP or postal code"
            aria-autocomplete="list"
            aria-expanded={showDropdown}
            className="w-full border border-theme-border rounded px-3 py-2 text-sm bg-theme-bg text-theme-dark outline-none focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/10 transition-colors"
          />
          {(loading || busy) && (
            <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted animate-spin pointer-events-none" />
          )}

          {showDropdown && (
            <ul
              role="listbox"
              className="absolute z-50 left-0 right-0 top-full mt-1 rounded-md border border-theme-border bg-white shadow-lg overflow-hidden"
            >
              {loading && results.length === 0 && (
                <li className="px-3 py-2.5 text-sm text-theme-muted">Searching…</li>
              )}
              {error && !loading && (
                <li className="px-3 py-2.5 text-sm text-theme-primary">{error}</li>
              )}
              {results.map((r) => (
                <li key={r.placeId} role="option">
                  <button
                    type="button"
                    onMouseDown={() => handleSelect(r)}
                    className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left text-sm hover:bg-theme-subtle transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-theme-primary shrink-0 mt-0.5" />
                    <span>
                      <span className="font-semibold text-theme-dark">{r.formatted}</span>
                      <span className="block text-[11px] text-theme-muted">{r.country}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="button"
          onClick={handleCheck}
          disabled={busy}
          className="bg-theme-primary hover:bg-theme-primary-dark text-white text-sm font-bold px-4 sm:px-5 rounded transition-colors whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Check
        </button>
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
