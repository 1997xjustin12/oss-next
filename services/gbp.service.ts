import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_TAGS, SHELL_OUTAGE_CACHE_LIFE } from '@/config/cache'
import { STORE_KEY } from '@/config/store'
import { getGbpPage as getGbpPageSeed } from '@/lib/data/gbpPages'
import { GBP_SHARED_DEFAULTS } from '@/lib/data/gbpShared'
import { GBP_TEMPLATE_DEFAULT } from '@/lib/data/gbpTemplate'
import { conformGbpPage, conformGbpShared, conformGbpTemplate } from '@/lib/gbpValidate'
import { getRedisClient } from '@/lib/redis'
import type { GbpPage, GbpSharedContent, GbpTemplate } from '@/types/gbp'
import type { PageSeo } from '@/types/seo'

/**
 * The GBP pages' records in Redis: each location page, the shared content and
 * the template, each with a **published** copy (what visitors see) and a
 * **draft** (what the admin is editing). The code files are the seed: with no
 * record, or a malformed field, the page renders from them.
 *
 *   oss-next:<store>:gbp:page:<slug>          published
 *   oss-next:<store>:gbp:page:<slug>:draft    draft
 *   oss-next:<store>:gbp:seo:<slug>:draft     draft of the page's PageSeo (published lives in seo:<path>)
 *   oss-next:<store>:gbp:shared(:draft)
 *   oss-next:<store>:gbp:template(:draft)
 *
 * Records are envelopes, `{ data, updatedAt, updatedBy }`, so the admin can
 * say who changed what and when.
 *
 * Reference: docs/reference/gbp-subdomain-pages.md ("Admin configurators")
 */

const KEY_PREFIX = 'oss-next'

export type GbpRecordKind = 'page' | 'shared' | 'template'

export function gbpKey(kind: GbpRecordKind | 'seo', id?: string, draft = false): string {
  return [KEY_PREFIX, STORE_KEY, 'gbp', kind, ...(id ? [id] : []), ...(draft ? ['draft'] : [])].join(':')
}

/** The cache tag for one record, so publishing refreshes just that page (or all, for shared/template). */
export function gbpTag(kind: GbpRecordKind, id?: string): string {
  return kind === 'page' ? `gbp:page:${id}` : `gbp:${kind}`
}

export type GbpEnvelope<T> = { data: T; updatedAt: string; updatedBy: string }

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

// ─── Published reads (the live pages) ────────────────────────────────────────

/**
 * One more try after a short pause before giving up. Builds prerender every
 * GBP page in parallel, and a read can hit the client's 3 s timeout under that
 * load; without this the page was built from the code seed and kept it for
 * up to 15 minutes, which once Redis has admin edits means stale content after
 * a deploy.
 */
async function getWithRetry(key: string): Promise<unknown> {
  try {
    return await getRedisClient().get<unknown>(key)
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 400))
    return getRedisClient().get<unknown>(key)
  }
}

/**
 * Never throws: an unreachable Redis renders the code seed, cached only
 * briefly (SHELL_OUTAGE_CACHE_LIFE), so published edits return within 15
 * minutes of Redis recovering.
 */
async function readPublished<T>(key: string, label: string, conform: (raw: unknown) => T): Promise<T> {
  try {
    const record = unwrap(await getWithRetry(key))
    cacheLife('hours')
    return conform(record?.data)
  } catch (error) {
    console.error('[gbp] failed reading', label, error)
    cacheLife(SHELL_OUTAGE_CACHE_LIFE)
    return conform(undefined)
  }
}

/** A location page as published. Null for a slug with no seed entry. */
export async function getGbpPage(slug: string): Promise<GbpPage | null> {
  'use cache: remote'
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.GBP, gbpTag('page', slug))
  const seed = getGbpPageSeed(slug)
  if (!seed) return null
  return readPublished(gbpKey('page', slug), `page ${slug}`, (raw) => conformGbpPage(raw, seed))
}

export async function getGbpShared(): Promise<GbpSharedContent> {
  'use cache: remote'
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.GBP, gbpTag('shared'))
  return readPublished(gbpKey('shared'), 'shared content', (raw) => conformGbpShared(raw, GBP_SHARED_DEFAULTS))
}

