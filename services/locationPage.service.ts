import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_TAGS, SHELL_OUTAGE_CACHE_LIFE } from '@/config/cache'
import { STORE_KEY } from '@/config/store'
import { getLocationPageSeed } from '@/lib/data/locationPages'
import { LOCATION_SNAPSHOT } from '@/lib/data/locationSnapshot'
import { LOCATION_TEMPLATE_DEFAULT } from '@/lib/data/locationTemplate'
import { conformLocationPage, conformLocationTemplate } from '@/lib/locationValidate'
import { getRedisClient } from '@/lib/redis'
import type { LocationPage, LocationTemplate } from '@/types/locationPage'

/**
 * The location pages' records in Redis: the template and each location, each
 * with a **published** copy (what visitors see) and a **draft** (what the
 * admin is editing), as services/gbp.service.ts keeps the GBP pages'. The code
 * files are the seed: with no record, or a malformed field, a page renders
 * from them. While Redis is unreachable, a page renders the records as of the
 * last build (lib/data/locationSnapshot.ts), and the seed where that has none.
 *
 *   oss-next:<store>:location:template          published
 *   oss-next:<store>:location:template:draft    draft
 *   oss-next:<store>:location:page:<slug>(:draft)
 *
 * Records are envelopes, `{ data, updatedAt, updatedBy }`. A location's SEO is
 * the Page Configurator's record (services/seo.service.ts), not stored here.
 *
 * Reference: docs/reference/location-pages.md ("The configurator").
 */

const KEY_PREFIX = 'oss-next'

export type LocationRecordKind = 'page' | 'template'

export function locationKey(kind: LocationRecordKind, id?: string, draft = false): string {
  return [KEY_PREFIX, STORE_KEY, 'location', kind, ...(id ? [id] : []), ...(draft ? ['draft'] : [])].join(':')
}

/** One location's cache tag, so publishing it refreshes only that page (the template's is the whole group). */
export function locationPageTag(slug: string): string {
  return `location-page:${slug}`
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

/** One more try after a short pause: the build prerenders every location at once, and a read can time out under that load. */
async function getWithRetry(key: string): Promise<unknown> {
  try {
    return await getRedisClient().get<unknown>(key)
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 400))
    return getRedisClient().get<unknown>(key)
  }
}

/**
 * Never throws: an unreachable Redis renders the record as of the last build
 * (the snapshot; the seed if it has none), cached only briefly so edits
 * published since return soon after Redis does.
 */
async function readPublished<T>(key: string, label: string, conform: (raw: unknown) => T): Promise<T> {
  try {
    const record = unwrap(await getWithRetry(key))
    cacheLife('hours')
    return conform(record?.data)
  } catch (error) {
    console.error('[location-pages] failed reading', label, error)
    cacheLife(SHELL_OUTAGE_CACHE_LIFE)
    return conform(LOCATION_SNAPSHOT[key])
  }
}

// ─── Published reads (the live pages) ────────────────────────────────────────

/** A native location's record as published. Null when the slug has no seed (WordPress still serves it). */
export async function getLocationPage(slug: string): Promise<LocationPage | null> {
  'use cache: remote'
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.LOCATION_PAGES, locationPageTag(slug))
  const seed = getLocationPageSeed(slug)
  if (!seed) return null
  return readPublished(locationKey('page', slug), `page ${slug}`, (raw) => conformLocationPage(raw, seed))
}

export async function getLocationTemplate(): Promise<LocationTemplate> {
  'use cache: remote'
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.LOCATION_PAGES)
  return readPublished(locationKey('template'), 'template', (raw) => conformLocationTemplate(raw, LOCATION_TEMPLATE_DEFAULT))
}

// ─── Admin: drafts and publishing (uncached, admin-only callers) ─────────────

export type LocationDraftState<T> = {
  /** The draft if there is one, else the published copy (else the seed): what the editor shows. */
  value: T
  hasDraft: boolean
  draftUpdatedAt?: string
  draftUpdatedBy?: string
  publishedAt?: string
  publishedBy?: string
}

async function readState<T>(kind: LocationRecordKind, id: string | undefined, conform: (raw: unknown) => T): Promise<LocationDraftState<T>> {
  const redis = getRedisClient()
  const [draftRaw, publishedRaw] = await Promise.all([redis.get<unknown>(locationKey(kind, id, true)), redis.get<unknown>(locationKey(kind, id))])
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

export async function readLocationPageState(slug: string): Promise<LocationDraftState<LocationPage> | null> {
  const seed = getLocationPageSeed(slug)
  if (!seed) return null
  return readState('page', slug, (raw) => conformLocationPage(raw, seed))
}

export function readLocationTemplateState(): Promise<LocationDraftState<LocationTemplate>> {
  return readState('template', undefined, (raw) => conformLocationTemplate(raw, LOCATION_TEMPLATE_DEFAULT))
}

function envelope<T>(data: T, by: string): Envelope<T> {
  return { data, updatedAt: new Date().toISOString(), updatedBy: by }
}

/** Saves a draft. Callers validate first (the conform* functions). */
export async function saveLocationDraft<T>(kind: LocationRecordKind, id: string | undefined, data: T, by: string): Promise<void> {
  await getRedisClient().set(locationKey(kind, id, true), envelope(data, by))
}

export async function discardLocationDraft(kind: LocationRecordKind, id?: string): Promise<void> {
  await getRedisClient().del(locationKey(kind, id, true))
}

/** Copies the draft over the published record and drops the draft. False when there was no draft. */
export async function publishLocationDraft(kind: LocationRecordKind, id: string | undefined, by: string): Promise<boolean> {
  const redis = getRedisClient()
  const draft = unwrap(await redis.get<unknown>(locationKey(kind, id, true)))
  if (!draft) return false
  await redis.set(locationKey(kind, id), envelope(draft.data, by))
  await redis.del(locationKey(kind, id, true))
  return true
}
