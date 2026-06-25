'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { getNearestLocation } from '@/lib/locations'

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse'

// Pages where the geolocation prompt should NOT fire
export const ZIP_AUTODETECT_EXCLUDED_PATHS = [
  '/checkout',
  '/cart',
  '/account',
]

type Props = {
  excludePaths?: string[]
}

export function ZipAutoDetect({ excludePaths = ZIP_AUTODETECT_EXCLUDED_PATHS }: Props) {
  const pathname = usePathname()

  useEffect(() => {
    // Skip on excluded pages
    if (excludePaths.some((p) => pathname.startsWith(p))) return

    // Skip if already stored — don't prompt on every visit
    if (localStorage.getItem('userZipCode')) return

    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          // eslint-disable-next-line no-console
          if (process.env.NODE_ENV === 'development') console.log('[ZipAutoDetect] coords', coords)
          const { latitude, longitude } = coords
          const params = new URLSearchParams({
            format: 'json',
            lat: String(latitude),
            lon: String(longitude),
          })
          const res = await fetch(`${NOMINATIM_URL}?${params}`, {
            headers: { 'Accept-Language': 'en-US,en;q=0.9' },
          })
          if (!res.ok) return

          const data = (await res.json()) as {
            address?: {
              postcode?: string
              city?: string
              town?: string
              village?: string
              state?: string
            }
          }

          const postcode = data.address?.postcode
          if (!postcode) return

          const city  = data.address?.city ?? data.address?.town ?? data.address?.village ?? ''
          const state = data.address?.state ?? ''
          const label = [city, state, postcode].filter(Boolean).join(', ')
          const depot = getNearestLocation(latitude, longitude) ?? ''

          localStorage.setItem('userZipCode',   postcode)
          localStorage.setItem('zipcode',       postcode)
          localStorage.setItem('zipcode_label', label)
          localStorage.setItem('zipcode_depot', depot)
        } catch {
          // silently fail — geolocation is best-effort
        }
      },
      (err) => {
        if (process.env.NODE_ENV === 'development') console.warn('[ZipAutoDetect] geolocation error', err.code, err.message)
      },
      { timeout: 10_000 },
    )
  // pathname is intentionally excluded — we only want this to run once on mount,
  // not re-run on every client navigation
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
