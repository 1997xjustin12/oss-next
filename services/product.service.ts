import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_TAGS } from '@/config/cache'
import type { WpSingleProductResponse } from '@/types/product'

const WP_SINGLE_PRODUCT_URL = 'https://onsitestorage.com/wp-json/custom/v1/product'

export async function fetchProduct(slug: string): Promise<WpSingleProductResponse | null> {
  'use cache'
  cacheLife('hours')
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.PRODUCTS)

  try {
    const res = await fetch(`${WP_SINGLE_PRODUCT_URL}?slug=${encodeURIComponent(slug)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return null
    const data: unknown = await res.json()
    if (typeof data === 'object' && data !== null && 'message' in data) return null
    const response = data as WpSingleProductResponse
    if (!response.product) return null
    return response
  } catch {
    return null
  }
}
