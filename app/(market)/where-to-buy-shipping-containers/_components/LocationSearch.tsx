'use client'

import { useEffect, useId, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CircleArrowRight, Loader2, LocateFixed, MapPin } from 'lucide-react'
import { useGeoapify } from '@/hooks/useGeoapify'
import { useStoredZip } from '@/hooks/useStoredZip'
import type { GeoapifyResult } from '@/hooks/useGeoapify'
import { ROUTES } from '@/config/routes'

/** Where the geolocation detector caches what it found. */
const DETECTED_ZIP_KEY = 'userZipCode'

/**
 * The depot finder: a ZIP, its suggestions, and the listing for whichever one
 * is chosen.
 *
 * Deliberately built on `useGeoapify` rather than on the listing's own
 * `ZipLookup`. The two look nothing alike and want different chrome, but more
 * importantly the hook already owns every subtle part: the debounce, the
 * one-depot-per-order guard, and `resolveTyped`, whose comment names "use my
 * current location" as the case it was hardened against.
 *
 * That last point is why this does not copy `ZipLookup.handleUseLocation`,
 * which hand-rolls its own `/api/geoapify` fetch. `resolveTyped` resolves a raw
 * ZIP correctly even while the suggestion list still holds results for whatever
 * the box showed a moment ago — the exact confusion the hand-rolled version was
 * patched for.
 */
export function LocationSearch() {
  const router = useRouter()
  const [zip, setZip] = useState('')
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  // Whether the visitor has typed in the box. Until they do, it shows their
  // saved location and asks Geoapify for nothing.
  const [edited, setEdited] = useState(false)
  const stored = useStoredZip()

  /**
   * Prefill from storage, as the listing's ZipLookup does: the saved location's
   * label ("Atlanta, GA 30303") when the visitor has chosen one, else the ZIP
   * the geolocation detector found. Follows a change made elsewhere (another
   * ZIP box, another tab) until the visitor types here.
   */
  useEffect(() => {
    if (!stored.resolved || edited) return
    let detected = ''
    try {
      detected = localStorage.getItem(DETECTED_ZIP_KEY) ?? ''
    } catch {
      // Private mode, or storage blocked: nothing to prefill from.
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mirrors storage (client-only) into the box
    setZip(stored.label || stored.postcode || detected)
  }, [stored, edited])

  // Suggestions only for what the visitor types: the prefilled label is not a
  // query, and looking it up on every page view would be a wasted request.
  const { results, loading, error, clear, selectResult, resolveTyped } = useGeoapify(edited ? zip : '', {
    type: 'postcode',
    countries: 'us,ca',
    debounceMs: 300,
    limit: 5,
  })

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
    setZip(result.formatted)
    setOpen(false)
    goToListing(result.postcode || zip.trim(), result.nearestLocation ?? result.formatted)
  }

  /** Typed a ZIP and pressed the button before the suggestions caught up. */
  async function handleSubmit() {
    const trimmed = zip.trim()
    if (!trimmed || busy) return

    // Untouched prefill of the saved location: its ZIP and depot are already
    // known and already saved, so go straight to that listing.
    if (!edited && stored.postcode && stored.depot && trimmed === (stored.label || stored.postcode)) {
      setOpen(false)
      setNotice(null)
      goToListing(stored.postcode, stored.depot)
      return
    }

    setOpen(false)
    setNotice(null)
    setBusy(true)
    try {
      const match = await resolveTyped(trimmed)
      if (match) {
        handleSelect(match)
        return
      }
      setNotice('We could not find that ZIP or postal code. Please check it and try again.')
    } finally {
      setBusy(false)
    }
  }

  /**
   * The ZIP the geolocation detector already found, if it ever ran.
   *
   * Reads storage rather than asking the browser for coordinates: the
   * permission prompt belongs to whatever first detected the location, and
   * asking again here would be a second prompt for an answer we already have.
   */
  async function handleUseMyLocation() {
    if (busy) return
    setNotice(null)

    let detected = ''
    try {
      detected = localStorage.getItem(DETECTED_ZIP_KEY) ?? ''
    } catch {
      // Private mode, or storage blocked. Treated as "nothing stored".
    }

    if (!detected) {
      setNotice('We do not have your location yet. Please enter your ZIP or postal code.')
      return
    }

    // Shown in the box first, so the button visibly does something even while
    // the lookup is in flight — and so a failure leaves them with the ZIP to
    // correct rather than an empty field.
    setZip(detected)
    setBusy(true)
    try {
      const match = await resolveTyped(detected)
      if (match) {
        handleSelect(match)
        return
      }
      setNotice('We could not find that ZIP or postal code. Please check it and try again.')
    } finally {
      setBusy(false)
    }
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
            setEdited(true)
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
          disabled={busy}
          // The icon is the whole control, so the name has to come from
          // somewhere a pointer user never sees.
          aria-label="Search this location"
          className="flex shrink-0 items-center justify-center rounded-r-md bg-theme-primary px-4 text-white
                     transition-colors hover:bg-theme-primary-dark disabled:cursor-not-allowed disabled:opacity-80
                     focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
        >
          {busy ? (
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
          disabled={busy}
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
