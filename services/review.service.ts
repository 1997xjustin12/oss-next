import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_TAGS } from '@/config/cache'
import type { ContainerVariantKey } from '@/lib/containerVariant'
import type { ReviewListResponse } from '@/types/review'

const TARGET_SITE = 'https://onsitestorage.com'

export type ProductReview = {
  id:            number
  productId:     number
  productName:   string
  author:        string
  avatarUrl:     string
  text:          string
  date:          string
  formattedDate: string
  rating:        number
  verified:      boolean
}

export type ReviewsByVariantResult = {
  reviews:    ProductReview[]
  productIds: number[]
}

type RawReview = {
  id:                 number
  product_id:         number
  product_name:       string
  author:             string
  reviewer_name:      string
  userpic:            string
  content:            string
  review_text:        string
  date:               string
  rating:             number
  created_time_stamp: number
  formatted_date:     string
  verified:           string
}

type RawResponse = {
  reviews:     RawReview[]
  product_ids: number[]
}

// Wraps the WordPress endpoint the team built:
//   GET /wp-json/custom/v1/reviews-by-variant?variant[]=<20S|40S|40H>&limit=<int>
// `product_ids` in the raw response is every product ID that matched the
// variant filter (used internally by WP to pull reviews) — not needed by
// the UI today, but returned here in case a future caller wants it.
export async function getReviewsByVariant(
  variants: ContainerVariantKey[],
  limit = 3,
): Promise<ReviewsByVariantResult> {
  'use cache'
  cacheLife('hours')
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.REVIEWS)

  const params = new URLSearchParams()
  variants.forEach((v) => params.append('variant[]', v))
  params.set('limit', String(limit))

  const url = `${TARGET_SITE}/wp-json/custom/v1/reviews-by-variant?${params.toString()}`

  let data: RawResponse
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) })
    if (!res.ok) return { reviews: [], productIds: [] }
    data = await res.json()
  } catch {
    return { reviews: [], productIds: [] }
  }

  return {
    reviews: (data.reviews ?? []).map((r) => ({
      id:            r.id,
      productId:     r.product_id,
      productName:   r.product_name,
      author:        r.reviewer_name || r.author,
      avatarUrl:     r.userpic,
      text:          r.review_text || r.content,
      date:          r.date,
      formattedDate: r.formatted_date,
      rating:        r.rating,
      verified:      r.verified === 'Yes',
    })),
    productIds: data.product_ids ?? [],
  }
}

// ── OSS backend reviews (future source — table is currently empty) ──────────
// Distinct from getReviewsByVariant above, which reads from WordPress. Once
// the new backend's reviews table has real data, the PDP reviews section can
// switch over to these instead.

const OSS_BACKEND_URL = process.env.NEXT_OSS_BACKEND_URL
const STORE_DOMAIN    = process.env.NEXT_PUBLIC_STORE_DOMAIN

const REVIEWS_LIST_URL   = `${OSS_BACKEND_URL}api/reviews/list`
const REVIEWS_CREATE_URL = `${OSS_BACKEND_URL}api/reviews/create`
const reviewsUpdateUrl   = (id: string | number) => `${OSS_BACKEND_URL}api/reviews/${id}/update`

export type CreateReviewPayload = {
  product: string | number
  rating:  number
  title:   string
  comment: string
}

// Query params confirmed via docs/reference/REVIEWS_FLOW.md: product_id (omit for a
// site-wide feed — not used by this app yet) + page (default 1, no
// page_size ever sent). Response shape itself is still unconfirmed against
// this app's own backend — table is empty, hasn't been exercised for real.
export async function listProductReviews(productId?: string | number, page = 1): Promise<ReviewListResponse> {
  const params = new URLSearchParams({ page: String(page) })
  if (productId) params.set('product_id', String(productId))

  const res = await fetch(`${REVIEWS_LIST_URL}?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Store-Domain': STORE_DOMAIN ?? '',
    },
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.error ?? data?.detail ?? 'Could not load reviews.')
  }

  return data as ReviewListResponse
}

// Backend puts duplicate-review and other cross-field validation errors under
// `non_field_errors` (DRF convention) rather than `error`/`detail` — confirmed
// via live test: submitting a second review for the same product/user returns
// {"non_field_errors": ["You have already reviewed this product."]}.
function extractReviewError(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return undefined
  const d = data as { error?: string; detail?: string; non_field_errors?: string[] }
  return d.error ?? d.detail ?? d.non_field_errors?.join(' ')
}

export async function createProductReview(payload: CreateReviewPayload, token?: string): Promise<unknown> {
  const res = await fetch(REVIEWS_CREATE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Store-Domain': STORE_DOMAIN ?? '',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(extractReviewError(data) ?? 'Could not submit review.')
  }

  return data
}

export async function updateProductReview(
  id: string | number,
  payload: Partial<CreateReviewPayload>,
  token?: string,
): Promise<unknown> {
  const res = await fetch(reviewsUpdateUrl(id), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Store-Domain': STORE_DOMAIN ?? '',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(extractReviewError(data) ?? 'Could not update review.')
  }

  return data
}
