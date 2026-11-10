import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_TAGS } from '@/config/cache'
import { GTM_ENVIRONMENT } from '@/config/googleTag'
import { RATE_LIMIT_BUCKETS } from '@/config/rateLimits'
import { STORE_KEY } from '@/config/store'
import { getRedisClient } from '@/lib/redis'
import {
  HOME_VARIANTS,
  RETENTION_DAYS,
  addHeatHash,
  addStatsHash,
  emptyTotals,
  reportIncrements,
  type Device,
  type HomeAbReport,
  type HomeAbTotals,
  type HomeVariant,
} from '@/lib/homeAb'

/**
 * Redis for the homepage A/B analytics (lib/homeAb.ts). Keys, per store:
 *
 *   oss-next:<store>:homeab:<yyyy-mm-dd>:<v>          hash         views, engaged, s25…, clicks, c:…, f:…
 *   oss-next:<store>:homeab:uv:<yyyy-mm-dd>:<v>       HyperLogLog  visitor ids (≤ 12 KB, any traffic)
 *   oss-next:<store>:homeab:heat:<yyyy-mm-dd>:<v>:<d> hash         section:x:y -> clicks
 *
 * all expiring RETENTION_DAYS after the day's first write.
 *
 * A report is ONE request: a Lua script checks the sender's rate limit and
 * applies every increment, so the limit costs no extra round trip and a
 * rejected report writes nothing.
 */

const RETENTION_SECONDS = RETENTION_DAYS * 24 * 60 * 60
const prefix = `oss-next:${STORE_KEY}:homeab`

export const homeAbKeys = {
  stats: (day: string, v: HomeVariant) => `${prefix}:${day}:${v}`,
  visitors: (day: string, v: HomeVariant) => `${prefix}:uv:${day}:${v}`,
  heat: (day: string, v: HomeVariant, d: Device) => `${prefix}:heat:${day}:${v}:${d}`,
}

export const dayKey = (date: Date) => date.toISOString().slice(0, 10)

/**
 * Only the live site's traffic counts. Staging, previews and a dev box share
 * this Redis and would otherwise mix test visits into the numbers (and React's
 * development double-mount would count each view twice). HOME_AB_RECORD=1
 * records anyway, for checking the pipeline.
 */
export function homeAbRecording(): boolean {
  return GTM_ENVIRONMENT === 'live' || process.env.HOME_AB_RECORD === '1'
}

// KEYS: rate-limit counter, stats hash, visitors HLL, heat hash.
// ARGV: limit, ttl, visitor id ('' for none), stats pair count, heat pair count, then the pairs.
const RECORD = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('EXPIRE', KEYS[1], 120) end
if count > tonumber(ARGV[1]) then return 0 end
local ttl = ARGV[2]
local i = 6
local stats = tonumber(ARGV[4])
for _ = 1, stats do redis.call('HINCRBY', KEYS[2], ARGV[i], ARGV[i + 1]); i = i + 2 end
if stats > 0 then redis.call('EXPIRE', KEYS[2], ttl, 'NX') end
local heat = tonumber(ARGV[5])
for _ = 1, heat do redis.call('HINCRBY', KEYS[4], ARGV[i], ARGV[i + 1]); i = i + 2 end
if heat > 0 then redis.call('EXPIRE', KEYS[4], ttl, 'NX') end
if ARGV[3] ~= '' then
  redis.call('PFADD', KEYS[3], ARGV[3])
  redis.call('EXPIRE', KEYS[3], ttl, 'NX')
