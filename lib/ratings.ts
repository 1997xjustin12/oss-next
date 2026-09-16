/**
 * The Elasticsearch `ratings` field used to be a bare number. The backend now
 * indexes an object carrying the aggregate and its review count:
 *
 *   "ratings": { "rating": 4, "review_count": 3 }
 *
 * Reading `.toFixed()` straight off that object is what threw
 * `TypeError: rating.toFixed is not a function` on the PDP.
 *
 * This normalises both shapes: documents reindexed since the change, and any
 * still carrying the old bare number (or a numeric string, as the WordPress
 * source did). Every read of `ratings` should go through here.
 */

import { GOOGLE_REVIEW_STATS } from '@/config/reviews'

export interface ProductRatings {
  rating: number
  review_count: number
}

/** What the index may hold for `ratings`, across old and new documents. */
export type RawRatings = ProductRatings | number | string | null | undefined

export interface NormalisedRating {
  /** Average score, 0 when absent. */
  value: number
  /** Number of reviews behind it — 0 for legacy documents, which had none. */
  count: number
}

function toNumber(val: unknown): number {
  const n = typeof val === 'number' ? val : Number(val)
  return Number.isFinite(n) ? n : 0
}

/**
 * What to show a visitor: the product's own rating, or the company's Google
 * rating when it has none.
 *
 * Most of the catalogue has no reviews of its own, and a bare 0 with empty
 * stars reads as "rated zero" rather than "not rated yet". The product page has
 * shown the Google rating in that case since `2e87a95`; the listing kept
 * showing the 0, which is the same product described two different ways.
 */
export function displayRating(ratings: RawRatings): NormalisedRating & { fromGoogle: boolean } {
  const own = normaliseRating(ratings)
  if (own.value > 0) return { ...own, fromGoogle: false }
  return { value: GOOGLE_REVIEW_STATS.rating, count: GOOGLE_REVIEW_STATS.count, fromGoogle: true }
}

export function normaliseRating(ratings: RawRatings): NormalisedRating {
  if (ratings && typeof ratings === 'object') {
    return {
      value: toNumber((ratings as ProductRatings).rating),
      count: toNumber((ratings as ProductRatings).review_count),
    }
  }
  // Legacy bare number/string — no review count existed alongside it.
  return { value: toNumber(ratings), count: 0 }
}
