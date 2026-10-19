import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_TAGS } from '@/config/cache'
import { getRedisClient } from '@/lib/redis'
import { STORE_KEY } from '@/config/store'
import { identifyCrawler, type Crawler } from '@/config/crawlers'

/**
 * Per-day counters for AI crawler and agent traffic.
 *
 * The whole agentic-readiness programme is unmeasurable without this. Every
 * other task in it — llms.txt, the Markdown views, the structured data, the
 * agent API — is a guess about what agents want until you can see which ones
 * actually show up, what they ask for, and whether they get errors.
 *
 * ## Cost
 *
 * This runs in the proxy, on every matched request, so the design point is that
 * it costs *nothing* for human traffic: `identifyCrawler()` is a substring scan
 * over a 17-entry list, and a request that isn't a known agent returns before
 * touching Redis. Only identified agents pay a write, and they are a small
 * fraction of traffic — so the added latency lands on bots, never on customers.
 *
 * Failures are swallowed. Analytics must never be able to take the site down.
 *
 * Keys (namespaced per store, same convention as services/seo.service.ts):
 *
 *   oss-next:<store>:agents:<yyyy-mm-dd>          hash  agent            -> hits
 *   oss-next:<store>:agentpaths:<yyyy-mm-dd>      hash  agent\0path      -> hits
 *   oss-next:<store>:agentstatus:<yyyy-mm-dd>     hash  agent\0status    -> hits
 */

const KEY_PREFIX = 'oss-next'

/** Counters are kept for a quarter — long enough to see a trend, short enough
 *  that nobody has to think about the storage. */
const RETENTION_DAYS = 90
const RETENTION_SECONDS = RETENTION_DAYS * 24 * 60 * 60

/** Separator for composite hash fields. Not a character a UA or path contains. */
const SEP = '\u0000'

export function dayKey(now: Date): string {
  return now.toISOString().slice(0, 10)
}

function keys(day: string) {
  return {
    agents: `${KEY_PREFIX}:${STORE_KEY}:agents:${day}`,
    paths: `${KEY_PREFIX}:${STORE_KEY}:agentpaths:${day}`,
    statuses: `${KEY_PREFIX}:${STORE_KEY}:agentstatus:${day}`,
  }
}

/**
 * Record one agent request. Returns the matched crawler, or null if the
 * user-agent isn't one we track — callers can use that to skip further work.
 *
 * `path` is stored without its query string: the useful question is "which
 * pages do agents read", and keeping raw query strings would both explode the
 * cardinality and risk storing something personal.
 */
export async function recordAgentHit(
  userAgent: string | null | undefined,
  path: string,
  status: number,
  now: Date = new Date(),
): Promise<Crawler | null> {
  const crawler = identifyCrawler(userAgent)
  if (!crawler) return null

  const day = dayKey(now)
  const k = keys(day)
  const cleanPath = path.split('?')[0].slice(0, 200)

  try {
    // One pipelined request, not six: this runs on every crawler hit, and
    // Upstash charges per request. EXPIRE NX sets each key's TTL once, on the
    // day's first hit, instead of resending it every time.
    await getRedisClient()
      .pipeline()
      .hincrby(k.agents, crawler.userAgent, 1)
      .hincrby(k.paths, `${crawler.userAgent}${SEP}${cleanPath}`, 1)
      .hincrby(k.statuses, `${crawler.userAgent}${SEP}${status}`, 1)
      .expire(k.agents, RETENTION_SECONDS, 'NX')
      .expire(k.paths, RETENTION_SECONDS, 'NX')
      .expire(k.statuses, RETENTION_SECONDS, 'NX')
      .exec()
  } catch {
    // Redis unreachable, unconfigured, or rate-limited. A missing analytics
    // datapoint is not worth failing a request over.
  }

  return crawler
}

/**
 * Record one MCP tool call.
 *
 * The only feedback loop on whether the tool descriptions are any good. A tool
 * that is never called is either badly described or unnecessary; a tool with a
 * high error rate is one whose arguments the model can't get right from its
 * schema. Neither is visible without counting.
 *
 * Keys mirror the crawler counters, under `mcp:`:
 *
 *   oss-next:<store>:mcp:<yyyy-mm-dd>   hash  tool name        -> calls
 *   oss-next:<store>:mcperr:<yyyy-mm-dd> hash  tool name       -> errored calls
 */
export async function recordMcpToolCall(
  toolName: string,
  errored: boolean,
  now: Date = new Date(),
): Promise<void> {
  const day = dayKey(now)
  const calls = `${KEY_PREFIX}:${STORE_KEY}:mcp:${day}`
  const errors = `${KEY_PREFIX}:${STORE_KEY}:mcperr:${day}`

  try {
    // One pipelined request — see recordAgentHit.
    const pipeline = getRedisClient().pipeline().hincrby(calls, toolName, 1).expire(calls, RETENTION_SECONDS, 'NX')
    if (errored) pipeline.hincrby(errors, toolName, 1).expire(errors, RETENTION_SECONDS, 'NX')
    await pipeline.exec()
  } catch {
    // Same rule as the crawler counters: never fail a request over analytics.
  }
}

