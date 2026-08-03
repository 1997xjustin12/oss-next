import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_TAGS } from '@/config/cache'

// Backend-owned sitemap data. Replaces the app's own ES search_after pagination
// for product URLs — one call, and the backend supplies real per-product
// lastmod. Key-protected (same Api-Key as the pages API), so server-side only;
// the key never reaches the browser.
const BACKEND = (process.env.NEXT_OSS_BACKEND_URL ?? '').replace(/\/+$/, '')
const API_KEY = process.env.NEXT_OSS_BACKEND_KEY
const STORE_DOMAIN = process.env.NEXT_PUBLIC_STORE_DOMAIN

/** One product row from GET /api/sitemap/?type=products. */
export interface SitemapProduct {
  handle: string
  /** Explicit path override; when null, build from `handle`. */
  path: string | null
  lastmod: string | null
}

interface ProductSitemapResponse {
  products?: SitemapProduct[]
  counts?: { products?: number }
}

/**
 * All product entries for the sitemap, from the Django sitemap endpoint (scoped
 * to this store by X-Store-Domain). Fails soft to an empty array so a backend
 * blip can't break /sitemap.xml.
 */
export async function fetchProductSitemap(): Promise<SitemapProduct[]> {
  'use cache'
  cacheLife('hours')
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.PRODUCTS)

  try {
    const res = await fetch(`${BACKEND}/api/sitemap/?type=products`, {
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        'X-Store-Domain': STORE_DOMAIN ?? '',
      },
      signal: AbortSignal.timeout(20_000),
    })
    if (!res.ok) {
      console.error(`[sitemap] products ${res.status}`)
      return []
    }
    const data = (await res.json()) as ProductSitemapResponse
    return Array.isArray(data.products) ? data.products : []
  } catch (err) {
    console.error('[sitemap] products fetch failed:', err)
    return []
  }
}
