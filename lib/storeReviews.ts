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
 * Review lists woven together — one from each in turn, then whatever is left
 * of the longer ones — so no source fills the first screens on its own.
 */
export function mixReviews(...lists: readonly (readonly Review[])[]): Review[] {
  const mixed: Review[] = []
  const longest = Math.max(0, ...lists.map((list) => list.length))
  for (let i = 0; i < longest; i++) {
    for (const list of lists) if (i < list.length) mixed.push(list[i])
  }
  return mixed
}

// ── This site's own reviews (the Django backend) ────────────────────────────

/**
 * One review as GET {backend}/api/reviews/list returns it (fields read). The
 * shape is from the reference implementation (docs/reference/REVIEWS_FLOW.md)
 * and not yet seen live — the feed is empty — so every field is optional.
 */
export type RawBackendReview = {
  id: number | string
  rating?: number | string | null
  title?: string | null
  comment?: string | null
  created_at?: string | null
  user?: { username?: string | null; first_name?: string | null; last_name?: string | null } | null
}

/**
 * A backend review as a homepage card, or null when it should not be shown:
 * under 4 stars, or no text. Never shows an email address — a username can be
 * one, so that falls back to a neutral name.
 */
export function toBackendReview(raw: RawBackendReview): Review | null {
  const rating = Number(raw.rating)
  const text = raw.comment?.trim() || raw.title?.trim() || ''
  if (!(rating >= MIN_STORE_REVIEW_RATING) || !text) return null

  const fullName = [raw.user?.first_name, raw.user?.last_name]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ')
  const username = raw.user?.username?.trim() ?? ''
  const name = fullName || (username && !username.includes('@') ? username : '') || 'Verified buyer'

  return {
    id: `onsite-${raw.id}`,
    name,
    avatar: '',
    rating: Math.min(5, Math.round(rating)),
    date: formatReviewDate(raw.created_at),
    text,
    source: 'onsite',
  }
}

/** "Tommy Slagle" → "TS", for a card without a photo. */
export function reviewerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts.at(-1)![0] : '')).toUpperCase() || '?'
}
