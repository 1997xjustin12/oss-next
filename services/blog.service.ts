import { load } from 'cheerio'
import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_TAGS } from '@/config/cache'
import { BLOG_CONFIG } from '@/config/blog'
import type { BlogList, BlogPost, BlogSummary, WpPost, WpYoast } from '@/types/blog'

// This host disables pretty /wp-json permalinks for /posts, so posts go through
// the ?rest_route= form; categories/media are fine on /wp-json.
const POSTS_API = `${BLOG_CONFIG.baseUrl}/index.php?rest_route=/wp/v2/posts`
const WPJSON = `${BLOG_CONFIG.baseUrl}/wp-json/wp/v2`
const TIMEOUT = 15_000

/** Decode HTML entities and strip tags to plain text — for titles and excerpts,
 *  which arrive entity-encoded (and excerpts wrapped in <p>). cheerio handles
 *  both without pulling in a separate entity library. */
function toText(html: string | undefined): string {
  if (!html) return ''
  return load(html).text().replace(/\s+/g, ' ').trim()
}

function normalizeSummary(post: WpPost): BlogSummary {
  const media = post._embedded?.['wp:featuredmedia']?.[0]
  const hasImage = post.featured_media > 0 && !!media?.source_url
  return {
    id: post.id,
    slug: post.slug,
    title: toText(post.title?.rendered),
    excerpt: toText(post.excerpt?.rendered),
    date: post.date,
    imageUrl: hasImage ? (media!.source_url as string) : BLOG_CONFIG.defaultImage,
    // alt_text is often empty on WP — fall back to the (decoded) title.
    imageAlt: toText(media?.alt_text) || toText(post.title?.rendered),
  }
}

function normalizeSeo(y: WpYoast | undefined) {
  return {
    title: y?.title,
    description: y?.description,
    ogTitle: y?.og_title,
    ogDescription: y?.og_description,
    ogImage: y?.og_image?.[0]?.url,
    twitterTitle: y?.twitter_title,
    twitterDescription: y?.twitter_description,
    twitterImage: y?.twitter_image,
  }
}

function normalizePost(post: WpPost): BlogPost {
  return {
    ...normalizeSummary(post),
    // Rendered as-is (first-party content) inside a scoped container on the page.
    contentHtml: post.content?.rendered ?? '',
    seo: normalizeSeo(post.yoast_head_json),
  }
}

/**
 * Resolve the brand category slug to its numeric id (the /posts endpoint filters
 * by id, not slug). Cached for a day; falls back to the known id if the lookup
 * is unreachable, so the blog keeps working through a brief categories-API blip.
 */
export async function getBlogCategoryId(): Promise<number> {
  'use cache'
  cacheLife('days')
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.BLOG)

  try {
    const res = await fetch(
      `${WPJSON}/categories?slug=${encodeURIComponent(BLOG_CONFIG.categorySlug)}&_fields=id,slug`,
      { signal: AbortSignal.timeout(TIMEOUT) },
    )
    if (res.ok) {
      const rows = (await res.json()) as { id?: number }[]
      if (Array.isArray(rows) && typeof rows[0]?.id === 'number') return rows[0].id
    }
  } catch {
    // fall through to the fallback id
  }
  return BLOG_CONFIG.categoryFallbackId
}

function buildPostsUrl(params: Record<string, string | number>): string {
  const qs = Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join('&')
  // POSTS_API already carries a query (?rest_route=), so append with &.
  return `${POSTS_API}&${qs}&_embed=1`
}

/**
 * One page of the brand's posts, scoped to the category. Pager counts come from
 * the WP response headers (X-WP-Total / X-WP-TotalPages), not the body. Degrades
 * to an empty page rather than throwing — an empty category, an out-of-range
 * page (WP answers 400), or a transient failure all render the empty state
 * instead of white-screening the route.
 */
export async function fetchBlogList(page: number, search?: string): Promise<BlogList> {
  'use cache'
  cacheLife('hours')
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.BLOG)

  const categoryId = await getBlogCategoryId()
  const url = buildPostsUrl({
    categories: categoryId,
    page,
    per_page: BLOG_CONFIG.perPage,
    ...(search ? { search } : {}),
  })

  const empty: BlogList = { posts: [], page, total: 0, totalPages: 0 }

  let res: Response
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) })
  } catch {
    return empty
  }

  if (!res.ok) {
    // 400 = page past the last one (rest_post_invalid_page_number) — legitimately
    // empty. Anything else we also treat as empty, but log it.
    if (res.status !== 400) console.error(`[blog] list ${res.status} for ${url}`)
    return empty
  }

  const total = Number(res.headers.get('x-wp-total') ?? 0)
  const totalPages = Number(res.headers.get('x-wp-totalpages') ?? 0)
  const rows = (await res.json()) as WpPost[]

  return {
    posts: Array.isArray(rows) ? rows.map(normalizeSummary) : [],
    page,
    total: Number.isFinite(total) ? total : 0,
    totalPages: Number.isFinite(totalPages) ? totalPages : 0,
  }
}

/**
 * A single post by slug, scoped to the category so a slug outside it can't be
 * rendered here. The endpoint returns an array — take [0]; null means 404.
 */
export async function fetchBlogPost(slug: string): Promise<BlogPost | null> {
  'use cache'
  cacheLife('hours')
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.BLOG)

  const categoryId = await getBlogCategoryId()
  const url = buildPostsUrl({ slug, categories: categoryId })

  let res: Response
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) })
  } catch {
    return null
  }
  if (!res.ok) return null

  const rows = (await res.json()) as WpPost[]
  const post = Array.isArray(rows) ? rows[0] : undefined
  return post ? normalizePost(post) : null
}

/**
 * Other posts in the same category for the detail page's "related" strip, with
 * the current post filtered out.
 */
export async function fetchRelatedPosts(excludeId: number): Promise<BlogSummary[]> {
  'use cache'
  cacheLife('hours')
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.BLOG)

  const categoryId = await getBlogCategoryId()
  const url = buildPostsUrl({ categories: categoryId, per_page: 5 })

  let res: Response
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) })
  } catch {
    return []
  }
  if (!res.ok) return []

  const rows = (await res.json()) as WpPost[]
  return (Array.isArray(rows) ? rows : [])
    .map(normalizeSummary)
    .filter((p) => p.id !== excludeId)
    .slice(0, 4)
}
