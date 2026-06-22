import { LOCATIONS } from '@/config/locations'

/** Haversine distance between two lat/lon points in kilometres */
function haversineKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * Returns the `title` of the nearest active location to the given coordinates,
 * or `null` if LOCATIONS is empty.
 */
export function getNearestLocation(lat: number, lon: number): string | null {
  let nearest: string | null = null
  let minDist = Infinity

  for (const loc of LOCATIONS) {
    if (loc.is_disabled !== '0') continue
    const dist = haversineKm(lat, lon, Number(loc.lat), Number(loc.lng))
    if (dist < minDist) {
      minDist = dist
      nearest = loc.title
    }
  }

  return nearest
}
