import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_TAGS } from '@/config/cache'
import { DEPOT_SNAPSHOT, DEPOT_SNAPSHOT_TAKEN_AT } from '@/config/depotCoordinates'
import { visitorAuthHeaders } from '@/lib/backendAuth'
import { depotCandidates, findNearestDepot } from '@/lib/nearestDepot'
import { virtualDepotsEnabled } from '@/lib/virtualDepots'
import type { Depot, DepotList } from '@/types/depot'

/**
 * The depots (stores), from the backend's `/api/depots/`.
 *
 * Read live and cached for hours, shared by every visitor (so sent with the
 * API key and no visitor address, `ip: null`, as review.service.ts does). When
 * the backend cannot be read, everything here answers from the copy in
 * config/depotCoordinates.ts, refreshed before every build; the failure is not
 * cached, so the live list returns as soon as the backend does.
 *
 * Served by /api/depots and /api/depots/[id], and the source of every
 * nearest-depot answer (resolveNearestDepot).
 */

const BACKEND = (process.env.NEXT_OSS_BACKEND_URL ?? '').replace(/\/+$/, '')
/** One page holds all 141 today; the loop follows `next` in case that grows. */
const PAGE_SIZE = 200
const MAX_PAGES = 10
const TIMEOUT_MS = 10_000

export type DepotSource = 'live' | 'snapshot'

async function backendGet(path: string): Promise<Response> {
  if (!BACKEND) throw new Error('NEXT_OSS_BACKEND_URL is not set')
  return fetch(path.startsWith('http') ? path : `${BACKEND}${path}`, {
    headers: { Accept: 'application/json', ...(await visitorAuthHeaders({ ip: null })) },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: 'no-store',
  })
}

/** The backend's list, every page. Throws on failure, so a failure is never cached. */
async function fetchDepotsLive(): Promise<Depot[]> {
  'use cache: remote'
  cacheLife('hours')
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.DEPOTS)

  const results: Depot[] = []
  let next: string | null = `/api/depots/?page_size=${PAGE_SIZE}`
  for (let page = 0; next && page < MAX_PAGES; page++) {
    const res = await backendGet(next)
    if (!res.ok) throw new Error(`depots list: HTTP ${res.status}`)
    const body = (await res.json()) as { next: string | null; results: Depot[] }
    if (!Array.isArray(body.results)) throw new Error('depots list: unexpected answer')
    results.push(...body.results)
    next = body.next
  }
  if (!results.length) throw new Error('depots list: empty')
  return results
}

/** One depot from the backend; null for a 404. Throws on any other failure. */
async function fetchDepotLive(id: number): Promise<Depot | null> {
  'use cache: remote'
  cacheLife('hours')
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.DEPOTS)

  const res = await backendGet(`/api/depots/${id}/`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`depot ${id}: HTTP ${res.status}`)
  return (await res.json()) as Depot
}

/** Every depot, main and virtual (and the "Various North America" placeholder), with where they came from. */
export async function getDepots(): Promise<{ depots: Depot[]; source: DepotSource }> {
  try {
    return { depots: await fetchDepotsLive(), source: 'live' }
  } catch (err) {
    console.error(`[depots] backend list unavailable, using the copy from ${DEPOT_SNAPSHOT_TAKEN_AT}:`, err)
    return { depots: [...DEPOT_SNAPSHOT], source: 'snapshot' }
  }
}

/** The list as /api/depots serves it: the backend's records, every page in one. */
export async function fetchDepots(): Promise<DepotList & { source: DepotSource }> {
  const { depots, source } = await getDepots()
  return { count: depots.length, results: depots, source }
}

/** One depot by its backend id, or null when there is none. */
export async function fetchDepotById(id: number): Promise<{ depot: Depot | null; source: DepotSource }> {
  try {
    return { depot: await fetchDepotLive(id), source: 'live' }
  } catch (err) {
    console.error(`[depots] backend depot ${id} unavailable, using the copy:`, err)
    return { depot: DEPOT_SNAPSHOT.find((d) => d.id === id) ?? null, source: 'snapshot' }
  }
}

/**
 * The depot that serves a point: the nearest by straight-line distance among
 * the candidates (lib/nearestDepot.ts: never "Various North America", virtual
 * depots only when the admin switch is on, and in the visitor's own country
 * when it is known). Null when there is no candidate.
 */
export async function resolveNearestDepot(
  lat: number,
  lon: number,
  country?: string | null,
): Promise<{ title: string; distanceKm: number } | null> {
  const [{ depots }, includeVirtual] = await Promise.all([getDepots(), virtualDepotsEnabled()])
  return findNearestDepot(lat, lon, depotCandidates(depots, includeVirtual), country)
}
