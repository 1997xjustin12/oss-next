import { DEPOT_COORDINATES } from '@/config/depotCoordinates'

/**
 * Nearest-depot lookup that is safe to import from Client Components.
 *
 * It reads the generated coordinate table rather than config/locations.ts,
 * whose full depot records would otherwise ship to the browser. Server code
 * that needs more than the title keeps using lib/locations.ts.
 */

/** Haversine distance between two lat/lon points in kilometres. */
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * Nearest active depot to a point, with the distance.
 *
 * The agent availability endpoint has to tell a caller *how far away* the depot
 * is — "we deliver there" is a different answer at 40km and at 900km — so this
 * returns both.
 */
export function findNearestLocation(
  lat: number,
  lon: number,
): { title: string; distanceKm: number } | null {
  let nearest: { title: string; distanceKm: number } | null = null

  for (const [title, latitude, longitude] of DEPOT_COORDINATES) {
    const distanceKm = haversineKm(lat, lon, latitude, longitude)
    if (!nearest || distanceKm < nearest.distanceKm) {
      nearest = { title, distanceKm }
    }
  }

  return nearest
}

/** The `title` of the nearest active depot, or `null` if there are none. */
export function getNearestLocation(lat: number, lon: number): string | null {
  return findNearestLocation(lat, lon)?.title ?? null
}
