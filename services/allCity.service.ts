import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_TAGS, SHELL_OUTAGE_CACHE_LIFE } from '@/config/cache'
import { STORE_KEY } from '@/config/store'
import { ALL_CITY_DEPOTS } from '@/lib/data/allCityDepots'
import { ALL_CITY_TEMPLATE_DEFAULT } from '@/lib/data/allCityTemplate'
import { ALL_CITY_OLD_URLS_DEFAULT } from '@/lib/data/allCityOldUrls'
import { conformAllCityOldUrls } from '@/lib/allCityOldUrls'
import { allSeedPages, getSeedPage } from '@/lib/allCitySeed'
import type { AllCityAdminRow } from '@/lib/allCityAdmin'
import { findAllCityIssues } from '@/lib/allCityIssues'
import { ALL_CITY_STATE_NAMES, buildAllCityLists, withoutPage, type AllCityStateLists } from '@/lib/allCityPage'
import { conformAllCityDepot, conformAllCityPage, conformAllCityTemplate } from '@/lib/allCityValidate'
import { getRedisClient } from '@/lib/redis'
import type { AllCityDepot, AllCityLink, AllCityOldUrl, AllCityPage, AllCityState, AllCityTemplate } from '@/types/allCity'

/**
 * The /all-city/ pages' records: the seed imported from WordPress
 * (lib/data/allCityPages.json) and the code defaults, with the admin's edits
 * from Redis laid over them. Each record has a **published** copy (what
 * visitors see) and a **draft** (what the admin is editing), as the location
 * and GBP pages do:
 *
 *   oss-next:<store>:allcity:template(:draft)
 *   oss-next:<store>:allcity:depot:<key>(:draft)
 *   oss-next:<store>:allcity:page:<slug>(:draft)
 *   oss-next:<store>:allcity:pages      set: every slug with a page record (draft or published)
 *   oss-next:<store>:allcity:redirects(:draft)   the old-URL redirects (one list)
 *
 * Only edited pages have a record: 8,539 pages render from the seed until
 * someone changes one. The set lets the admin list and each state's lists find
 * the edited ones without reading every key. Records are envelopes,
 * `{ data, updatedAt, updatedBy }`, and every read goes through
 * lib/allCityValidate.ts. While Redis is unreachable, pages render the seed.
 *
 * Reference: docs/reference/all-city-pages.md §3.2–3.3.
 */

const KEY_PREFIX = 'oss-next'

/** `redirects`: the old-URL redirect list (lib/allCityOldUrls.ts), which the proxy reads (lib/allCityOldUrlRedirects.ts). */
export type AllCityRecordKind = 'template' | 'depot' | 'page' | 'redirects'

export function allCityKey(kind: AllCityRecordKind, id?: string, draft = false): string {
  return [KEY_PREFIX, STORE_KEY, 'allcity', kind, ...(id ? [id] : []), ...(draft ? ['draft'] : [])].join(':')
}

const PAGES_SET = [KEY_PREFIX, STORE_KEY, 'allcity', 'pages'].join(':')

/** One page's cache tag: publishing it refreshes only that page. */
export function allCityPageTag(slug: string): string {
  return `all-city:${slug}`
}

/** One state's lists' cache tag: a page's list membership, city name or visibility changes them. */
export function allCityListsTag(state: AllCityState): string {
  return `all-city-lists:${state}`
}

type Envelope<T> = { data: T; updatedAt: string; updatedBy: string }

function unwrap(raw: unknown): { data: unknown; updatedAt?: string; updatedBy?: string } | null {
  if (!raw || typeof raw !== 'object') return null
  const value = raw as Record<string, unknown>
  if ('data' in value) {
    return {
      data: value.data,
      updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : undefined,
      updatedBy: typeof value.updatedBy === 'string' ? value.updatedBy : undefined,
    }
  }
  return { data: value }
}