end
return 1
`

/** Store one report. 'limited' when the sender is over its budget; throws if Redis fails. */
export async function recordHomeAbReport(report: HomeAbReport, sender: string, now = new Date()): Promise<'ok' | 'limited'> {
  const day = dayKey(now)
  const { stats, heat } = reportIncrements(report)
  const minute = Math.floor(now.getTime() / 60_000)
  const keys = [
    `oss-next:${STORE_KEY}:ratelimit:beacon:${sender}:${minute}`,
    homeAbKeys.stats(day, report.v),
    homeAbKeys.visitors(day, report.v),
    homeAbKeys.heat(day, report.v, report.d),
  ]
  // The visitor is only counted with the view, not again on later reports.
  const visitor = report.n && report.id ? report.id : ''
  const args = [
    String(RATE_LIMIT_BUCKETS.beacon),
    String(RETENTION_SECONDS),
    visitor,
    String(stats.size),
    String(heat.size),
    ...[...stats].flatMap(([field, n]) => [field, String(n)]),
    ...[...heat].flatMap(([field, n]) => [field, String(n)]),
  ]
  const result = await getRedisClient().eval<string[], number>(RECORD, keys, args)
  return result === 1 ? 'ok' : 'limited'
}

// ─── Reading, for /admin/home-ab ─────────────────────────────────────────────

/**
 * A finished day never changes, so it is cached for a week; today is refreshed
 * every few minutes. Tagged so the admin Cache screen can drop them.
 */
function cacheDay(final: boolean) {
  cacheLife(final ? { stale: 3600, revalidate: 7 * 86400, expire: 7 * 86400 } : { stale: 60, revalidate: 300, expire: 300 })
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.HOME_AB)
}

/** One day's stats hashes, one per variant. Throws on a Redis failure, so an outage is never cached. */
async function readStatsDay(day: string, final: boolean): Promise<(Record<string, unknown> | null)[]> {
  'use cache: remote'
  cacheDay(final)
  const pipeline = getRedisClient().pipeline()
  for (const v of HOME_VARIANTS) pipeline.hgetall(homeAbKeys.stats(day, v))
  return pipeline.exec<(Record<string, unknown> | null)[]>()
}

async function readHeatDay(day: string, v: HomeVariant, d: Device, final: boolean): Promise<Record<string, unknown> | null> {
  'use cache: remote'
  cacheDay(final)
  return getRedisClient().hgetall<Record<string, unknown>>(homeAbKeys.heat(day, v, d))
}

/** Unique visitors per variant over the days: one PFCOUNT across the days' logs (a union, not a sum). */
async function readVisitors(days: string[]): Promise<number[]> {
  'use cache: remote'
  cacheLife({ stale: 60, revalidate: 300, expire: 300 })
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.HOME_AB)
  const pipeline = getRedisClient().pipeline()
  for (const v of HOME_VARIANTS) pipeline.pfcount(...(days.map((day) => homeAbKeys.visitors(day, v)) as [string, ...string[]]))
  return pipeline.exec<number[]>()
}

/** The last `count` days, today first. */
export function lastDays(count: number, now = new Date()): string[] {
  return Array.from({ length: count }, (_, i) => dayKey(new Date(now.getTime() - i * 86_400_000)))
}

export type HomeAbReportData = {
  totals: Record<HomeVariant, HomeAbTotals>
  /** False when Redis could not be read in full: the numbers are partial. */
  complete: boolean
}

/** Every variant's totals over the days (today first). */
export async function readHomeAbTotals(days: string[]): Promise<HomeAbReportData> {
  const totals = Object.fromEntries(HOME_VARIANTS.map((v) => [v, emptyTotals()])) as Record<HomeVariant, HomeAbTotals>
  let complete = true
  const results = await Promise.allSettled(days.map((day, i) => readStatsDay(day, i > 0)))
  for (const result of results) {
    if (result.status === 'rejected') {
      complete = false
      continue
    }
    HOME_VARIANTS.forEach((v, i) => addStatsHash(totals[v], result.value[i]))
  }
  try {
    const visitors = await readVisitors(days)
    HOME_VARIANTS.forEach((v, i) => (totals[v].visitors = Number(visitors[i]) || 0))
  } catch {
    complete = false
  }
  return { totals, complete }
}

/** One variant's click heatmap on one device over the days: `section:x:y` -> clicks. */
export async function readHomeAbHeat(days: string[], v: HomeVariant, d: Device): Promise<{ cells: Record<string, number>; complete: boolean }> {
  const cells: Record<string, number> = {}
  let complete = true
  const results = await Promise.allSettled(days.map((day, i) => readHeatDay(day, v, d, i > 0)))
  for (const result of results) {
    if (result.status === 'fulfilled') addHeatHash(cells, result.value)
    else complete = false
  }
  return { cells, complete }
}
