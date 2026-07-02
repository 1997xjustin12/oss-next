'use client'

import { useState, useEffect, useRef } from 'react'
import { getNearestLocation } from '@/lib/locations'
import { BASE_URL } from '@/lib/helpers'
import { enrichSaleLinks } from '@/lib/linkEnrich'
import { DEFAULT_LOCATION } from '@/lib/constants'
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
  selectResult: (result: GeoapifyResult) => void
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
  const formatted = String(`${p.city}, ${p.state_code} ${postcode}`)
  const formatted2 = String(`${p.city}, ${p.state_code} ${postcode}, ${p.country}`)
  if (nearestLocation) redirectParams.set('location', nearestLocation)

  return {
    placeId:         String(p.place_id     ?? ''),
    formatted,
    formatted2,
    city:            String(p.city         ?? ''),
    state:           String(p.state        ?? ''),
    stateCode:       String(p.state_code   ?? ''),
    postcode,
    country:         String(p.country      ?? ''),
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

  function selectResult(result: GeoapifyResult) {
    localStorage.setItem('zipcode',          result.postcode)
    localStorage.setItem('zipcode_label',    result.formatted)
    localStorage.setItem('zipcode_depot',    result.nearestLocation ?? '')
    localStorage.setItem('gallery_redirect', result.galleryRedirect)
    enrichSaleLinks()
    clear()

    if (result.nearestLocation) {
      void fetchDepotContainers(result.nearestLocation, 'select')
    }
  }

  return {
    results,
    loading,
    error,
    clear,
    selectResult,
    depotContainers,
    depotContainersLoading,
    depotContainersError,
  }
}
