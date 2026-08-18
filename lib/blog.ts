import { BLOG_ORDERING, DEFAULT_BLOG_IMAGE, DEFAULT_ORDERING, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/config/blog'
import type { BackendBlogSummary } from '@/types/blog'

// Stable, locale-fixed date formatting for blog dates so the server render and
// any hydration agree. The backend sends ISO datetime strings.
export function formatBlogDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

/**
 * The featured image, or the brand default.
 *
 * `featured_image` comes back as an **empty string, not null**, when unset —
 * which passes a plain truthiness check and then renders as a broken image.
 * Every render path goes through here rather than reading the field directly.
 */
export function blogImage(post: Pick<BackendBlogSummary, 'featured_image'> | null | undefined): string {
  const value = typeof post?.featured_image === 'string' ? post.featured_image.trim() : ''
  return value || DEFAULT_BLOG_IMAGE
}

/** Parse to an int in [1, MAX_PAGE_SIZE]; anything unusable → the default. */
export function clampPageSize(value: unknown): number {
  const n = Number.parseInt(String(value ?? ''), 10)
  if (!Number.isFinite(n)) return DEFAULT_PAGE_SIZE
  return Math.min(Math.max(n, 1), MAX_PAGE_SIZE)
}

/** Parse to a 1-based page number; anything unusable → 1. */
export function clampPage(value: unknown): number {
  const n = Number.parseInt(String(value ?? ''), 10)
  return Number.isFinite(n) && n > 0 ? n : 1
}

/**
 * Validate an ordering against BLOG_ORDERING, keeping any leading `-`.
 *
 * Unrecognised values fall back to the default rather than being passed
 * through, because the backend would accept them silently — see config/blog.ts.
 */
export function normalizeOrdering(value: unknown): string {
  const raw = typeof value === 'string' ? value.trim() : ''
  if (!raw) return DEFAULT_ORDERING

  const descending = raw.startsWith('-')
  const field = descending ? raw.slice(1) : raw

  return (BLOG_ORDERING as readonly string[]).includes(field) ? raw : DEFAULT_ORDERING
}
