import { ROUTES } from '@/config/routes'
import type { GeoapifyResult } from '@/hooks/useGeoapify'

/**
 * Pure rules behind every ZIP box (useZipLookup in hooks/useGeoapify.ts):
 * what the box starts with, and how the visitor's saved location becomes a
 * result that can be selected like a looked-up one.
 */

/** Where ZipAutoDetect caches the ZIP it found from the browser's location. */
export const DETECTED_ZIP_KEY = 'userZipCode'

/** The visitor's saved location (zipcode / zipcode_label / zipcode_depot). */
export type SavedLocation = { postcode: string; label: string; depot: string }

/** The ZIP the geolocation detector stored, or '' (none, or storage blocked). */
export function readDetectedZip(): string {
  try {
    return localStorage.getItem(DETECTED_ZIP_KEY)?.trim() ?? ''
  } catch {
    return ''
  }
}

/**
 * What a ZIP box shows before anyone types.
 *
 * A ZIP the page already has (the URL's ?zipcode=) wins; it is shown as the
 * saved label when it is the saved ZIP ("Atlanta, GA 30303" rather than
 * "30303"). Without one: the saved location's label, then its bare ZIP, then
 * the ZIP the geolocation detector found.
 */
export function zipPrefill(initialZip: string, saved: SavedLocation, detected: string): string {
  if (initialZip) return saved.postcode === initialZip && saved.label ? saved.label : initialZip
  return saved.label || saved.postcode || detected
}

/**
 * The saved location as a selectable result, so using it needs no lookup: its
 * ZIP, label and nearest depot are all already known. Null when any of those
 * is missing (then the ZIP has to be resolved afresh).
 */
export function savedLocationResult(saved: SavedLocation): GeoapifyResult | null {
  if (!saved.postcode || !saved.depot) return null
  const params = new URLSearchParams({ zipcode: saved.postcode, location: saved.depot })
  const formatted = saved.label || saved.postcode
  return {
    placeId: `saved:${saved.postcode}`,
    formatted,
    formatted2: formatted,
    city: '',
    state: '',
    stateCode: '',
    postcode: saved.postcode,
    country: '',
    countryCode: '',
    lat: 0,
    lon: 0,
    nearestLocation: saved.depot,
    galleryRedirect: `${ROUTES.PLP}?${params}`,
  }
}
