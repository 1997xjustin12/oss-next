import type { Review } from '@/config/reviews'

/**
 * Store reviews from REVIEWS.io, for the homepage — the same reviews the
 * WordPress homepage shows through the WP Review Slider Pro plugin, which has
 * no API of its own to read them from.
 *
 * Pure: the fetch lives in services/review.service.ts (getStoreReviews).
 */

/** The store's public REVIEWS.io page — where each card's attribution links. */
export const REVIEWS_IO_STORE_URL = 'https://www.reviews.io/company-reviews/store/www.onsitestorage.com'

/** Below this the WordPress slider shows nothing; neither does this. */
export const MIN_STORE_REVIEW_RATING = 4

/** One review as GET api.reviews.io/merchant/reviews returns it (fields read). */
export type RawStoreReview = {
  store_review_id: number
  comments?: string | null
  rating?: number | string | null
  date_created?: string | null
  reviewer?: { first_name?: string | null; last_name?: string | null } | null
}

/**
 * A REVIEWS.io review as a homepage card, or null when it should not be shown:
 * under 4 stars (as the WordPress slider), or no text to show.
 */
export function toStoreReview(raw: RawStoreReview): Review | null {
  const rating = Number(raw.rating)
  const text = raw.comments?.trim() ?? ''
  if (!(rating >= MIN_STORE_REVIEW_RATING) || !text) return null

  const name = [raw.reviewer?.first_name, raw.reviewer?.last_name]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ')

  return {
    id: `reviews.io-${raw.store_review_id}`,
    name: name || 'Verified customer',
    avatar: '',
    rating: Math.min(5, Math.round(rating)),
    date: formatReviewDate(raw.date_created),
    text,
    source: 'reviews.io',
    url: REVIEWS_IO_STORE_URL,
  }
}

/** "2026-10-19 16:40:38" → "Oct 19, 2026", like the Google list. Empty if unparseable. */
export function formatReviewDate(value: string | null | undefined): string {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return ''
  const [, y, m, d] = match.map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/**
 * Two review lists woven together — one from each in turn, then whatever is
 * left of the longer — so neither source fills the first screens on its own.
 */
export function mixReviews(first: readonly Review[], second: readonly Review[]): Review[] {
  const mixed: Review[] = []
  for (let i = 0; i < Math.max(first.length, second.length); i++) {
    if (i < first.length) mixed.push(first[i])
    if (i < second.length) mixed.push(second[i])
  }
  return mixed
}

/** "Tommy Slagle" → "TS", for a card without a photo. */
export function reviewerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts.at(-1)![0] : '')).toUpperCase() || '?'
}
