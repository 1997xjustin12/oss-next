import { load } from 'cheerio'
import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_TAGS } from '@/config/cache'
import { MAX_PAGE_SIZE, MAX_SITEMAP_PAGES } from '@/config/blog'
import { STORE_KEY } from '@/config/store'
import { blogImage, clampPage, clampPageSize, normalizeOrdering } from '@/lib/blog'
import type {
  BackendBlogDetail,
  BackendBlogEnvelope,
  BackendBlogSeo,
  BackendBlogSummary,
  BlogList,
  BlogPost,
  BlogSummary,
} from '@/types/blog'

// The only module that talks to the blogs backend. Every read, every bit of
// validation and the brand scoping all live here — see
// docs/reference/BLOGS_IMPLEMENTATION.md.

const BACKEND = (process.env.NEXT_OSS_BACKEND_URL ?? '').replace(/\/+$/, '')
const API_KEY = process.env.NEXT_OSS_BACKEND_KEY
const TIMEOUT = 15_000

/**
 * Prepare a post's body HTML for inline rendering:
 *  - Remove script/iframe tags. Injected through dangerouslySetInnerHTML,
 *    embedded scripts run on initial parse and can break client-side
 *    navigation (the same class of bug fixed for the WP catch-all in
 *    wp-pages.service.ts). The content is first-party, but keeping both render
 *    paths identical means one fix covers both.
 *  - Lazy-load and async-decode in-body images that don't already say so. The
 *    article hero is a real next/image; this only touches images inside the
 *    CMS markup.
 */
function processContent(html: string | undefined): string {
  if (!html) return ''
  const $ = load(html, null, false)
  $('script, iframe').remove()
  $('img').each((_, el) => {
    const img = $(el)
    if (!img.attr('loading')) img.attr('loading', 'lazy')
    if (!img.attr('decoding')) img.attr('decoding', 'async')
  })
  return $.html()
}

function normalizeSummary(post: BackendBlogSummary): BlogSummary {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title ?? '',
    excerpt: post.excerpt ?? '',
    date: post.published_at ?? '',
    updatedAt: post.updated_at ?? post.published_at ?? '',
    imageUrl: blogImage(post),
    // The backend carries no alt text for the featured image; the title is a
    // truthful description of what the image illustrates, and beats an empty
    // alt on a card that is itself a link.
    imageAlt: post.title ?? '',
  }
}

function normalizeSeo(seo: BackendBlogSeo | undefined) {
  return {
    title: seo?.title,
    description: seo?.description,
    canonicalUrl: seo?.canonical_url,
    ogTitle: seo?.og_title,
    ogDescription: seo?.og_description,
    ogImage: seo?.og_image,
  }
}

function normalizePost(post: BackendBlogDetail): BlogPost {
  return {
    ...normalizeSummary(post),
    // `post.html` — never `post.content`, which is a structured block tree.
    contentHtml: processContent(post.html),
    seo: normalizeSeo(post.seo),
  }
}

type FetchResult<T> = { ok: boolean; status: number; data: T | null }

/**
 * One request to the blogs backend.
 *
 * **Never throws.** A blog listing that 500s the whole page because the backend
 * hiccuped is worse than one that renders empty — the rest of the storefront is
 * fine, and the caller decides what an absent result means.
 */
async function backendFetch<T>(path: string): Promise<FetchResult<T>> {
  if (!BACKEND || !API_KEY) {
    console.error('[blog] NEXT_OSS_BACKEND_URL or NEXT_OSS_BACKEND_KEY is unset — cannot read blogs.')
    return { ok: false, status: 503, data: null }
  }

  try {
    const res = await fetch(`${BACKEND}${path}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Api-Key ${API_KEY}`,
      },
      signal: AbortSignal.timeout(TIMEOUT),
    })

    if (!res.ok) return { ok: false, status: res.status, data: null }
    return { ok: true, status: res.status, data: (await res.json()) as T }
  } catch (err) {
    console.error(`[blog] request failed for ${path}:`, err)
    return { ok: false, status: 502, data: null }
  }
}

/**
 * Brand scoping.
 *
 * `store` is deliberately not a parameter on any exported function and not a
 * query parameter on /api/blogs — this deployment is exactly one brand and
 * already knows which. Accepting it from a caller would mean `?store=solana`
 * on this storefront returns another brand's posts, reachable by anyone who can
 * edit a query string.
 *
 * It goes on the detail request too, not only the list: without it a foreign
 * article URL would render here under our own domain.
 */
function storeParam(): string {
  return `store=${encodeURIComponent(STORE_KEY)}`
}

export interface BlogQuery {
  page?: number | string
  pageSize?: number | string
  ordering?: string
  category?: string
  search?: string
}

