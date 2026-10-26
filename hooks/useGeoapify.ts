'use client'

import { useState, useEffect, useRef } from 'react'
import { saveVisitorZip } from '@/lib/visitorZip'
import { getNearestLocation } from '@/lib/nearestDepot'
import { enrichSaleLinks } from '@/lib/linkEnrich'
import { DEFAULT_LOCATION } from '@/lib/constants'
import { ROUTES } from '@/config/routes'
import { useCart } from '@/hooks/useCart'
import { findLocationConflict, requestCartLocationConflict } from '@/lib/cart'
import type { FormattedContainerHit } from '@/types/product'
export type { ShippingContainerHit, FormattedContainerHit } from '@/types/product'

import { isAbandonedRequest } from '@/lib/pageUnloading'
import { useStoredZip } from '@/hooks/useStoredZip'
import { readDetectedZip, savedLocationResult, zipPrefill } from '@/lib/zipLookup'

const GEOAPIFY_PROXY = '/api/geoapify'

export interface GeoapifyResult {
  placeId: string
  formatted: string
  formatted2: string
  city: string
  state: string
  stateCode: string
  postcode: string
  country: string
  countryCode: string
  lat: number
  lon: number
  nearestLocation: string | null
  galleryRedirect: string
}

export interface UseGeoapifyOptions {
  /** Debounce delay in ms before firing the request. Default: 300 */
  debounceMs?: number
  /** Max number of suggestions to return. Default: 5 */
  limit?: number
  /** Comma-separated Geoapify country codes to filter results. Default: 'us,ca' */
  countries?: string
  /** Geoapify result type filter. Default: 'postcode' */
  type?: 'postcode' | 'city' | 'street' | 'amenity' | 'locality' | 'county' | 'state' | 'country'
  /** Minimum query length before fetching. Default: 2 */
  minLength?: number
  /**
   * Load the depot's container list on mount and after each pick. Only the
   * homepage ZIP banner (variant 3) reads `depotContainers`; every other caller
   * was fetching about 0.5 MB it never used, three times on a product page.
   * Default: false
   */
  loadDepotContainers?: boolean
}

export interface UseGeoapifyReturn {
  results: GeoapifyResult[]
  loading: boolean
  error: string | null
  clear: () => void
  /**
   * Save a picked place as the visitor's location. Returns **false** when it
   * was refused — the cart holds a container from another depot — in which
   * case the conflict prompt is already showing and the caller must stop:
   * whatever it was about to do next (swap the product, navigate to the
   * listing) belongs to a location change that did not happen.
   *
   * `retry` is what to run if the visitor clears their cart to switch. Pass
   * the handler that called this, so the whole action completes — not just the
   * save. Without it, clearing the cart saves the location and stops there.
   */
  selectResult: (result: GeoapifyResult, retry?: () => void) => boolean
  /**
   * The same guard, for a location that did not come from a picked
   * suggestion — "use my current location", say. True when the change may go
   * ahead; false when it was refused and the prompt is showing.
   */
  confirmLocationChange: (depot: string, retry?: () => void) => boolean
  /**
   * The place a typed ZIP refers to, for "typed it and pressed the button".
   *
   * Someone who types five digits and clicks straight away beats the debounce,
   * so the suggestion list is usually still empty at that moment. This checks
   * the list first and asks the lookup directly if it has not arrived. Null
   * when the text does not name one place. Pass the result to your own select
   * handler, so it goes through `selectResult` like a picked suggestion.
   */
  resolveTyped: (text: string) => Promise<GeoapifyResult | null>
  depotContainers: FormattedContainerHit[]
  depotContainersLoading: boolean
  depotContainersError: string | null
}