export async function getGbpTemplate(): Promise<GbpTemplate> {
  'use cache: remote'
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.GBP, gbpTag('template'))
  return readPublished(gbpKey('template'), 'template', (raw) => conformGbpTemplate(raw, GBP_TEMPLATE_DEFAULT))
}

// ─── Admin: drafts and publishing (uncached, admin-only callers) ─────────────

export type GbpDraftState<T> = {
  /** The draft if there is one, else the published copy: what the editor shows. */
  value: T
  hasDraft: boolean
  draftUpdatedAt?: string
  draftUpdatedBy?: string
  publishedAt?: string
  publishedBy?: string
}

async function readState<T>(kind: GbpRecordKind, id: string | undefined, conform: (raw: unknown) => T): Promise<GbpDraftState<T>> {
  const redis = getRedisClient()
  const [draftRaw, publishedRaw] = await Promise.all([redis.get<unknown>(gbpKey(kind, id, true)), redis.get<unknown>(gbpKey(kind, id))])
  const draft = unwrap(draftRaw)
  const published = unwrap(publishedRaw)
  return {
    value: conform(draft ? draft.data : published?.data),
    hasDraft: !!draft,
    draftUpdatedAt: draft?.updatedAt,
    draftUpdatedBy: draft?.updatedBy,
    publishedAt: published?.updatedAt,
    publishedBy: published?.updatedBy,
  }
}

export async function readGbpPageState(slug: string): Promise<GbpDraftState<GbpPage> | null> {
  const seed = getGbpPageSeed(slug)
  if (!seed) return null
  return readState('page', slug, (raw) => conformGbpPage(raw, seed))
}

export function readGbpSharedState(): Promise<GbpDraftState<GbpSharedContent>> {
  return readState('shared', undefined, (raw) => conformGbpShared(raw, GBP_SHARED_DEFAULTS))
}

export function readGbpTemplateState(): Promise<GbpDraftState<GbpTemplate>> {
  return readState('template', undefined, (raw) => conformGbpTemplate(raw, GBP_TEMPLATE_DEFAULT))
}

function envelope<T>(data: T, by: string): GbpEnvelope<T> {
  return { data, updatedAt: new Date().toISOString(), updatedBy: by }
}

/** Saves a draft. Callers validate first (the conform* functions). */
export async function saveGbpDraft<T>(kind: GbpRecordKind, id: string | undefined, data: T, by: string): Promise<void> {
  await getRedisClient().set(gbpKey(kind, id, true), envelope(data, by))
}

export async function discardGbpDraft(kind: GbpRecordKind, id?: string): Promise<void> {
  await getRedisClient().del(gbpKey(kind, id, true))
}

/**
 * Copies the draft over the published record and drops the draft. Returns
 * false when there was no draft. Callers refresh `gbpTag(kind, id)`.
 */
export async function publishGbpDraft(kind: GbpRecordKind, id: string | undefined, by: string): Promise<boolean> {
  const redis = getRedisClient()
  const draft = unwrap(await redis.get<unknown>(gbpKey(kind, id, true)))
  if (!draft) return false
  await redis.set(gbpKey(kind, id), envelope(draft.data, by))
  await redis.del(gbpKey(kind, id, true))
  return true
}

/** Writes a published record directly (the one-time migration from the code seed). */
export async function writeGbpPublished<T>(kind: GbpRecordKind, id: string | undefined, data: T, by: string): Promise<void> {
  await getRedisClient().set(gbpKey(kind, id), envelope(data, by))
}

// The location's PageSeo has its own draft; publishing writes it to the
// Page Configurator's record (services/seo.service.ts), which the page's
// metadata already reads.

export async function readGbpSeoDraft(slug: string): Promise<PageSeo | null> {
  const record = unwrap(await getRedisClient().get<unknown>(gbpKey('seo', slug, true)))
  return (record?.data as PageSeo | undefined) ?? null
}

export async function saveGbpSeoDraft(slug: string, seo: PageSeo, by: string): Promise<void> {
  await getRedisClient().set(gbpKey('seo', slug, true), envelope(seo, by))
}

export async function discardGbpSeoDraft(slug: string): Promise<void> {
  await getRedisClient().del(gbpKey('seo', slug, true))
}