/** A multi-get in chunks: an Upstash REST request with thousands of keys is too large. */
async function mgetChunked(keys: string[], chunk = 400): Promise<unknown[]> {
  const out: unknown[] = []
  for (let i = 0; i < keys.length; i += chunk) {
    const part = keys.slice(i, i + chunk)
    out.push(...((await getRedisClient().mget<unknown[]>(...part)) ?? part.map(() => null)))
  }
  return out
}

/** The base a page record is validated against: its seed, or for a page created in the admin, a blank one. */
export function blankAllCityPage(slug: string): AllCityPage {
  return {
    slug,
    city: '',
    state: 'TX',
    depotKey: 'houston-tx',
    variant: 'city',
    h1: '',
    seo: { title: '', description: '' },
    lists: { popular: false, viewAll: true },
  }
}

/** A page from its record over its base; null when it has neither a seed nor a usable record. */
function pageFrom(slug: string, raw: unknown): AllCityPage | null {
  const seed = getSeedPage(slug)
  if (seed) return conformAllCityPage(raw, seed)
  if (raw === undefined || raw === null) return null
  const page = conformAllCityPage(raw, blankAllCityPage(slug))
  // A created page must have been saved complete; a broken one is not a page.
  return page.city && page.h1 && page.seo.title ? page : null
}

// ─── Published reads (the live pages) ────────────────────────────────────────

/** A page as published: the seed, with its published record over it. Null for an unknown slug. */
export async function getAllCityPage(slug: string): Promise<AllCityPage | null> {
  'use cache: remote'
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.ALL_CITY, allCityPageTag(slug))
  try {
    const record = unwrap(await getRedisClient().get<unknown>(allCityKey('page', slug)))
    cacheLife('hours')
    return pageFrom(slug, record?.data)
  } catch (error) {
    console.error('[all-city] failed reading page', slug, error)
    cacheLife(SHELL_OUTAGE_CACHE_LIFE)
    return getSeedPage(slug)
  }
}

export async function getAllCityTemplate(): Promise<AllCityTemplate> {
  'use cache: remote'
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.ALL_CITY)
  try {
    const record = unwrap(await getRedisClient().get<unknown>(allCityKey('template')))
    cacheLife('hours')
    return conformAllCityTemplate(record?.data)
  } catch (error) {
    console.error('[all-city] failed reading the template', error)
    cacheLife(SHELL_OUTAGE_CACHE_LIFE)
    return ALL_CITY_TEMPLATE_DEFAULT
  }
}

/** Every depot as published (22 keys, one round-trip). */
export async function getAllCityDepots(): Promise<Record<string, AllCityDepot>> {
  'use cache: remote'
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.ALL_CITY)
  const keys = Object.keys(ALL_CITY_DEPOTS)
  try {
    const raws = await getRedisClient().mget<unknown[]>(...keys.map((key) => allCityKey('depot', key)))
    cacheLife('hours')
    return Object.fromEntries(keys.map((key, i) => [key, conformAllCityDepot(unwrap(raws?.[i])?.data, ALL_CITY_DEPOTS[key])]))
  } catch (error) {
    console.error('[all-city] failed reading the depots', error)
    cacheLife(SHELL_OUTAGE_CACHE_LIFE)
    return { ...ALL_CITY_DEPOTS }
  }
}

export async function getAllCityDepot(key: string): Promise<AllCityDepot | null> {
  return (await getAllCityDepots())[key] ?? null
}

/**
 * The read in flight, shared: the /all-city index builds every state's lists at
 * once (getAllCityDirectory), and each state used to read every edited page
 * itself — one identical multi-get per state, all in parallel, which on a slow link overran
 * the prerender's cache-fill limit and failed the build (2026-11-23). Callers
 * that arrive while a read is running share it; the next call after it settles
 * reads again, so a publish is never served stale from here.
 */
let editsInFlight: Promise<Map<string, AllCityPage>> | null = null

/** The published records of every edited page (one set read, one multi-get), one read at a time. */
function publishedEdits(): Promise<Map<string, AllCityPage>> {
  editsInFlight ??= readPublishedEdits().finally(() => {
    editsInFlight = null
  })
  return editsInFlight
}