/**
 * One page of this brand's posts.
 *
 * A single function covers list, filter, search, paginate and sort because they
 * are all the same request with different query parameters; four near-identical
 * fetches would drift apart the first time the contract changed.
 *
 * A 404 means a page past the end — something a visitor reaches just by editing
 * the URL — so it returns an empty page rather than an error, and is not logged.
 */
export async function getBlogs(opts: BlogQuery = {}): Promise<BlogList> {
  const page = clampPage(opts.page)
  const pageSize = clampPageSize(opts.pageSize)
  const ordering = normalizeOrdering(opts.ordering)

  const params = [
    storeParam(),
    `page=${page}`,
    `page_size=${pageSize}`,
    `ordering=${encodeURIComponent(ordering)}`,
  ]
  if (opts.category?.trim()) params.push(`category=${encodeURIComponent(opts.category.trim())}`)
  if (opts.search?.trim()) params.push(`search=${encodeURIComponent(opts.search.trim())}`)

  const empty: BlogList = { posts: [], count: 0, page, pageSize, totalPages: 0 }

  const { ok, status, data } = await backendFetch<BackendBlogEnvelope<BackendBlogSummary>>(
    `/api/blogs/?${params.join('&')}`,
  )

  if (!ok || !data) {
    if (status !== 404) console.error(`[blog] list returned ${status}`)
    return empty
  }

  const results = Array.isArray(data.results) ? data.results : []
  const count = Number.isFinite(data.count) ? data.count : results.length

  return {
    posts: results.map(normalizeSummary),
    count,
    page,
    pageSize,
    // Zero posts means zero pages, not one — a paginator that believes there is
    // always at least one page renders controls over an empty grid.
    totalPages: count > 0 ? Math.ceil(count / pageSize) : 0,
  }
}

/**
 * One post by slug, with its body and SEO.
 *
 * Returns null when the slug does not exist **or belongs to another brand**, so
 * the caller can hand that straight to notFound(). The brand check is the
 * backend's own `store` filter rather than a comparison against the returned
 * record: a post can carry `https://onsitestorage.com` while this deployment's
 * env says `https://www.onsitestorage.com`, and a string comparison would
 * reject a legitimate post.
 */
export async function getBlog(slug: string): Promise<BlogPost | null> {
  const clean = slug?.trim()
  if (!clean) return null

  const { ok, status, data } = await backendFetch<BackendBlogDetail>(
    `/api/blogs/${encodeURIComponent(clean)}/?${storeParam()}`,
  )

  if (!ok || !data) {
    if (status !== 404) console.error(`[blog] detail "${clean}" returned ${status}`)
    return null
  }

  return normalizePost(data)
}

// ── Cached variants ─────────────────────────────────────────────────────────
//
// Separate exports rather than a flag, and deliberately no cached search: a
// cache keys on its arguments, so caching a search would write one entry per
// search term and quietly fill the cache with single-use records. Callers with
// a search string use getBlogs() directly and take the uncached round trip.
//
// The brand is baked into every request by storeParam(), so cross-brand bleed
// is impossible even though the cache is shared across storefronts.

export async function getCachedBlogs(opts: Omit<BlogQuery, 'search'> = {}): Promise<BlogList> {
  'use cache'
  cacheLife('hours')
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.BLOG)

  return getBlogs(opts)
}

export async function getCachedBlog(slug: string): Promise<BlogPost | null> {
  'use cache'
  cacheLife('hours')
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.BLOG)

  return getBlog(slug)
}

/**
 * Other recent posts for the article page's "related" strip.
 *
 * Asks for one more than it needs because the current post is itself likely to
 * be in the newest set; filtering it out then still leaves a full row.
 */
export async function getRelatedPosts(excludeSlug: string, count: number): Promise<BlogSummary[]> {
  'use cache'
  cacheLife('hours')
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.BLOG)

  const { posts } = await getBlogs({ pageSize: count + 1 })
  return posts.filter((post) => post.slug !== excludeSlug).slice(0, count)
}

/**
 * Every post's slug + last-modified for the sitemap.
 *
 * Returns [] on any failure so a backend blip can't break the whole sitemap.
 */
export async function getAllBlogSlugs(): Promise<{ slug: string; modified?: string }[]> {
  'use cache'
  cacheLife('hours')
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.BLOG)

  const out: { slug: string; modified?: string }[] = []

  for (let page = 1; page <= MAX_SITEMAP_PAGES; page++) {
    const { posts, totalPages } = await getBlogs({ page, pageSize: MAX_PAGE_SIZE })
    if (posts.length === 0) break

    for (const post of posts) out.push({ slug: post.slug, modified: post.updatedAt || undefined })
    if (page >= totalPages) break
  }

  return out
}
