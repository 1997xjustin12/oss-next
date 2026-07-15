// api.zippopotam.us is a free, public ZIP/postcode lookup — called directly
// from the client (per the API integration plan, this one isn't proxied
// through our own backend). Distinct from useGeoapify.ts/DeliveryZipCheck.tsx,
// which finds the nearest depot for a given ZIP — this one only autofills an
// address form's city/state.
const COUNTRY_ISO2: Record<string, string> = {
  'United States (US)': 'us',
  'Canada (CA)': 'ca',
}

export type ZipLookupResult = {
  city: string
  state: string
}

export async function lookupZip(zip: string, country: string): Promise<ZipLookupResult | null> {
  const iso2 = COUNTRY_ISO2[country]
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