async function readPublishedEdits(): Promise<Map<string, AllCityPage>> {
  const redis = getRedisClient()
  const slugs = await redis.smembers(PAGES_SET)
  if (!slugs.length) return new Map()
  const raws = await mgetChunked(slugs.map((slug) => allCityKey('page', slug)))
  const edits = new Map<string, AllCityPage>()
  slugs.forEach((slug, i) => {
    const record = unwrap(raws?.[i])
    if (!record) return
    const page = pageFrom(slug, record.data)
    if (page) edits.set(slug, page)
  })
  return edits
}

/**
 * One state's two lists as published, sorted as WordPress sorted them (by the
 * city's name): the seed's pages with the published edits laid over them.
 * Cached per state; publishing a page refreshes its state's (and its old
 * state's) lists.
 */
async function getStateLists(state: AllCityState): Promise<AllCityStateLists> {
  'use cache: remote'
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.ALL_CITY, allCityListsTag(state))
  let edits = new Map<string, AllCityPage>()
  try {
    edits = await publishedEdits()
    cacheLife('hours')
  } catch (error) {
    console.error('[all-city] failed reading edited pages for the lists of', state, error)
    cacheLife(SHELL_OUTAGE_CACHE_LIFE)
  }
  const pages = allSeedPages().map((page) => edits.get(page.slug) ?? page)
  const seedSlugs = new Set(pages.map((page) => page.slug))
  for (const [slug, page] of edits) if (!seedSlugs.has(slug)) pages.push(page)

  return buildAllCityLists(pages, state)
}

/**
 * "Popular Cities in <state>" and "View all cities in <state>" for one page:
 * its state's lists without the page itself, as WordPress left the current
 * post out of both.
 */
export type { AllCityStateLists }

export async function getAllCityLists(state: AllCityState, exceptSlug: string): Promise<AllCityStateLists> {
  return withoutPage(await getStateLists(state), exceptSlug)
}

export type AllCityStateSummary = {
  state: AllCityState
  name: string
  /** The state's listed city pages (its two lists together, each page once). */
  count: number
  popular: AllCityLink[]
}

/**
 * The /all-city index: each state with its city-page count and its "Popular
 * Cities" list, from the same cached per-state lists the city pages read (so
 * publishing a page refreshes this too). States in name order.
 */
export async function getAllCityDirectory(): Promise<AllCityStateSummary[]> {
  const states = (Object.keys(ALL_CITY_STATE_NAMES) as AllCityState[]).sort((a, b) =>
    ALL_CITY_STATE_NAMES[a].localeCompare(ALL_CITY_STATE_NAMES[b]),
  )
  const lists = await Promise.all(states.map((state) => getStateLists(state)))
  return states.map((state, i) => ({
    state,
    name: ALL_CITY_STATE_NAMES[state],
    count: new Set([...lists[i].popular, ...lists[i].viewAll].map((link) => link.slug)).size,
    popular: lists[i].popular,
  }))
}

// ─── Admin: drafts and publishing (uncached, admin-only callers) ─────────────

export type AllCityDraftState<T> = {
  /** The draft if there is one, else the published copy (else the seed): what the editor shows. */
  value: T
  /** What visitors see now (else the seed): the editor marks what the draft changes. */
  published: T
  hasDraft: boolean
  hasPublished: boolean
  draftUpdatedAt?: string
  draftUpdatedBy?: string
  publishedAt?: string
  publishedBy?: string
}

async function readState<T>(kind: AllCityRecordKind, id: string | undefined, conform: (raw: unknown) => T | null): Promise<AllCityDraftState<T> | null> {
  const redis = getRedisClient()
  const [draftRaw, publishedRaw] = await Promise.all([redis.get<unknown>(allCityKey(kind, id, true)), redis.get<unknown>(allCityKey(kind, id))])
  const draft = unwrap(draftRaw)
  const published = unwrap(publishedRaw)
  const value = conform(draft ? draft.data : published?.data)
  if (value === null) return null
  return {
    value,
    published: conform(published?.data) ?? value,
    hasDraft: !!draft,
    hasPublished: !!published,
    draftUpdatedAt: draft?.updatedAt,
    draftUpdatedBy: draft?.updatedBy,
    publishedAt: published?.updatedAt,
    publishedBy: published?.updatedBy,
  }
}

