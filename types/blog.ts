// ── Raw shapes from the Django blogs API (only the fields we read) ───────────
//
// GET {BACKEND}/api/blogs/            → BackendBlogEnvelope of BackendBlogSummary
// GET {BACKEND}/api/blogs/{slug}/     → BackendBlogDetail
//
// The list and the detail endpoints do NOT return the same object: `html`,
// `content` and `seo` exist only on the detail. Modelling that as two types
// rather than one with optional fields is what stops a card component from
// reaching for `post.html` and silently getting undefined.

/** Standard DRF pagination envelope. */
export interface BackendBlogEnvelope<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface BackendBlogSummary {
  id: number
  slug: string
  title: string
  excerpt: string
  /** Empty string — not null — when unset. See blogImage() in lib/blog.ts. */
  featured_image: string
  published_at: string
  updated_at: string
}

export interface BackendBlogSeo {
  title?: string
  description?: string
  canonical_url?: string
  og_title?: string
  og_description?: string
  og_image?: string
}

export interface BackendBlogDetail extends BackendBlogSummary {
  /** The body markup. This is what gets rendered. */
  html: string
  /**
   * A structured object, NOT markup — the editor's block tree. Rendering it is
   * a bug, which is why it is typed `unknown` rather than something a caller
   * could accidentally interpolate into HTML.
   */
  content?: unknown
  seo?: BackendBlogSeo
}

// ── Normalized shapes the UI consumes ───────────────────────────────────────

/** SEO fields lifted from the backend's `seo` object, all optional. */
export interface BlogSeo {
  title?: string
  description?: string
  canonicalUrl?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
}

/** Card-level fields — everything the list endpoint can supply. */
export interface BlogSummary {
  id: number
  slug: string
  title: string
  excerpt: string
  /** ISO date, from `published_at`. */
  date: string
  /** ISO date, from `updated_at` — the sitemap's lastModified. */
  updatedAt: string
  /** Never empty: falls back to the default image. */
  imageUrl: string
  imageAlt: string
}

/** Full article — summary plus the body markup and SEO metadata. */
export interface BlogPost extends BlogSummary {
  contentHtml: string
  seo: BlogSeo
}

/**
 * A page of the list, carrying the resolved paging values alongside the
 * backend envelope. A paginator needs `page` and `totalPages`, and every caller
 * would otherwise recompute them from `count` and the page size it passed in.
 */
export interface BlogList {
  posts: BlogSummary[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}
