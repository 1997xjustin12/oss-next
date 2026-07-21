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