function parseFeature(feature: unknown): GeoapifyResult {
  const p = (feature as { properties: Record<string, unknown> }).properties
  const lat = Number(p.lat ?? 0)
  const lon = Number(p.lon ?? 0)
  const nearestLocation = getNearestLocation(lat, lon)
  const postcode = String(p.postcode ?? '')
  const redirectParams = new URLSearchParams({ zipcode: postcode })
  // Built by joining the parts that exist rather than interpolating directly.
  // Geoapify returns postcodes with no city — 30345 is one — and `${p.city}`
  // renders those as the literal string "undefined". That is not just ugly on
  // screen: selectResult writes `formatted` into zipcode_label, so
  // "undefined, GA 30345" gets persisted and shown back on every later visit.
  const city = String(p.city ?? '')
  const stateCode = String(p.state_code ?? '')
  const country = String(p.country ?? '')
  const place = [city, stateCode].filter(Boolean).join(', ')
  const formatted = [place, postcode].filter(Boolean).join(' ')
  const formatted2 = [formatted, country].filter(Boolean).join(', ')
  if (nearestLocation) redirectParams.set('location', nearestLocation)

  return {
    placeId:         String(p.place_id     ?? ''),
    formatted,
    formatted2,
    city,
    state:           String(p.state        ?? ''),
    stateCode,
    postcode,
    country,
    countryCode:     String(p.country_code ?? ''),
    lat,
    lon,
    nearestLocation,
    galleryRedirect: `${ROUTES.PLP}?${redirectParams}`,
  }
}

