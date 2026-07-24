// ── Raw WordPress REST shapes (only the fields we read) ─────────────────────

interface WpRendered {
  rendered: string
}

interface WpMedia {
  source_url?: string
  alt_text?: string
}

export interface WpYoast {
  title?: string
  description?: string
  og_title?: string
  og_description?: string
  og_image?: { url: string }[]
  twitter_title?: string
  twitter_description?: string
  twitter_image?: string
}

export interface WpPost {
  id: number
  slug: string
  date: string
  title: WpRendered
  excerpt: WpRendered
  content: WpRendered
  featured_media: number
  categories: number[]
  yoast_head_json?: WpYoast
  _embedded?: {
    'wp:featuredmedia'?: WpMedia[]
  }
}

// ── Normalized shapes the UI consumes (entities decoded, tags stripped) ──────

/** SEO fields lifted from yoast_head_json, all optional. */
export interface BlogSeo {
  title?: string
  description?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
}

/** Card-level fields — title decoded to plain text, excerpt tag-stripped. */
export interface BlogSummary {
  id: number
  slug: string
  title: string
  excerpt: string
  date: string
  imageUrl: string
  imageAlt: string
}

/** Full article — summary plus raw content HTML and SEO metadata. */
export interface BlogPost extends BlogSummary {
  contentHtml: string
  seo: BlogSeo
}

/** A page of the list, with pager info read from the WP response headers. */
export interface BlogList {
  posts: BlogSummary[]
  page: number
  total: number
  totalPages: number
}
