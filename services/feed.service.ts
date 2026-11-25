import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_TAGS } from '@/config/cache'
import { buildOpenAiFeedItems, toParquet } from '@/lib/openaiFeed'
import { getAllProductsForFeed } from '@/services/search.service'

export type ChatGptFeedFile = {
  /** The Parquet file, ready to send. */
  file: Uint8Array<ArrayBuffer>
  count: number
  generatedAt: string
}

/**
 * The ChatGPT product feed as a finished Parquet file, cached whole.
 *
 * Building it means scanning ~10,000 Elasticsearch documents (65s cold on
 * production, minutes from further away), and Cloudflare drops a request
 * after 100s. So the finished file, not just the product data, is what's
 * cached, with a long expiry: after the first build every request is answered
 * from the cache, and a fresh copy is built in the background at most hourly
 * while the old one keeps being served. Only the first request after a deploy
 * or a purge (or after a week with no requests at all) waits for a build.
 *
 * This explicit lifetime overrides getAllProductsForFeed()'s own 'hours'
 * expiry (an outer cacheLife wins, whether longer or shorter).
 */
export async function getChatGptFeedFile(): Promise<ChatGptFeedFile> {
  'use cache'
  cacheLife({ stale: 3600, revalidate: 3600, expire: 7 * 24 * 3600 })
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.PRODUCTS)

  const items = buildOpenAiFeedItems(await getAllProductsForFeed())
  return { file: toParquet(items), count: items.length, generatedAt: new Date().toISOString() }
}
