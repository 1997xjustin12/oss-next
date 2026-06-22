'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Navigation, Loader2, MapPin } from 'lucide-react'
import { useGeoapify } from '@/hooks/useGeoapify'
import type { GeoapifyResult } from '@/hooks/useGeoapify'
import { getNearestLocation } from '@/lib/locations'

const GEOAPIFY_URL = 'https://api.geoapify.com/v1/geocode/autocomplete'
const GEOAPIFY_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ?? ''

type Props = {
  initialZip?: string
  location?: string
  ptype?: string
}

export function ZipLookup({ initialZip = '', location, ptype = 'buy' }: Props) {
  const router = useRouter()
  const [zip, setZip] = useState(initialZip)
  const [open, setOpen] = useState(false)
  const [locating, setLocating] = useState(false)

  const { results, loading, error, clear, selectResult } = useGeoapify(zip, {
    type: 'postcode',
    countries: 'us,ca',
    debounceMs: 300,
    limit: 5,
  })

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

  async function handleUseLocation() {
    const userZipCode = localStorage.getItem('userZipCode')
    if (!userZipCode) return

    setLocating(true)
    try {
      const params = new URLSearchParams({
        text:   userZipCode,
        apiKey: GEOAPIFY_KEY,
        limit:  '1',
        type:   'postcode',
        filter: 'countrycode:us,ca',
      })

      const res = await fetch(`${GEOAPIFY_URL}?${params}`)
      if (!res.ok) return

      const json = (await res.json()) as { features?: unknown[] }
      const feature = json.features?.[0]
      if (!feature) return

      const p = (feature as { properties: Record<string, unknown> }).properties
      const lat         = Number(p.lat      ?? 0)
      const lon         = Number(p.lon      ?? 0)
      const postcode    = String(p.postcode  ?? userZipCode)
      const formatted   = String(p.formatted ?? userZipCode)
      const nearestLocation = getNearestLocation(lat, lon)

      const redirectParams = new URLSearchParams({ zipcode: postcode })
      if (nearestLocation) redirectParams.set('location', nearestLocation)
      const galleryRedirect = `/sale-shipping-containers?${redirectParams}`

      localStorage.setItem('zipcode',          postcode)
      localStorage.setItem('zipcode_label',    formatted)
      localStorage.setItem('zipcode_depot',    nearestLocation ?? '')
      localStorage.setItem('gallery_redirect', galleryRedirect)

      setZip(formatted)
      navigate(postcode, nearestLocation ?? formatted)
    } catch {
      // silently fail — user can type manually
    } finally {
      setLocating(false)
    }
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
        className="flex items-center justify-center gap-2 rounded-md bg-theme-primary px-3 py-2.5 text-sm font-extrabold text-white transition-colors hover:bg-theme-primary-dark"
      >
        See Prices <ArrowRight size={15} />
      </button>

      <button
        onClick={handleUseLocation}
        disabled={locating}
        className="flex items-center justify-center gap-2 rounded-md bg-theme-dark px-3 py-2.5 text-sm font-bold text-white transition-colors hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {locating
          ? <><Loader2 size={14} className="animate-spin" /> Locating…</>
          : <><Navigation size={14} /> Use Current Location</>
        }
      </button>
    </div>
  )
}
