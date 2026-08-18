// Blog source: the Django backend's /api/blogs/ endpoints.
//
// This replaced a direct headless-WordPress integration. The old path had to
// resolve a category slug to an id before it could ask for posts, then read
// pager totals out of X-WP-* response headers, and it had no SEO object — the
// backend endpoint returns the image URL inline, carries `seo`, and does the
// brand scoping itself. See docs/reference/BLOGS_IMPLEMENTATION.md.
//
// Do not reintroduce the WordPress path.

/** Backend default page size, and what the card grid asks for. */
export const DEFAULT_PAGE_SIZE = 12

/** Backend hard maximum. Asking for more is clamped, not rejected. */
export const MAX_PAGE_SIZE = 50

/**
 * Fields the backend will sort by. Prefix with `-` to reverse.
 *
 * Validated client-side because the backend *silently ignores* an unrecognised
 * ordering — it answers 200 in the default order rather than complaining, so a
 * typo looks like it worked while sorting by something else entirely.
 */
export const BLOG_ORDERING = ['published_at', 'updated_at', 'created_at', 'title'] as const

export type BlogOrdering = (typeof BLOG_ORDERING)[number]

export const DEFAULT_ORDERING = '-published_at'

/** Shown when a post has no featured image. */
export const DEFAULT_BLOG_IMAGE = '/images/logo/oss-logo.webp'

/**
 * Related posts shown under an article.
 *
 * The fetch asks for RELATED_COUNT + 1 because the current post is itself
 * likely to be in the newest set; one extra means filtering it out still leaves
 * a full row.
 */
export const RELATED_COUNT = 4

/** Runaway guard for the sitemap's page-through. */
export const MAX_SITEMAP_PAGES = 40
