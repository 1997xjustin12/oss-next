'use client'

import { useState, useEffect, useRef } from 'react'

const GEOAPIFY_URL = 'https://api.geoapify.com/v1/geocode/autocomplete'
const GEOAPIFY_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ?? ''

export interface GeoapifyResult {
  placeId: string
  formatted: string
  city: string
  state: string
  stateCode: string
  postcode: string
  country: string
  countryCode: string
  lat: number
  lon: number
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
}

function parseFeature(feature: unknown): GeoapifyResult {
  const p = (feature as { properties: Record<string, unknown> }).properties
  return {
    placeId:     String(p.place_id     ?? ''),
    formatted:   String(p.formatted    ?? ''),
    city:        String(p.city         ?? ''),
    state:       String(p.state        ?? ''),
    stateCode:   String(p.state_code   ?? ''),
    postcode:    String(p.postcode     ?? ''),
    country:     String(p.country      ?? ''),
    countryCode: String(p.country_code ?? ''),
    lat:         Number(p.lat          ?? 0),
    lon:         Number(p.lon          ?? 0),
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

      try {
        const params = new URLSearchParams({
          text:   trimmed,
          apiKey: GEOAPIFY_KEY,
          limit:  String(limit),
          type,
          filter: `countrycode:${countries}`,
        })

        const res = await fetch(`${GEOAPIFY_URL}?${params}`, {
          signal: abortRef.current.signal,
        })

        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const json = (await res.json()) as { features?: unknown[] }
        setResults((json.features ?? []).map(parseFeature))
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
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

  return { results, loading, error, clear }
}
