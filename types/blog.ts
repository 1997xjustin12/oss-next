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
  /** Alt text for the featured image. Empty or absent when unset. */
  featured_image_alt?: string
  /** The byline, e.g. "Gregg Schoenborn". */
  author_name?: string
  published_at: string
  updated_at: string
}

export interface BackendBlogSeo {
  title?: string
  description?: string
  /** The editor's focus keyphrase — the post's keywords. */
  focus_keyphrase?: string
  /** Empty string when unset: our own URL is then the canonical. */
  canonical_url?: string
  og_title?: string
  og_description?: string
  og_image?: string
  og_image_alt?: string
}

/** One FAQ entry as the editor wrote it. */
export interface BackendBlogFaq {
  question: string
  /** Plain text — what the FAQPage structured data uses. */
  answer: string
  /** The same answer as markup — what the page renders. */
  answer_html?: string
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
  faqs?: BackendBlogFaq[]
}

// ── Normalized shapes the UI consumes ───────────────────────────────────────

/** SEO fields lifted from the backend's `seo` object, all optional. */
export interface BlogSeo {
  title?: string
  description?: string
  keywords?: string
  canonicalUrl?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogImageAlt?: string
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
  /** The byline. Empty when the backend gives none. */
  author: string
}

/** An FAQ entry, ready to render. */
export interface BlogFaq {
  question: string
  /** Plain text, for the FAQPage structured data. */
  answer: string
  /** Sanitized markup, for the page. */
  answerHtml: string
}

/** Full article — summary plus the body markup, SEO metadata and FAQs. */
export interface BlogPost extends BlogSummary {
  contentHtml: string
  seo: BlogSeo
  /** Empty when the post has none. */
  faqs: BlogFaq[]
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
