'use client'

import { useState, useEffect, useRef } from 'react'
import { saveVisitorZip } from '@/lib/visitorZip'
import { getNearestLocation } from '@/lib/locations'
import { BASE_URL } from '@/lib/helpers'
import { enrichSaleLinks } from '@/lib/linkEnrich'
import { DEFAULT_LOCATION } from '@/lib/constants'
import { useCart } from '@/hooks/useCart'
import { findLocationConflict, requestCartLocationConflict } from '@/lib/cart'
import type { FormattedContainerHit } from '@/types/product'
export type { ShippingContainerHit, FormattedContainerHit } from '@/types/product'

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

interface UseGeoapifyOptions {
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
}

interface UseGeoapifyReturn {
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
    galleryRedirect: `${BASE_URL}/sale-shipping-containers/?${redirectParams}`,
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
      setResults([])
      setLoading(false)
      return
    }

    const timer = setTimeout(async () => {
      abortRef.current?.abort()
      abortRef.current = new AbortController()

      setLoading(true)
      setError(null)

      console.log('[useGeoapify] query effect triggered — query:', trimmed)

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
        console.log('[useGeoapify] query results — query:', trimmed, 'results:', parsed)
        setResults(parsed)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
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
    console.log(`[useGeoapify] fetchDepotContainers triggered (${source}) — location:`, location)

    setDepotContainersLoading(true)
    setDepotContainersError(null)

    try {
      const params = new URLSearchParams({ location })
      const res = await fetch(`/api/shipping-containers/by-location?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const json = (await res.json()) as { data?: FormattedContainerHit[] }
      console.log(`[useGeoapify] depotContainers (${source}) — location:`, location, 'data:', json.data ?? [])
      setDepotContainers(json.data ?? [])
    } catch (err) {
      console.error(`[useGeoapify] fetchDepotContainers error (${source}) — location:`, location, err)
      setDepotContainersError('Could not fetch containers for this location.')
      setDepotContainers([])
    } finally {
      setDepotContainersLoading(false)
    }
  }

  // Initial load: use the previously-selected depot if one is stored, otherwise
  // fall back to the default location so there's always something to show.
  useEffect(() => {
    const storedDepot = localStorage.getItem('zipcode_depot')
    void fetchDepotContainers(storedDepot || DEFAULT_LOCATION, 'init')
  }, [])

  /** Exact postcode match, else the only result, else nothing. */
  function pickTyped(candidates: GeoapifyResult[], text: string): GeoapifyResult | null {
    const norm = (value: string) => value.toUpperCase().replace(/s+/g, '')
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
    const norm = (value: string) => value.toUpperCase().replace(/s+/g, '')
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

    if (result.nearestLocation) {
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
