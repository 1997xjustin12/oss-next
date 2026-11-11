import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_TAGS } from '@/config/cache'
import { visitorAuthHeaders } from '@/lib/backendAuth'
import type { DeliveredProductList } from '@/types/order'

/**
 * The store's delivered orders, from the backend's
 * `GET /api/orders/delivered-products` ("Delivered Product List").
 *
 * The backend needs the API key and the store (`X-Store-Domain`), and pages its
 * answer the Django REST way: `{ count, next, previous, results }`. On
 * 2026-11-10 it was empty for onsitestorage.com (`count: 0`), so the shape of a
 * record is not known yet. Raw records never reach a page or a public
 * response: lib/deliveredContainers.ts fromOrderRecord keeps only the card's
 * fields.
 *
 * Store-wide, not per visitor, so it is cached and shared: minutes, under the
 * delivered tag. Sent with the API key and no visitor address (`ip: null`), as
 * the depot and review lists are. Throws on failure, so a failure is never
 * cached.
 */

const BACKEND = (process.env.NEXT_OSS_BACKEND_URL ?? '').replace(/\/+$/, '')
const STORE_DOMAIN = process.env.NEXT_PUBLIC_STORE_DOMAIN ?? ''
const TIMEOUT_MS = 10_000

export const DELIVERED_PRODUCTS_MAX_PAGE_SIZE = 100

export async function fetchDeliveredProducts(page: number, pageSize: number): Promise<DeliveredProductList> {
  'use cache'
  cacheLife('minutes')
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.DELIVERED)

  if (!BACKEND) throw new Error('NEXT_OSS_BACKEND_URL is not set')
  const url = new URL(`${BACKEND}/api/orders/delivered-products`)
  url.searchParams.set('page', String(page))
  url.searchParams.set('page_size', String(pageSize))

  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'X-Store-Domain': STORE_DOMAIN,
      ...(await visitorAuthHeaders({ ip: null })),
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: 'no-store',
  })
  // Django answers a page past the end with 404 "Invalid page": an empty page, not a failure.
  if (res.status === 404 && page > 1) return { count: 0, next: null, previous: null, results: [] }
  if (!res.ok) throw new Error(`delivered products: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`)

  const body = (await res.json()) as Partial<DeliveredProductList>
  if (!Array.isArray(body.results)) throw new Error('delivered products: unexpected answer')
  return {
    count: typeof body.count === 'number' ? body.count : body.results.length,
    next: body.next ?? null,
    previous: body.previous ?? null,
    results: body.results,
  }
}
