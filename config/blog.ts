// Headless WordPress blog source. The blog install is a shared/centralized one
// serving several brands, so content is scoped to a single category — only that
// category's posts appear under /blogs.
export const BLOG_CONFIG = {
  /** WP REST base. This host disables pretty /wp-json permalinks for /posts, so
   *  the service uses the ?rest_route= form for posts (both forms work). */
  baseUrl: 'https://bbq-blog.onsitestorage.com',
  /** Brand category. Resolved slug -> id at runtime; the id is the fallback used
   *  only if the categories endpoint is unreachable (confirmed live: id 5). */
  categorySlug: 'onsite-storage',
  categoryFallbackId: 5,
  /** Card grid page size. */
  perPage: 12,
  /** Shown when a post has featured_media: 0 (no image). */
  defaultImage: '/images/logo/oss-logo.webp',
} as const
