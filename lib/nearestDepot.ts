import { DEFAULT_LOCATION } from '@/lib/constants'
import type { Depot } from '@/types/depot'

/**
 * Which depot serves a point: the rules, pure (no I/O). The depot list and the
 * virtual-depot switch come from services/depot.service.ts (resolveNearestDepot),
 * which every caller goes through: the ZIP lookup (/api/geoapify), "use my
 * current location" and the product page (/api/depots/nearest), and the agent
 * API and MCP tool.
 */

/** A depot that can be the answer: its title (the listing's `location`), position and country ('us', 'ca'). */
export type DepotPoint = { title: string; latitude: number; longitude: number; country: string }

/** The backend writes the country out ("United States", "Canada"). */
const COUNTRY_CODES: Record<string, string> = { 'united states': 'us', usa: 'us', us: 'us', canada: 'ca', ca: 'ca' }

/** A country name or code as a lowercase code ('us', 'ca'), or '' when unknown. */
export function countryCode(country: string | null | undefined): string {
  const key = (country ?? '').trim().toLowerCase()
  return COUNTRY_CODES[key] ?? (/^[a-z]{2}$/.test(key) ? key : '')
}

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
 * The depots a point may resolve to.
 *
 * - Never "Various North America" (DEFAULT_LOCATION): it holds the generic
 *   products shown before a visitor gives a ZIP, and is never a visitor's depot,
 *   never shown, and never put in a link.
 * - Never a depot without a real position (missing, or 0, 0).
 * - Virtual depots (a service area served from a main one) only when the admin
 *   switch allows them (lib/virtualDepots.ts, off by default).
 */
export function depotCandidates(depots: readonly Depot[], includeVirtual: boolean): DepotPoint[] {
  return depots
    .filter((d) => d.title && d.title !== DEFAULT_LOCATION)
    .filter((d) => includeVirtual || d.type !== 'virtual')
    .filter((d) => Number.isFinite(d.latitude) && Number.isFinite(d.longitude) && !(d.latitude === 0 && d.longitude === 0))
    .map((d) => ({ title: d.title, latitude: d.latitude, longitude: d.longitude, country: countryCode(d.country) }))
}

/**
 * The nearest candidate to a point by straight-line (haversine) distance, or
 * null when there are none.
 *
 * With the visitor's country, only depots in that country count, so a Canadian
 * ZIP is never sent across the border (Winnipeg went to Minneapolis). A country
 * with no depot, or an unknown one, falls back to every candidate.
 */
export function findNearestDepot(
  lat: number,
  lon: number,
  candidates: readonly DepotPoint[],
  country?: string | null,
): { title: string; distanceKm: number } | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null
  const code = countryCode(country)
  const local = code ? candidates.filter((d) => d.country === code) : []
  let nearest: { title: string; distanceKm: number } | null = null
  for (const depot of local.length ? local : candidates) {
    const distanceKm = haversineKm(lat, lon, depot.latitude, depot.longitude)
    if (!nearest || distanceKm < nearest.distanceKm) nearest = { title: depot.title, distanceKm }
  }
  return nearest
}
