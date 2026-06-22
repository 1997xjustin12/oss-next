'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Navigation, Loader2, MapPin } from 'lucide-react'
import { useGeoapify } from '@/hooks/useGeoapify'
import type { GeoapifyResult } from '@/hooks/useGeoapify'

type Props = {
  initialZip?: string
  location?: string
  ptype?: string
}

export function ZipLookup({ initialZip = '', location, ptype = 'buy' }: Props) {
  const router = useRouter()
  const [zip, setZip] = useState(initialZip)
  const [open, setOpen] = useState(false)

  const { results, loading, error, clear, selectResult } = useGeoapify(zip, {
    type: 'postcode',
    countries: 'us,ca',
    debounceMs: 300,
    limit: 5,
  })

  function navigate(zipcode: string, loc: string) {
    const params = new URLSearchParams({ zipcode, location: loc, ptype })
    router.push(`/sale-shipping-containers?${params}`)
  }

  function handleSelect(result: GeoapifyResult) {
    setZip(result.formatted)
    selectResult(result)
    setOpen(false)
    navigate(result.postcode || zip, result.nearestLocation ?? result.formatted)
  }

  function handleSeePrices() {
    const trimmed = zip.trim()
    if (!trimmed) return
    setOpen(false)
    navigate(trimmed, location ?? trimmed)
  }

  function handleUseLocation() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const params = new URLSearchParams({
        lat: String(coords.latitude),
        lng: String(coords.longitude),
        ptype,
      })
      router.push(`/sale-shipping-containers?${params}`)
    })
  }

  const showDropdown = open && (results.length > 0 || loading || !!error)

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-theme-border bg-white p-4">
      {/* Input + dropdown */}
      <div className="relative">
        <input
          value={zip}
          onChange={(e) => { setZip(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === 'Enter')  { setOpen(false); handleSeePrices() }
            if (e.key === 'Escape') { setOpen(false); clear() }
          }}
          type="text"
          inputMode="numeric"
          maxLength={10}
          placeholder="Enter your ZIP / Postal Code"
          className="w-full rounded-md border border-theme-border bg-theme-subtle px-3 py-2.5 pr-8 text-sm outline-none transition-colors focus:border-theme-primary focus:bg-white"
          aria-label="ZIP or postal code"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
        />
        {loading && (
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
                  onMouseDown={() => handleSelect(r)}
                  className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left text-sm hover:bg-theme-subtle transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-theme-primary shrink-0 mt-0.5" />
                  <span>
                    <span className="font-semibold text-theme-dark">
                      {[r.city, r.stateCode].filter(Boolean).join(', ')}
                      {r.postcode ? ` ${r.postcode}` : ''}
                    </span>
                    <span className="block text-[11px] text-theme-muted">{r.country}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={handleSeePrices}
        className="flex items-center justify-center gap-2 rounded-md bg-theme-primary px-3 py-2.5 text-sm font-extrabold text-white transition-colors hover:bg-theme-primary-dark"
      >
        See Prices <ArrowRight size={15} />
      </button>

      <button
        onClick={handleUseLocation}
        className="flex items-center justify-center gap-2 rounded-md bg-theme-dark px-3 py-2.5 text-sm font-bold text-white transition-colors hover:bg-black"
      >
        <Navigation size={14} /> Use Current Location
      </button>
    </div>
  )
}
