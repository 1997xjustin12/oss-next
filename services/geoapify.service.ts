import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_TAGS } from '@/config/cache'

const GEOAPIFY_URL = 'https://api.geoapify.com/v1/geocode/autocomplete'
const API_KEY = process.env.GEOAPIFY_API_KEY ?? process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ?? ''

export type GeoapifyAutocompleteParams = {
  text:   string
  limit:  string
  type:   string
  filter: string
}

export class GeoapifyUpstreamError extends Error {
  status: number
  constructor(status: number) {
    super(`Geoapify upstream error ${status}`)
    this.status = status
  }
}

// Address/postcode autocomplete results are effectively static reference data,
// so cache them fairly aggressively per unique query.
export async function cachedGeoapifyAutocomplete(
  params: GeoapifyAutocompleteParams,
): Promise<{ features?: unknown[] }> {
  'use cache'
  cacheLife('days')
  cacheTag(CACHE_TAGS.ALL)

  const query = new URLSearchParams({ ...params, apiKey: API_KEY })
  const upstream = await fetch(`${GEOAPIFY_URL}?${query}`, {
    signal: AbortSignal.timeout(5000),
  })

  if (!upstream.ok) {
    throw new GeoapifyUpstreamError(upstream.status)
  }

  return upstream.json()
}