export function useGeoapify(
  query: string,
  {
    debounceMs = 300,
    limit      = 5,
    countries  = 'us,ca',
    type       = 'postcode',
    minLength  = 2,
    loadDepotContainers = false,
  }: UseGeoapifyOptions = {},
): UseGeoapifyReturn {
  const [results, setResults] = useState<GeoapifyResult[]>([])

  // Read through a ref so a retry run after the cart is cleared sees the
  // cleared cart. A closure would hold the cart from the render that blocked
  // it, and refuse again.
  const { cart } = useCart()
  const cartRef = useRef(cart)
  useEffect(() => {
    cartRef.current = cart
  }, [cart])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const [depotContainers, setDepotContainers]               = useState<FormattedContainerHit[]>([])
  const [depotContainersLoading, setDepotContainersLoading] = useState(false)
  const [depotContainersError, setDepotContainersError]     = useState<string | null>(null)

  useEffect(() => {
    const trimmed = query.trim()

    if (trimmed.length < minLength) {
      // Drops the last query's suggestions as the text gets too short to search.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([])
      setLoading(false)
      return
    }

    const timer = setTimeout(async () => {
      abortRef.current?.abort()
      abortRef.current = new AbortController()

      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          text:   trimmed,
          limit:  String(limit),
          type,
          filter: `countrycode:${countries}`,
        })

        const res = await fetch(`${GEOAPIFY_PROXY}?${params}`, {
          signal: abortRef.current.signal,
        })

        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const json = (await res.json()) as { features?: unknown[] }
        const parsed = (json.features ?? []).map(parseFeature)
        setResults(parsed)
      } catch (err) {
        // AbortError: a newer keystroke superseded this one. isAbandonedRequest:
        // the visitor navigated away and the browser cancelled it. Neither is a
        // lookup failure worth reporting.
        if ((err as Error).name !== 'AbortError' && !isAbandonedRequest(err)) {
          console.error('[useGeoapify] query error — query:', trimmed, err)
          setError('Could not fetch location suggestions.')
          setResults([])
        }
      } finally {
        setLoading(false)
      }
    }, debounceMs)

    return () => {
      clearTimeout(timer)
      abortRef.current?.abort()
    }
  }, [query, debounceMs, limit, countries, type, minLength])

  function clear() {
    setResults([])
    setError(null)
  }

  async function fetchDepotContainers(location: string, source: 'init' | 'select') {
    setDepotContainersLoading(true)
    setDepotContainersError(null)

    try {
      const params = new URLSearchParams({ location })
      const res = await fetch(`/api/shipping-containers/by-location?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const json = (await res.json()) as { data?: FormattedContainerHit[] }
      setDepotContainers(json.data ?? [])
    } catch (err) {
      // The visitor left mid-request: nothing failed, and nothing is listening.
      if (isAbandonedRequest(err)) return
      console.error('[useGeoapify] fetchDepotContainers error — source, location:', source, location, err)
      setDepotContainersError('Could not fetch containers for this location.')
      setDepotContainers([])
    } finally {
      setDepotContainersLoading(false)
    }
  }

  // Initial load: use the previously-selected depot if one is stored, otherwise
  // fall back to the default location so there's always something to show.
  useEffect(() => {
    if (!loadDepotContainers) return
    const storedDepot = localStorage.getItem('zipcode_depot')
    // eslint-disable-next-line react-hooks/set-state-in-effect -- starts the fetch; its loading flag is set first
    void fetchDepotContainers(storedDepot || DEFAULT_LOCATION, 'init')
  }, [loadDepotContainers])

  /** Exact postcode match, else the only result, else nothing. */
  function pickTyped(candidates: GeoapifyResult[], text: string): GeoapifyResult | null {
    // \s, not s: after toUpperCase() a bare `s` matches nothing, so "K1A0B1"
    // never matched the suggestion "K1A 0B1".
    const norm = (value: string) => value.toUpperCase().replace(/\s+/g, '')
    const wanted = norm(text)
    if (!wanted) return null
    return (
      candidates.find((r) => norm(r.postcode) === wanted) ??
      (candidates.length === 1 ? candidates[0] : null)
    )
  }

  async function resolveTyped(text: string): Promise<GeoapifyResult | null> {
    const trimmed = text.trim()
    if (trimmed.length < minLength) return null

    // The current list only answers for the text it was fetched for. It holds
    // suggestions for whatever the input shows *now*, which need not be this —
    // "Use my current location" resolves the detected ZIP while the box still
    // shows the typed one, and its lone suggestion used to win the "only
    // result" fallback and resolve to the wrong city. An exact postcode match is
    // safe from any list; the single-result fallback is not.
    const norm = (value: string) => value.toUpperCase().replace(/\s+/g, '')
    const exact = results.find((r) => norm(r.postcode) === norm(trimmed))
    if (exact) return exact
    if (query.trim() === trimmed && results.length === 1) return results[0]

    try {
      const params = new URLSearchParams({
        text: trimmed,
        limit: String(limit),
        type,
        filter: `countrycode:${countries}`,
      })
      const res = await fetch(`${GEOAPIFY_PROXY}?${params}`)
      if (!res.ok) return null
      const json = (await res.json()) as { features?: unknown[] }
      return pickTyped((json.features ?? []).map(parseFeature), trimmed)
    } catch {
      return null
    }
  }

  /**
   * One depot per order: a location change that would leave the cart holding a
   * container from somewhere else is refused, and the global prompt explains.
   * Same rule add-to-cart enforces (`findLocationConflict`), applied from the
   * other direction. Lives here so every ZIP input built on this hook is
   * covered without doing anything.
   *
   * A place with no depot passes: there is nothing to compare, and refusing
   * would leave the visitor unable to enter a ZIP at all.
   */
  function confirmLocationChange(depot: string, retry?: () => void): boolean {
    if (!depot) return true
    const clash = findLocationConflict(cartRef.current, { isContainer: true, location: depot })
    if (!clash?.location) return true

    requestCartLocationConflict({
      currentLocation: clash.location,
      newLocation: depot,
      reason: 'zip',
      retry,
    })
    return false
  }

  function selectResult(result: GeoapifyResult, retry?: () => void): boolean {
    const depot = result.nearestLocation ?? ''
    if (!confirmLocationChange(depot, retry ?? (() => selectResult(result)))) return false

    localStorage.setItem('gallery_redirect', result.galleryRedirect)
    // Storage, the address bar and the broadcast every link listens for, in
    // one call — see saveVisitorZip. Every component built on this hook gets
    // all of it by calling selectResult; none has to know the pieces exist.
    saveVisitorZip({
      postcode: result.postcode,
      label: result.formatted,
      depot: result.nearestLocation ?? '',
    })
    enrichSaleLinks()
    clear()

    if (loadDepotContainers && result.nearestLocation) {
      void fetchDepotContainers(result.nearestLocation, 'select')
    }
    return true
  }

  return {
    results,
    loading,
    error,
    clear,
    selectResult,
    confirmLocationChange,
    resolveTyped,
    depotContainers,
    depotContainersLoading,
    depotContainersError,
  }
}

// ─── useZipLookup: every ZIP box ───────────────────────────────────────────────

export interface UseZipLookupOptions extends UseGeoapifyOptions {
  /** A ZIP the page already has (the URL's ?zipcode=). It wins over storage. */
  initialZip?: string
}

/** "Use my current location": the place to select, or why there is none. */
export type LocateOutcome =
  | { result: GeoapifyResult; reason?: undefined }
  | { result: null; reason: 'unknown' | 'not-found' }

export interface UseZipLookupReturn extends UseGeoapifyReturn {
  /** What the box shows. Bind it to the input's value. */
  value: string
  /** For the input's onChange: the visitor typed. Suggestions follow from here. */
  setValue: (value: string) => void
  /** Show a chosen place in the box after a pick, without counting as typing. */
  showResult: (result: GeoapifyResult) => void
  /** Whether the visitor has typed in the box since it was prefilled. */
  edited: boolean
  /** True while locateMe() is resolving the detected ZIP. */
  locating: boolean
  /**
   * The place the box stands for, for a submit without a picked suggestion:
   * what the visitor typed, or (untouched) the prefilled location, using the
   * saved depot directly when there is one rather than looking it up again.
   */
  resolveValue: () => Promise<GeoapifyResult | null>
  /**
   * The visitor's detected location (the ZIP ZipAutoDetect stored in
   * userZipCode), as a place to select. Never a permission prompt. The saved
   * location is reused when the detected ZIP is the saved one; any other ZIP is
   * resolved afresh, so a detected ZIP is never paired with another ZIP's city
   * and depot. The box shows the detected ZIP while it resolves.
   */
  locateMe: () => Promise<LocateOutcome>
}

/**
 * Everything a ZIP box needs, so no box re-implements it: built on
 * useGeoapify, it also owns the box's value.
 *
 * - **Starts from what we know**: the page's ZIP, else the visitor's saved
 *   location ("Atlanta, GA 30303"), else the detected ZIP. It follows a change
 *   made elsewhere (another box, another tab) until the visitor types here.
 * - **Suggestions only for typed text**: the prefill is not a query, so it
 *   costs no lookup on page load, and it never auto-selects the location the
 *   visitor already has.
 * - **"Use my current location"** and **submit without a pick** behave the
 *   same in every box (locateMe, resolveValue).
 *
 * The component keeps its own UI and its own "what happens after a pick":
 * call selectResult (or its handler that does) with what these return, then
 * showResult.
 */
export function useZipLookup({ initialZip = '', ...options }: UseZipLookupOptions = {}): UseZipLookupReturn {
  const stored = useStoredZip()
  const [value, setValueState] = useState(initialZip)
  const [edited, setEdited] = useState(false)
  const [locating, setLocating] = useState(false)

  // A new ZIP from the page (the URL changed: a navigation, back/forward) is
  // the box's new starting point, even after the visitor typed.
  const [prevInitialZip, setPrevInitialZip] = useState(initialZip)
  if (prevInitialZip !== initialZip) {
    setPrevInitialZip(initialZip)
    setEdited(false)
  }

  // Storage is client-only, so the prefill lands after hydration.
  useEffect(() => {
    if (!stored.resolved || edited) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mirrors client-only storage into the box
    setValueState(zipPrefill(initialZip, stored, readDetectedZip()))
  }, [stored, edited, initialZip])

  const geo = useGeoapify(edited ? value : '', options)

  async function resolveValue(): Promise<GeoapifyResult | null> {
    const typed = value.trim()
    if (edited) return typed ? geo.resolveTyped(typed) : null
    if (!initialZip || initialZip === stored.postcode) {
      const saved = savedLocationResult(stored)
      if (saved) return saved
    }
    const source = initialZip || stored.postcode || readDetectedZip()
    return source ? geo.resolveTyped(source) : null
  }

  async function locateMe(): Promise<LocateOutcome> {
    const detected = readDetectedZip()
    if (!detected) return { result: null, reason: 'unknown' }
    if (detected === stored.postcode) {
      const saved = savedLocationResult(stored)
      if (saved) return { result: saved }
    }
    setValueState(detected)
    setLocating(true)
    try {
      const result = await geo.resolveTyped(detected)
      return result ? { result } : { result: null, reason: 'not-found' }
    } finally {
      setLocating(false)
    }
  }

  return {
    ...geo,
    value,
    setValue: (next: string) => {
      setValueState(next)
      setEdited(true)
    },
    showResult: (result: GeoapifyResult) => setValueState(result.formatted),
    edited,
    locating,
    resolveValue,
    locateMe,
  }
}