export function readAllCityPageState(slug: string): Promise<AllCityDraftState<AllCityPage> | null> {
  return readState('page', slug, (raw) => pageFrom(slug, raw))
}

export async function readAllCityTemplateState(): Promise<AllCityDraftState<AllCityTemplate>> {
  return (await readState('template', undefined, (raw) => conformAllCityTemplate(raw)))!
}

export async function readAllCityDepotState(key: string): Promise<AllCityDraftState<AllCityDepot> | null> {
  const seed = ALL_CITY_DEPOTS[key]
  if (!seed) return null
  return readState('depot', key, (raw) => conformAllCityDepot(raw, seed))
}

/** The old-URL redirects: the draft or published list, else the default (lib/data/allCityOldUrls.ts). */
export async function readAllCityOldUrlsState(): Promise<AllCityDraftState<AllCityOldUrl[]>> {
  return (await readState('redirects', undefined, (raw) => conformAllCityOldUrls(raw) ?? [...ALL_CITY_OLD_URLS_DEFAULT]))!
}

/** The published page as visitors see it now, uncached (for comparing before a publish). */
export async function readPublishedAllCityPage(slug: string): Promise<AllCityPage | null> {
  return pageFrom(slug, unwrap(await getRedisClient().get<unknown>(allCityKey('page', slug)))?.data)
}

function envelope<T>(data: T, by: string): Envelope<T> {
  return { data, updatedAt: new Date().toISOString(), updatedBy: by }
}

/** Saves a draft. Callers validate first (lib/allCityValidate.ts). */
export async function saveAllCityDraft<T>(kind: AllCityRecordKind, id: string | undefined, data: T, by: string): Promise<void> {
  const redis = getRedisClient()
  await redis.set(allCityKey(kind, id, true), envelope(data, by))
  if (kind === 'page' && id) await redis.sadd(PAGES_SET, id)
}

export async function discardAllCityDraft(kind: AllCityRecordKind, id?: string): Promise<void> {
  const redis = getRedisClient()
  await redis.del(allCityKey(kind, id, true))
  // A page left with no record at all is the seed again.
  if (kind === 'page' && id && !(await redis.exists(allCityKey('page', id)))) await redis.srem(PAGES_SET, id)
}

/** Copies the draft over the published record and drops the draft. False when there was no draft. */
export async function publishAllCityDraft(kind: AllCityRecordKind, id: string | undefined, by: string): Promise<boolean> {
  const redis = getRedisClient()
  const draft = unwrap(await redis.get<unknown>(allCityKey(kind, id, true)))
  if (!draft) return false
  await redis.set(allCityKey(kind, id), envelope(draft.data, by))
  await redis.del(allCityKey(kind, id, true))
  return true
}

// ─── Admin: bulk edits (many pages, few round-trips) ─────────────────────────

/** The working copy (draft, else published, else seed) of many pages: one multi-get. Unknown slugs are left out. */
export async function readAllCityWorkingCopies(slugs: string[]): Promise<Map<string, AllCityPage>> {
  if (!slugs.length) return new Map()
  const keys = slugs.flatMap((slug) => [allCityKey('page', slug, true), allCityKey('page', slug)])
  const raws = await mgetChunked(keys)
  const out = new Map<string, AllCityPage>()
  slugs.forEach((slug, i) => {
    const record = unwrap(raws?.[i * 2]) ?? unwrap(raws?.[i * 2 + 1])
    const page = pageFrom(slug, record?.data)
    if (page) out.set(slug, page)
  })
  return out
}

