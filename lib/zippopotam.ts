// api.zippopotam.us is a free, public ZIP/postcode lookup — called directly
// from the client (per the API integration plan, this one isn't proxied
// through our own backend). Distinct from useGeoapify.ts/DeliveryZipCheck.tsx,
// which finds the nearest depot for a given ZIP — this one only autofills an
// address form's city/state.
import { toAlpha2 } from './country'

export type ZipLookupResult = {
  city: string
  state: string
}

/** Same lookup, plus the coordinates the response already carries. */
export type ZipGeoResult = ZipLookupResult & {
  latitude: number
  longitude: number
  countryCode: string
}

/**
 * ZIP/postcode -> city, state and coordinates.
 *
 * Server-side counterpart to the Geoapify autocomplete the PDP uses: an agent
 * hands us a bare ZIP with no session and no typing, so there is nothing to
 * autocomplete. zippopotam already returns lat/lon in the same response
 * `lookupZip` reads city/state from — this just stops throwing them away.
 *
 * US is tried first and Canada second, because the ZIP alone doesn't say which:
 * a 5-digit code is US, and an alphanumeric one is Canadian, but callers send
 * both formats loosely.
 */
export async function lookupZipGeo(zip: string): Promise<ZipGeoResult | null> {
  const clean = zip.trim().toUpperCase()
  if (!clean) return null

  // Canadian postal codes are looked up by their 3-character forward sortation
  // area, which is all zippopotam indexes for CA.
  const attempts: [string, string][] = /^\d{5}(-\d{4})?$/.test(clean)
    ? [['us', clean.slice(0, 5)]]
    : [
        ['ca', clean.replace(/\s+/g, '').slice(0, 3)],
        ['us', clean],
      ]

  for (const [country, code] of attempts) {
    try {
      const res = await fetch(`https://api.zippopotam.us/${country}/${encodeURIComponent(code)}`, {
        signal: AbortSignal.timeout(8_000),
      })
      if (!res.ok) continue

      const data = await res.json()
      const place = data?.places?.[0]
      const latitude = Number(place?.latitude)
      const longitude = Number(place?.longitude)
      if (!place || !Number.isFinite(latitude) || !Number.isFinite(longitude)) continue

      return {
        city: place['place name'] ?? '',
        state: place['state abbreviation'] ?? place['state'] ?? '',
        latitude,
        longitude,
        countryCode: country.toUpperCase(),
      }
    } catch {
      // Try the next country rather than failing the whole lookup.
    }
  }

  return null
}

export async function lookupZip(zip: string, country: string): Promise<ZipLookupResult | null> {
  const iso2 = toAlpha2(country)?.toLowerCase()
  if (!iso2 || !zip.trim()) return null

  try {
    const res = await fetch(`https://api.zippopotam.us/${iso2}/${encodeURIComponent(zip.trim())}`)
    if (!res.ok) return null

    const data = await res.json()
    const place = data?.places?.[0]
    if (!place) return null

    return {
      city: place['place name'] ?? '',
      state: place['state abbreviation'] ?? place['state'] ?? '',
    }
  } catch {
    return null
  }
}
