'use client'

import { useEffect, useId, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CircleArrowRight, Loader2, LocateFixed, MapPin } from 'lucide-react'
import { useZipLookup } from '@/hooks/useGeoapify'
import type { GeoapifyResult } from '@/hooks/useGeoapify'
import { ROUTES } from '@/config/routes'

/**
 * The depot finder: a ZIP, its suggestions, and the listing for whichever one
 * is chosen.
 *
 * Built on `useZipLookup` (hooks/useGeoapify.ts), like every ZIP box: it
 * starts from the visitor's saved or detected location, suggests only for what
 * they type, resolves a submit without a pick, and handles "use my current
 * location". What is particular to this box is only where a pick leads: the
 * listing for that ZIP and depot.
 */
export function LocationSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  // Prefill from the saved / detected location, typed-only suggestions,
  // "use my current location": all in the shared hook.
  const {
    value: zip,
    setValue: setZip,
    showResult,
    results,
    loading,
    error,
    clear,
    selectResult,
    resolveValue,
    locateMe,
    locating,
  } = useZipLookup({ type: 'postcode', countries: 'us,ca', debounceMs: 300, limit: 5 })

  const listboxId = useId()
  const noticeId = useId()
  const showDropdown = open && (results.length > 0 || loading || !!error)

  /**
   * One suggestion means there is nothing to choose, so choose it.
   *
   * Guarded on `open`: without it this fires for the list that arrives after
   * "use my current location" has already navigated, and for a list left over
   * from a blurred input.
   */
  useEffect(() => {
    if (open && results.length === 1) handleSelect(results[0])
    // handleSelect is stable enough for this purpose and re-creating the effect
    // on every render would re-fire the navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, open])

  function goToListing(postcode: string, depot: string) {
    const params = new URLSearchParams({ zipcode: postcode, location: depot, ptype: 'buy' })
    router.push(`${ROUTES.PLP}?${params}`)
  }

  function handleSelect(result: GeoapifyResult) {
    // False when the cart holds a container from another depot: the conflict
    // prompt is already showing, and navigating would carry the visitor off to
    // a listing for a location change that has not happened.
    if (!selectResult(result, () => handleSelect(result))) return

    setNotice(null)
    showResult(result)
    setOpen(false)
    goToListing(result.postcode || zip.trim(), result.nearestLocation ?? result.formatted)
  }

  /** Submitted without picking a suggestion: what was typed, or the prefilled location. */
  async function handleSubmit() {
    if (!zip.trim() || busy) return

    setOpen(false)
    setNotice(null)
    setBusy(true)
    try {
      const match = await resolveValue()
      if (match) {
        handleSelect(match)
        return
      }
      setNotice('We could not find that ZIP or postal code. Please check it and try again.')
    } finally {
      setBusy(false)
    }
  }

  async function handleUseMyLocation() {
    if (busy || locating) return
    setNotice(null)
    const outcome = await locateMe()
    if (outcome.result) {
      handleSelect(outcome.result)
      return
    }
    setNotice(
      outcome.reason === 'unknown'
        ? 'We do not have your location yet. Please enter your ZIP or postal code.'
        : 'We could not find that ZIP or postal code. Please check it and try again.',
    )
  }

  return (
    <div className="w-full max-w-md">
      <form
        role="search"
        aria-label="Find shipping containers near a location"
        onSubmit={(e) => {
          e.preventDefault()
          void handleSubmit()
        }}
        className="relative flex w-full items-stretch rounded-md bg-white shadow-lg dark:bg-neutral-100"
      >
        {/*
          A label, not a placeholder standing in for one. Placeholder text
          disappears the moment someone types, which leaves anyone who looks
          away mid-entry — and every screen reader — with an unlabelled box.
        */}
        <label htmlFor="depot-location" className="sr-only">
          ZIP or postal code
        </label>

        <input
          id="depot-location"
          name="location"
          value={zip}
          onChange={(e) => {
            setZip(e.target.value)
            setOpen(true)
            setNotice(null)
          }}
          onFocus={() => setOpen(true)}
          // Delayed: a click on a suggestion lands after blur, and closing the
          // list immediately would remove the thing being clicked.
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setOpen(false)
              clear()
            }
          }}
          type="text"
          inputMode="numeric"
          maxLength={10}
          autoComplete="postal-code"
          placeholder="Enter your Zip/Postal Code"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-describedby={notice ? noticeId : undefined}
          className="min-w-0 flex-1 rounded-l-md bg-transparent px-4 py-3.5 text-sm text-theme-dark
                     placeholder:text-theme-muted focus:outline-none sm:text-base"
        />

        <button
          type="submit"
          disabled={busy || locating}
          // The icon is the whole control, so the name has to come from
          // somewhere a pointer user never sees.
          aria-label="Search this location"
          className="flex shrink-0 items-center justify-center rounded-r-md bg-theme-primary px-4 text-white
                     transition-colors hover:bg-theme-primary-dark disabled:cursor-not-allowed disabled:opacity-80
                     focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
        >
          {busy || locating ? (
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
          ) : (
            <CircleArrowRight className="h-6 w-6" aria-hidden />
          )}
        </button>

        {showDropdown && (
          <ul
            id={listboxId}
            role="listbox"
            className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md border border-theme-border
                       bg-white text-left shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
          >
            {loading && results.length === 0 && (
              <li className="px-3 py-2.5 text-sm text-theme-muted">Searching…</li>
            )}
            {error && !loading && (
              <li className="px-3 py-2.5 text-sm text-theme-primary">{error}</li>
            )}
            {results.map((r) => (
              <li key={r.placeId} role="option" aria-selected={false}>
                {/*
                  `onMouseDown`, not `onClick`: blur fires first on a click and
                  would close the list before the click landed.
                */}
                <button
                  type="button"
                  onMouseDown={() => handleSelect(r)}
                  className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left text-sm transition-colors
                             hover:bg-theme-subtle dark:hover:bg-neutral-800"
                >
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-theme-primary" aria-hidden />
                  <span>
                    <span className="font-semibold text-theme-dark dark:text-gray-100">{r.formatted}</span>
                    <span className="block text-[11px] text-theme-muted">{r.country}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </form>

      {/*
        `role="alert"` so a screen reader hears the failure without having to
        go looking for it — the input that caused it keeps focus.
      */}
      {notice && (
        <p
          id={noticeId}
          role="alert"
          className="mt-2 rounded-md bg-black/50 px-3 py-2 text-xs font-semibold text-white backdrop-blur-[2px] sm:text-sm"
        >
          {notice}
        </p>
      )}

      {/*
        Centred under the input, as in the design. The hero's own content is
        left-aligned; this sits inside that left-aligned block, so centring it
        here is a property of the component rather than of the hero.
      */}
      <div className="mt-3 flex justify-center">
        <button
          type="button"
          onClick={() => void handleUseMyLocation()}
          disabled={busy || locating}
          className="inline-flex items-center gap-2 rounded-full border border-white/70 px-4 py-2
                     text-xs font-semibold text-white backdrop-blur-[2px]
                     transition-colors hover:border-white hover:bg-white/10
                     disabled:cursor-not-allowed disabled:opacity-70
                     focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white
                     sm:text-sm"
        >
          <LocateFixed className="h-4 w-4 shrink-0" aria-hidden />
          Use my current location
        </button>
      </div>
    </div>
  )
}
