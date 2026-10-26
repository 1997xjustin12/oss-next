'use client'

import { useState, useEffect, useId, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Navigation, Loader2, MapPin } from 'lucide-react'
import { useZipLookup } from '@/hooks/useGeoapify'
import type { GeoapifyResult } from '@/hooks/useGeoapify'

type Props = {
  initialZip?: string
  location?: string
  ptype?: string
}

/**
 * The listing's ZIP box. Starts from the URL's ZIP (shown as the saved label
 * when it is the saved ZIP), else the visitor's saved or detected location;
 * all of that, typed-only suggestions and "use current location" come from
 * useZipLookup. A pick, or a submit, goes to this listing for that ZIP.
 */
export function ZipLookup({ initialZip = '', location, ptype = 'buy' }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const {
    value: zip,
    setValue: setZip,
    showResult,
    edited,
    results,
    loading,
    error,
    clear,
    selectResult,
    resolveValue,
    locateMe,
    locating,
  } = useZipLookup({ initialZip, type: 'postcode', countries: 'us,ca', debounceMs: 300, limit: 5 })

  // Auto-select a lone suggestion as it arrives for typed text, with the list
  // open, once per place. Triggered by `results` only, so focusing the box
  // never picks anything.
  const autoSelected = useRef<string | null>(null)
  useEffect(() => {
    if (!edited || !open || results.length !== 1) return
    if (autoSelected.current === results[0].placeId) return
    autoSelected.current = results[0].placeId
    handleSelect(results[0])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results])

  function navigate(zipcode: string, loc: string) {
    const params = new URLSearchParams({ zipcode, location: loc, ptype })
    router.push(`/sale-shipping-containers?${params}`)
  }

  function handleSelect(result: GeoapifyResult) {
    // Refused when the cart holds a container from another depot; the prompt
    // is showing, so stay on this listing rather than navigate to the new one.
    if (!selectResult(result, () => handleSelect(result))) return
    showResult(result)
    setOpen(false)
    navigate(result.postcode || zip, result.nearestLocation ?? result.formatted)
  }

  async function handleSeePrices() {
    const trimmed = zip.trim()
    if (!trimmed) return
    setOpen(false)

    // Submitted without picking a suggestion: resolved and saved like a picked
    // one (handleSelect navigates). Only text that cannot be placed at all
    // falls back to navigating with it as-is.
    const match = await resolveValue()
    if (match) return handleSelect(match)
    navigate(trimmed, location ?? trimmed)
  }

  async function handleUseLocation() {
    // Nothing detected, or it cannot be placed: stay put, the visitor can type.
    const outcome = await locateMe()
    if (outcome.result) handleSelect(outcome.result)
  }

  const listboxId = useId()
  const showDropdown = open && (results.length > 0 || loading || !!error)

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-theme-border bg-white dark:bg-neutral-900 dark:border-neutral-800 p-4">
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
          className="w-full rounded-md border border-theme-border bg-theme-subtle dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-100 dark:placeholder-gray-500 px-3 py-2.5 pr-8 text-sm outline-none transition-colors focus:border-theme-primary focus:bg-white dark:focus:bg-neutral-900"
          aria-label="ZIP or postal code"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
        />
        {loading && (
          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted animate-spin pointer-events-none" />
        )}

        {showDropdown && (
          <ul
            id={listboxId}
            role="listbox"
            className="absolute z-50 left-0 right-0 top-full mt-1 rounded-md border border-theme-border dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg overflow-hidden"
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
                  onMouseDown={() => handleSelect(r)}
                  className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left text-sm hover:bg-theme-subtle dark:hover:bg-neutral-800 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-theme-primary shrink-0 mt-0.5" />
                  <span>
                    <span className="font-semibold text-theme-dark dark:text-gray-100">
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
        className="flex items-center justify-center gap-2 rounded-md bg-theme-dark dark:bg-neutral-700 px-3 py-2.5 text-sm font-bold text-white transition-colors hover:bg-black dark:hover:bg-neutral-600 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {locating
          ? <><Loader2 size={14} className="animate-spin" /> Locating…</>
          : <><Navigation size={14} /> Use Current Location</>
        }
      </button>
    </div>
  )
}
