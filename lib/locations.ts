import { LOCATIONS } from '@/config/locations'
import { SITE } from '@/config/site'
import type { Location, LocationCustom, OpenHours } from '@/types/location'
import type { LocalBusinessInput } from '@/lib/schema'

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
 * Nearest active location to a point, with the distance.
 *
 * `getNearestLocation` below returns only the title, which is all the existing
 * client flow needs. The agent availability endpoint has to tell a caller *how
 * far away* the depot is — "we deliver there" is a different answer at 40km and
 * at 900km — so this returns both.
 */
export function findNearestLocation(
  lat: number,
  lon: number,
): { title: string; distanceKm: number } | null {
  let nearest: { title: string; distanceKm: number } | null = null

  for (const loc of LOCATIONS) {
    if (loc.is_disabled !== '0') continue
    const latitude = Number(loc.lat)
    const longitude = Number(loc.lng)
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue

    const distanceKm = haversineKm(lat, lon, latitude, longitude)
    if (!nearest || distanceKm < nearest.distanceKm) {
      nearest = { title: loc.title, distanceKm }
    }
  }

  return nearest
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

// ─── Depot pages → LocalBusiness ─────────────────────────────────────────────

/**
 * Normalise a path or absolute URL to a comparable key: lowercase pathname,
 * no trailing slash. Location records store `local_specials` inconsistently —
 * most are `/locations/atlanta-ga/`, but some are absolute URLs against an old
 * staging host (`https://onsitestorage.freshy.dev/locations/baltimore-md/`).
 * Comparing pathnames sidesteps that entirely.
 */
function pathKey(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  const withoutOrigin = trimmed.replace(/^https?:\/\/[^/]+/i, '')
  return `/${withoutOrigin.replace(/^\/+|\/+$/g, '').toLowerCase()}`
}

function parseJsonField<T>(raw: string | undefined | null): T | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

/**
 * The second family of depot pages. WordPress serves each city under two
 * URLs — `/locations/atlanta-ga` and
 * `/where-to-buy-shipping-containers/atlanta-ga` — with the same city-state
 * slug as the leaf. Only the second family appears in the backend's page
 * sitemap, so matching just `local_specials` would leave the 58 pages a
 * crawler is most likely to reach with no depot markup at all.
 *
 * Exact leaf match only, deliberately: stale variants like `baltimore-md-2`
 * and `baltimore-md-old` exist and must not inherit the live depot's details.
 */
export const WHERE_TO_BUY_PREFIX = '/where-to-buy-shipping-containers'

/**
 * Where "Locations" in the site chrome should point.
 *
 * Named rather than inlined because the obvious `/locations` is wrong — it
 * serves a Not Found page — and a bare string in a component would invite
 * someone to "fix" it back. Not in config/routes.ts: that file deliberately
 * covers only routes this app owns, and this one is WordPress's.
 */
export const DEPOT_INDEX_PATH = WHERE_TO_BUY_PREFIX

/**
 * One real depot, and the cities it covers.
 *
 * The 140 active records are NOT 140 pages. 96 of them are *virtual* depots —
 * a service area with no yard of its own, whose `local_specials` points at its
 * parent's page. Atlanta's page alone is the target of eight records. Treating
 * every record as its own page produced a list where "Albany, GA" and
 * "Alpharetta, GA" both linked to the Atlanta page under their own names, which
 * misrepresents both the depot network and where a customer is actually served
 * from.
 *
 * So: group by page, keep the real depot (`id === main_depo_id`) as the
 * record, and keep the virtual entries' city names as the service area — which
 * is what they actually are, and the most useful thing on the page for anyone
 * asking "do you deliver near me".
 */
export type Depot = {
  location: Location
  /** Site-relative path of the depot's own page. */
  path: string
  /** Cities served, including the depot's own. */
  citiesServed: string[]
}

export const DEPOTS: readonly Depot[] = (() => {
  const groups = new Map<string, { records: Location[] }>()

  for (const location of LOCATIONS) {
    if (location.is_disabled !== '0') continue
    const custom = parseJsonField<LocationCustom>(location.custom)
    const key = pathKey(custom?.local_specials ?? '')
    if (!key || key === '/') continue

    const group = groups.get(key) ?? { records: [] }
    group.records.push(location)
    groups.set(key, group)
  }

  const depots: Depot[] = []
  for (const [path, { records }] of groups) {
    // The real depot identifies itself by pointing main_depo_id at its own id.
    // Falling back to the first record keeps a group with no self-reference
    // from being dropped entirely.
    const primary =
      records.find((record) => {
        const custom = parseJsonField<LocationCustom>(record.custom)
        return custom?.main_depo_id === record.id
      }) ?? records[0]

    depots.push({
      location: primary,
      path,
      citiesServed: [...new Set(records.map((record) => record.title))].sort(),
    })
  }

  return depots.sort((a, b) => a.location.title.localeCompare(b.location.title))
})()

/** Both URL families for a depot page → the depot. */
const DEPOT_BY_PATH: ReadonlyMap<string, Depot> = (() => {
  const map = new Map<string, Depot>()
  for (const depot of DEPOTS) {
    map.set(depot.path, depot)
    const leaf = depot.path.split('/').filter(Boolean).pop()
    if (leaf) map.set(`${WHERE_TO_BUY_PREFIX}/${leaf}`, depot)
  }
  return map
})()

export function findDepotByPath(path: string): Depot | undefined {
  return DEPOT_BY_PATH.get(pathKey(path))
}

/**
 * The depot's real, live page path.
 *
 * NOT `depot.path` — that comes from the records' `local_specials` field, which
 * points at `/locations/<city-state>`, a family that does not exist on this
 * site. Only `/where-to-buy-shipping-containers/<city-state>` is real. Callers
 * that link to a depot must use this and check it against the live page list;
 * `depot.path` remains the matching key for the catch-all, which is happy to
 * recognise either family if the /locations pages are ever restored.
 */
export function depotPagePath(depot: Depot): string | null {
  const leaf = depot.path.split('/').filter(Boolean).pop()
  return leaf ? `${WHERE_TO_BUY_PREFIX}/${leaf}` : null
}

const DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
const DAY_LABEL: Record<(typeof DAY_ORDER)[number], string> = {
  mon: 'Mo', tue: 'Tu', wed: 'We', thu: 'Th', fri: 'Fr', sat: 'Sa', sun: 'Su',
}

/** "06:00 AM - 05:00 PM" -> "06:00-17:00". Returns null if unparseable. */
function to24Hour(range: string): string | null {
  const match = range.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*[-–]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (!match) return null

  const convert = (hour: string, minute: string, meridiem: string): string => {
    let h = Number(hour) % 12
    if (meridiem.toUpperCase() === 'PM') h += 12
    return `${String(h).padStart(2, '0')}:${minute}`
  }

  return `${convert(match[1], match[2], match[3])}-${convert(match[4], match[5], match[6])}`
}

/**
 * `open_hours` JSON -> schema.org `openingHours` strings, collapsing runs of
 * consecutive days that share the same hours: seven identical entries become
 * one `Mo-Su 06:00-17:00` rather than seven lines saying the same thing.
 */
export function toOpeningHours(rawOpenHours: string): string[] {
  const hours = parseJsonField<OpenHours>(rawOpenHours)
  if (!hours) return []

  const perDay = DAY_ORDER.map((day) => to24Hour(hours[day]?.[0] ?? ''))

  const out: string[] = []
  let runStart = 0
  for (let i = 0; i <= DAY_ORDER.length; i++) {
    const current = i < DAY_ORDER.length ? perDay[i] : null
    if (i > 0 && current === perDay[runStart]) continue

    const value = perDay[runStart]
    if (value) {
      const from = DAY_LABEL[DAY_ORDER[runStart]]
      const to = DAY_LABEL[DAY_ORDER[i - 1]]
      out.push(`${from === to ? from : `${from}-${to}`} ${value}`)
    }
    runStart = i
  }

  return out
}

const CANADIAN_PROVINCES = new Set([
  'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT',
])

/** Depot names read as branches of the parent company, not separate firms. */
const DEPOT_NAME_PREFIX = `${SITE.name} —`

/**
 * Depot -> the input localBusinessNode() wants.
 *
 * `path` is passed rather than taken from the depot because a depot has two
 * live URLs; the node's `@id` and `url` must be the one actually being rendered.
 */
export function toLocalBusinessInput(depot: Depot, path: string): LocalBusinessInput {
  const { location } = depot
  return {
    name: `${DEPOT_NAME_PREFIX} ${location.title}`,
    path,
    city: location.city,
    state: location.state,
    postalCode: location.postal_code,
    country: CANADIAN_PROVINCES.has(location.state.toUpperCase()) ? 'CA' : 'US',
    ...(location.street ? { street: location.street } : {}),
    ...(location.phone ? { telephone: location.phone } : {}),
    ...(location.email ? { email: location.email } : {}),
    ...(location.lat && location.lng ? { latitude: location.lat, longitude: location.lng } : {}),
    openingHours: toOpeningHours(location.open_hours),
    citiesServed: depot.citiesServed,
  }
}

