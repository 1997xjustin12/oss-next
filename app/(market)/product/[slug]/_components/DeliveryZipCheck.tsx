'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Truck, Loader2, MapPin } from 'lucide-react'
import { useGeoapify } from '@/hooks/useGeoapify'
import type { GeoapifyResult } from '@/hooks/useGeoapify'
import { findEquivalentContainer } from '@/lib/pricing'
import type { ProductHit, FormattedContainerHit } from '@/types/product'

type Props = { product: ProductHit }

export function DeliveryZipCheck({ product }: Props) {
  const router = useRouter()
  const [zip, setZip] = useState('')
  const [open, setOpen] = useState(false)
  const [matching, setMatching] = useState(false)

  const { results, loading, error, clear, selectResult } = useGeoapify(zip, {
    type: 'postcode',
    countries: 'us,ca',
    debounceMs: 300,
    limit: 5,
  })

  // Auto-select once the suggestions narrow to exactly one match — same
  // convenience ZipLookup1 offers on the homepage.
  useEffect(() => {
    if (open && results.length === 1) {
      handleSelect(results[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results])

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
    setOpen(false)
    if (result.nearestLocation) {
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
          {(loading || matching) && (
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
          disabled={matching}
          className="bg-theme-primary hover:bg-theme-primary-dark text-white text-sm font-bold px-4 sm:px-5 rounded transition-colors whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Check
        </button>
      </div>
    </div>
  )
}
