'use client'

import { useEffect, useRef } from 'react'
import { saveVisitorZip } from '@/lib/visitorZip'
import { useCart } from '@/hooks/useCart'
import { findLocationConflict } from '@/lib/cart'
import { usePathname } from 'next/navigation'
import { getNearestLocation } from '@/lib/locations'
import { ROUTES } from '@/config/routes'

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse'

// Pages where the geolocation prompt should NOT fire
export const ZIP_AUTODETECT_EXCLUDED_PATHS: string[] = [
  ROUTES.CHECKOUT,
  ROUTES.CART,
  ROUTES.ACCOUNT.ROOT,
]

type Props = {
  excludePaths?: string[]
}

export function ZipAutoDetect({ excludePaths = ZIP_AUTODETECT_EXCLUDED_PATHS }: Props) {
  const pathname = usePathname()

  // Through a ref: the lookup below resolves seconds after mount, and the cart
  // only hydrates from storage in an effect — a closure would see it empty.
  const { cart } = useCart()
  const cartRef = useRef(cart)
  useEffect(() => {
    cartRef.current = cart
  }, [cart])

  useEffect(() => {
    // Skip on excluded pages
    if (excludePaths.some((p) => pathname.startsWith(p))) return

    // Skip if already stored — don't prompt on every visit
    if (localStorage.getItem('userZipCode')) return

    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
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

          localStorage.setItem('userZipCode', postcode)

          // A container from another depot is already in the cart: keep the
          // location that cart was built for. No prompt — nobody asked for this
          // location, so refusing it quietly is the only honest outcome. The
          // detected ZIP is still remembered above for "use my location".
          if (findLocationConflict(cartRef.current, { isContainer: true, location: depot })) return
          // Through the single write so links update the moment this resolves —
          // it lands asynchronously after mount, and used to update nothing.
          // Not `explicit`: nobody chose this, so it must not overwrite a
          // `?zipcode=` on a link someone deliberately sent.
          saveVisitorZip({ postcode, label, depot }, { explicit: false })
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
