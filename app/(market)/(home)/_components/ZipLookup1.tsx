'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, MapPin } from 'lucide-react'
import { useGeoapify } from '@/hooks/useGeoapify'
import type { GeoapifyResult } from '@/hooks/useGeoapify'

type Props = {
  initialZip?: string
  location?: string
  ptype?: string
}

export function ZipLookup1({ initialZip = '', location = '', ptype = 'buy' }: Props) {
  const router = useRouter()
  const [zip, setZip] = useState(initialZip)
  const [open, setOpen] = useState(false)

  const { results, loading, error, clear, selectResult } = useGeoapify(zip, {
    type: 'postcode',
    countries: 'us,ca',
    debounceMs: 300,
    limit: 5,
  })

  // Sync input with URL: clear when no zipcode param, show pretty label when there is one
  useEffect(() => {
    if (!initialZip) {
      setZip('')
      return
    }
    const label = localStorage.getItem('zipcode_label')
    const stored = localStorage.getItem('zipcode')
    if (stored === initialZip && label) setZip(label)
    else setZip(initialZip)
  }, [initialZip])

  useEffect(() => {
    if (open && results.length === 1) {
      handleSelect(results[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results])

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

  const showDropdown = open && (results.length > 0 || loading || !!error)

  return (
    <div className="flex w-full max-w-xl mx-auto flex-col gap-3 sm:flex-row">
      {/* Input + dropdown */}
      <div className="relative flex-1">
        <input
          value={zip}
          onChange={(e) => { setZip(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { setOpen(false); handleSeePrices() }
            if (e.key === 'Escape') { setOpen(false); clear() }
          }}
          type="text"
          inputMode="numeric"
          maxLength={10}
          placeholder="Enter Zipcode"
          className="w-full bg-white text-theme-dark placeholder-theme-dark/70 px-4 py-3 sm:py-4 text-base sm:text-lg font-bold outline-none"
          aria-label="ZIP or postal code"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted animate-spin pointer-events-none" />
        )}

        {showDropdown && (
          <ul
            role="listbox"
            className="absolute z-50 left-0 right-0 top-full mt-1 border border-theme-border bg-white shadow-lg overflow-hidden"
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

      <button
        onClick={handleSeePrices}
        className="flex items-center justify-center bg-theme-primary px-6 py-3 sm:py-4 text-base sm:text-lg font-bold text-white transition-colors hover:bg-theme-primary-dark sm:shrink-0"
      >
        Find Local Pricing
      </button>
    </div>
  )
}
