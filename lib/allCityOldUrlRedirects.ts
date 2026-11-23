import { STORE_KEY } from '@/config/store'
import { ALL_CITY_OLD_URLS_DEFAULT } from '@/lib/data/allCityOldUrls'
import { conformAllCityOldUrls, normalizeOldUrl } from '@/lib/allCityOldUrls'
import { getRedisClient } from '@/lib/redis'

/**
 * The published old-URL redirects, for the proxy: is this path an old URL
 * that now lives at an /all-city/ page?
 *
 * The record is the admin's published list (`oss-next:<store>:allcity:redirects`,
 * the same `{ data, updatedAt, updatedBy }` envelope as the other /all-city/
 * records, written by services/allCity.service.ts). With no record, the
 * default list in lib/data/allCityOldUrls.ts applies.
 *
 * Read as lib/maintenance.ts reads its flag: cached in module scope for
 * TTL_MS, so at most one Redis read a minute per proxy instance. A publish
 * reaches this instance at once (it drops the cache) and the others within
 * the TTL. If Redis fails, the last list read (else the default) stays.
 */
export const ALL_CITY_OLD_URLS_KEY = ['oss-next', STORE_KEY, 'allcity', 'redirects'].join(':')

const TTL_MS = 60_000

type Table = { map: Map<string, string>; at: number }
let cache: Table | null = null
let inflight: Promise<Table> | null = null

const toMap = (rows: readonly { from: string; to: string }[]) => new Map(rows.map((row) => [row.from, row.to]))
const DEFAULT_MAP = toMap(ALL_CITY_OLD_URLS_DEFAULT)

async function load(now: number): Promise<Table> {
  try {
    const raw = await getRedisClient().get<unknown>(ALL_CITY_OLD_URLS_KEY)
    if (raw === null || raw === undefined) return { map: DEFAULT_MAP, at: now }
    const data = typeof raw === 'object' && raw && 'data' in raw ? (raw as { data: unknown }).data : raw
    const rows = conformAllCityOldUrls(data)
    return { map: rows ? toMap(rows) : (cache?.map ?? DEFAULT_MAP), at: now }
  } catch (error) {
    console.error('[all-city] old-URL redirects: read failed, keeping the last list', error)
    return { map: cache?.map ?? DEFAULT_MAP, at: now }
  }
}

/** The /all-city/ slug an old path redirects to, or null. Never throws. */
export async function allCityOldUrlTarget(pathname: string, now: number = Date.now()): Promise<string | null> {
  const from = normalizeOldUrl(pathname)
  if (!from) return null
  if (!cache || now - cache.at >= TTL_MS) {
    inflight ??= load(now).finally(() => {
      inflight = null
    })
    cache = await inflight
  }
  return cache.map.get(from) ?? null
}

/** After a publish: this instance reads the list again on its next request. */
export function forgetAllCityOldUrls(): void {
  cache = null
}
