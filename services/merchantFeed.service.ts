import { brotliDecompressSync } from 'node:zlib'
import { head, put } from '@vercel/blob'
import { MERCHANT_FEED_SOURCES, MIN_ITEMS_RATIO, type MerchantFeedSource } from '@/config/merchantFeeds'
import { SITE_URL } from '@/config/site'
import { STORE_KEY } from '@/config/store'
import { MERCHANT_FEED_BASELINE } from '@/lib/data/merchantFeedBaseline'
import { buildMerchantFeeds, type BuiltMerchantFeed, type MerchantBaseline } from '@/lib/merchantFeed'
import { getRedisClient } from '@/lib/redis'
import { scanPublishedProducts } from '@/services/search.service'

/**
 * Generates the three Google Merchant feeds and keeps them in Vercel Blob, where
 * /api/feeds/merchant/{source} (and so the three old WordPress URLs) reads them.
 *
 * Generated ahead of time because it takes over a minute: too long for Merchant
 * Center to wait on a request, and too much work to redo for each fetch. Triggered
 * from Admin → Product Feeds, by a daily Vercel Cron, or by POST /api/feeds/generate.
 *
 * **All or nothing, and the last good files stay.** All three are built before any
 * is uploaded, and a run that fails, or yields far fewer products than the last one
 * (MIN_ITEMS_RATIO), replaces nothing.
 */

const STATUS_KEY = `oss-next:${STORE_KEY}:merchant-feeds:status`
const LOCK_KEY = `oss-next:${STORE_KEY}:merchant-feeds:lock`
/** Past the function's own limit (maxDuration, 300 s), so a crashed run can't hold the lock for long. */
const LOCK_SECONDS = 600

export type MerchantFeedFileStatus = Omit<BuiltMerchantFeed, 'xml'> & { bytes: number }

export type MerchantFeedStatus = {
  state: 'running' | 'done' | 'failed'
  /** Who asked: an admin's username, "cron" or "api". */
  by: string
  startedAt: string
  finishedAt?: string
  error?: string
  /** From the last run that succeeded; a failed run leaves these, and the files, as they were. */
  files?: Partial<Record<MerchantFeedSource, MerchantFeedFileStatus>>
  lastSuccessAt?: string
}

const blobPath = (source: MerchantFeedSource) => `merchant-feeds/${source}.xml`

/**
 * Is storage connected? Without it nothing can be generated or served. Connecting
 * a Blob store to the Vercel project sets one of these, depending on how it connects.
 */
export function isMerchantFeedStorageConfigured(): boolean {
  return !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID)
}

export async function readMerchantFeedStatus(): Promise<MerchantFeedStatus | null> {
  return getRedisClient().get<MerchantFeedStatus>(STATUS_KEY)
}

/**
 * Claim the run, or null if one is already going. Separate from running it so the
 * trigger can answer "started" or "already running" before the work begins.
 */
export async function beginMerchantFeedRun(by: string): Promise<MerchantFeedStatus | null> {
  const redis = getRedisClient()
  const claimed = await redis.set(LOCK_KEY, by, { nx: true, ex: LOCK_SECONDS })
  if (!claimed) return null
  const previous = await redis.get<MerchantFeedStatus>(STATUS_KEY)
  const status: MerchantFeedStatus = {
    state: 'running',
    by,
    startedAt: new Date().toISOString(),
    files: previous?.files,
    lastSuccessAt: previous?.lastSuccessAt,
  }
  await redis.set(STATUS_KEY, status)
  return status
}

function loadBaseline(): MerchantBaseline {
  return JSON.parse(brotliDecompressSync(Buffer.from(MERCHANT_FEED_BASELINE, 'base64')).toString('utf8')) as MerchantBaseline
}

/** The source whose item count dropped too far since the last good run, if any. */
function tooFewItems(
  feeds: Record<MerchantFeedSource, BuiltMerchantFeed>,
  previous: MerchantFeedStatus['files'],
): string | null {
  for (const { source, label, liveItems } of MERCHANT_FEED_SOURCES) {
    const reference = previous?.[source]?.items ?? liveItems
    if (feeds[source].items < reference * MIN_ITEMS_RATIO) {
      return `${label} came out with ${feeds[source].items} products, against ${reference} last time, so nothing was replaced. Check the catalog and run it again.`
    }
  }
  return null
}

/** Build all three feeds from the current catalog. No storage involved. */
export async function buildMerchantFeedsNow(): Promise<Record<MerchantFeedSource, BuiltMerchantFeed>> {
  return buildMerchantFeeds(await scanPublishedProducts(), loadBaseline(), SITE_URL.replace(/\/+$/, ''))
}

/** Do the work claimed by beginMerchantFeedRun. Never throws: the outcome goes in the status. */
export async function runMerchantFeedRun(started: MerchantFeedStatus): Promise<void> {
  const redis = getRedisClient()
  const finish = (fields: Partial<MerchantFeedStatus>) =>
    redis.set(STATUS_KEY, { ...started, ...fields, finishedAt: new Date().toISOString() })

  try {
    const feeds = await buildMerchantFeedsNow()
    const refusal = tooFewItems(feeds, started.files)
    if (refusal) throw new Error(refusal)

    const files: NonNullable<MerchantFeedStatus['files']> = {}
    await Promise.all(
      MERCHANT_FEED_SOURCES.map(async ({ source }) => {
        const { xml, ...counts } = feeds[source]
        await put(blobPath(source), xml, {
          access: 'public',
          addRandomSuffix: false,
          allowOverwrite: true,
          contentType: 'text/xml; charset=utf-8',
          cacheControlMaxAge: 60,
          multipart: true,
        })
        files[source] = { ...counts, bytes: Buffer.byteLength(xml) }
      }),
    )
    await finish({ state: 'done', files, lastSuccessAt: new Date().toISOString() })
    console.info('[merchant-feeds] generated:', MERCHANT_FEED_SOURCES.map(({ source }) => `${source} ${files[source]?.items}`).join(', '))
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    console.error('[merchant-feeds] run failed; the previous files stay:', err)
    await finish({ state: 'failed', error }).catch((e) => console.error('[merchant-feeds] status write failed:', e))
  } finally {
    await redis.del(LOCK_KEY).catch((e) => console.error('[merchant-feeds] lock release failed:', e))
  }
}

/** The stored file, or null if none has been generated yet. */
export async function openMerchantFeed(source: MerchantFeedSource): Promise<{ body: ReadableStream<Uint8Array>; uploadedAt: Date } | null> {
  const blob = await head(blobPath(source)).catch((err: unknown) => {
    if (err instanceof Error && err.name === 'BlobNotFoundError') return null
    throw err
  })
  if (!blob) return null
  // The upload time in the URL, so a replaced file is never read from the Blob CDN's old copy.
  const res = await fetch(`${blob.url}?v=${blob.uploadedAt.getTime()}`, { cache: 'no-store' })
  if (!res.ok || !res.body) throw new Error(`Blob answered HTTP ${res.status}`)
  return { body: res.body, uploadedAt: blob.uploadedAt }
}