/**
 * How long one day's counters stay cached. A finished day never changes, so it
 * is kept for a week; today is still counting, so it is refreshed every few
 * minutes. Both are tagged so the admin Cache screen can drop them.
 */
function cacheDay(final: boolean) {
  cacheLife(final ? { stale: 3600, revalidate: 7 * 86400, expire: 7 * 86400 } : { stale: 60, revalidate: 300, expire: 300 })
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.AGENT_TRAFFIC)
}

/**
 * One day's MCP counters. Throws on a Redis failure so an outage is never
 * cached; readMcpToolStats skips that day instead.
 */
async function readMcpDay(
  day: string,
  final: boolean,
): Promise<{ calls: Record<string, unknown> | null; errors: Record<string, unknown> | null }> {
  'use cache: remote'
  cacheDay(final)

  const [calls, errors] = await getRedisClient()
    .pipeline()
    .hgetall<Record<string, unknown>>(`${KEY_PREFIX}:${STORE_KEY}:mcp:${day}`)
    .hgetall<Record<string, unknown>>(`${KEY_PREFIX}:${STORE_KEY}:mcperr:${day}`)
    .exec<[Record<string, unknown> | null, Record<string, unknown> | null]>()
  return { calls, errors }
}

/**
 * MCP tool-call counters for the last `days` days, aggregated.
 *
 * Each day is read through its own cache entry: the report used to re-read
 * every day from Redis on every view.
 */
export async function readMcpToolStats(
  days: number,
  now: Date = new Date(),
): Promise<{ calls: Record<string, number>; errors: Record<string, number> }> {
  const calls: Record<string, number> = {}
  const errors: Record<string, number> = {}

  for (let i = 0; i < days; i++) {
    const day = dayKey(new Date(now.getTime() - i * 24 * 60 * 60 * 1000))
    try {
      const { calls: c, errors: e } = await readMcpDay(day, i > 0)
      for (const [tool, n] of Object.entries(c ?? {})) calls[tool] = (calls[tool] ?? 0) + (Number(n) || 0)
      for (const [tool, n] of Object.entries(e ?? {})) errors[tool] = (errors[tool] ?? 0) + (Number(n) || 0)
    } catch {
      // Redis unreachable: report what was read.
      break
    }
  }

  return { calls, errors }
}

// ─── Reading, for the admin report ───────────────────────────────────────────

export type AgentDayStats = {
  day: string
  /** agent -> total hits */
  totals: Record<string, number>
  /** agent -> path -> hits */
  paths: Record<string, Record<string, number>>
  /** agent -> status code -> hits */
  statuses: Record<string, Record<string, number>>
}

function splitHash(raw: Record<string, unknown> | null): Record<string, Record<string, number>> {
  const out: Record<string, Record<string, number>> = {}
  for (const [field, value] of Object.entries(raw ?? {})) {
    const [agent, rest] = field.split(SEP)
    if (!agent || rest === undefined) continue
    out[agent] ??= {}
    out[agent][rest] = Number(value) || 0
  }
  return out
}

/**
 * One day's crawler counters, cached — see cacheDay.
 *
 * The paths hash holds one field per agent × page, so on a crawled day it is
 * by far the largest thing this app reads from Redis. The report used to fetch
 * fourteen of them on every view; now a finished day is fetched once a week.
 * Throws on a Redis failure so an outage is never cached.
 */
async function readAgentDay(day: string, final: boolean): Promise<AgentDayStats> {
  'use cache: remote'
  cacheDay(final)

  const k = keys(day)
  const [totalsRaw, pathsRaw, statusesRaw] = await getRedisClient()
    .pipeline()
    .hgetall<Record<string, unknown>>(k.agents)
    .hgetall<Record<string, unknown>>(k.paths)
    .hgetall<Record<string, unknown>>(k.statuses)
    .exec<[Record<string, unknown> | null, Record<string, unknown> | null, Record<string, unknown> | null]>()

  const totals: Record<string, number> = {}
  for (const [agent, value] of Object.entries(totalsRaw ?? {})) {
    totals[agent] = Number(value) || 0
  }

  return { day, totals, paths: splitHash(pathsRaw), statuses: splitHash(statusesRaw) }
}

/** The last `days` days of counters, newest first. Stops at the first failure. */
export async function readAgentStats(days: number, now: Date = new Date()): Promise<AgentDayStats[]> {
  const out: AgentDayStats[] = []

  for (let i = 0; i < days; i++) {
    const day = dayKey(new Date(now.getTime() - i * 24 * 60 * 60 * 1000))
    try {
      out.push(await readAgentDay(day, i > 0))
    } catch {
      break
    }
  }

  return out
}