/** Saves many page drafts in one pipeline. Callers validate first. */
export async function saveAllCityPageDrafts(pages: AllCityPage[], by: string): Promise<void> {
  // Pipelines of PIPELINE_CHUNK: each record is ~1 KB, and an Upstash request has a size cap.
  for (let i = 0; i < pages.length; i += PIPELINE_CHUNK) {
    const part = pages.slice(i, i + PIPELINE_CHUNK)
    const pipeline = getRedisClient().pipeline()
    for (const page of part) pipeline.set(allCityKey('page', page.slug, true), envelope(page, by))
    pipeline.sadd(PAGES_SET, part[0].slug, ...part.slice(1).map((page) => page.slug))
    await pipeline.exec()
  }
}

const PIPELINE_CHUNK = 200

/** Publishes the drafts of many pages; returns the pages published (old and new versions, for refreshing their lists). */
export async function publishAllCityPageDrafts(slugs: string[], by: string): Promise<{ slug: string; before: AllCityPage | null; after: AllCityPage }[]> {
  if (!slugs.length) return []
  const keys = slugs.flatMap((slug) => [allCityKey('page', slug, true), allCityKey('page', slug)])
  const raws = await mgetChunked(keys)
  const done: { slug: string; before: AllCityPage | null; after: AllCityPage; data: unknown }[] = []
  slugs.forEach((slug, i) => {
    const draft = unwrap(raws?.[i * 2])
    if (!draft) return
    const after = pageFrom(slug, draft.data)
    if (!after) return
    const published = unwrap(raws?.[i * 2 + 1])
    done.push({ slug, before: published ? pageFrom(slug, published.data) : getSeedPage(slug), after, data: draft.data })
  })
  for (let i = 0; i < done.length; i += PIPELINE_CHUNK) {
    const pipeline = getRedisClient().pipeline()
    for (const item of done.slice(i, i + PIPELINE_CHUNK)) {
      pipeline.set(allCityKey('page', item.slug), envelope(item.data, by))
      pipeline.del(allCityKey('page', item.slug, true))
    }
    await pipeline.exec()
  }
  return done.map(({ slug, before, after }) => ({ slug, before, after }))
}

export type AllCityAdminRecord = { draft: AllCityPage | null; published: AllCityPage | null }

/**
 * Every page that has a record, for the admin list: its draft and published
 * versions. One set read and one multi-get, however many pages exist.
 */
export async function readAllCityAdminRecords(): Promise<Map<string, AllCityAdminRecord>> {
  const redis = getRedisClient()
  const slugs = await redis.smembers(PAGES_SET)
  if (!slugs.length) return new Map()
  const keys = slugs.flatMap((slug) => [allCityKey('page', slug, true), allCityKey('page', slug)])
  const raws = await mgetChunked(keys)
  const out = new Map<string, AllCityAdminRecord>()
  slugs.forEach((slug, i) => {
    const draft = unwrap(raws?.[i * 2])
    const published = unwrap(raws?.[i * 2 + 1])
    out.set(slug, { draft: draft ? pageFrom(slug, draft.data) : null, published: published ? pageFrom(slug, published.data) : null })
  })
  return out
}

/**
 * Every page as the admin list shows it: the working copy (draft, else
 * published, else seed), whether it was edited or created here, and its
 * issues. Built per request from the seed and the edited records.
 */
export async function readAllCityAdminRows(): Promise<AllCityAdminRow[]> {
  const records = await readAllCityAdminRecords()
  const rows: AllCityAdminRow[] = allSeedPages().map((seed) => {
    const record = records.get(seed.slug)
    const page = record?.draft ?? record?.published ?? seed
    return { page, status: record?.published ? 'edited' : 'seed', hasDraft: !!record?.draft, issues: [] }
  })
  const seeded = new Set(rows.map((row) => row.page.slug))
  for (const [slug, record] of records) {
    if (seeded.has(slug)) continue
    const page = record.draft ?? record.published
    if (page) rows.push({ page, status: 'new', hasDraft: !!record.draft, issues: [] })
  }
  const issues = findAllCityIssues(rows.map((row) => row.page))
  for (const row of rows) row.issues = issues.get(row.page.slug) ?? []
  return rows
}
