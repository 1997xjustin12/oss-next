import { load } from 'cheerio'
import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_TAGS } from '@/config/cache'
import { ROUTES } from '@/config/routes'
import { WP_BLOG_LIST_ARCHIVE } from '@/lib/data/wpBlogListArchive'
import { WP_BLOG_LIST_PAGE_COUNT, WP_BLOG_LIST_PER_PAGE } from '@/lib/data/wpBlogListPageCount'
import { fetchWpPage, pageTag } from '@/services/wp-pages.service'
import type { WpPage } from '@/services/wp-pages.service'
import type { WpBlogListPost } from '@/types/wpBlogList'

/**
 * WordPress's blog listing, /shipping-containers-blogs and /2 … /46.
 *
 * The backend converted only page 1 (as it stood in July 2026), so its
 * pager led to pages that never existed here. Every page is now page 1's
 * converted markup, its theme CSS and all, with the post grid and the pager
 * replaced: the posts come from WordPress's own listing, archived by
 * scripts/archive-wp-blog-list.mjs. Page 1 is rebuilt the same way, so the
 * pages agree with each other rather than page 1 being a July snapshot.
 */

/** The converted page this listing is built inside. */
export const WP_BLOG_LIST_SLUG = ['shipping-containers-blogs']

/** A listing page number from the URL, or null if there is no such page. */
export function parseWpBlogListPage(segment: string | undefined): number | null {
  if (segment === undefined) return 1
  // Exactly the form the pager links to: no "01", no "+2", and 1 has no number.
  if (!/^[1-9]\d*$/.test(segment)) return null
  const page = Number(segment)
  return page >= 2 && page <= WP_BLOG_LIST_PAGE_COUNT ? page : null
}

function postsOn(page: number): readonly WpBlogListPost[] {
  const start = (page - 1) * WP_BLOG_LIST_PER_PAGE
  return WP_BLOG_LIST_ARCHIVE.slice(start, start + WP_BLOG_LIST_PER_PAGE)
}

const escape = (text: string) =>
  text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c)

/** "2026-11-06" → "November 6, 2026", as WordPress printed it. */
function displayDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
}

/**
 * Through the image optimizer at grid-card widths: the archived originals are
 * 1920px WebP (~190 KB), shown at about 360px. The widths are from Next's
 * default image and device sizes, which next.config.ts leaves unchanged.
 */
function optimised(src: string, width: number): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`
}

/** One card, in the markup Elementor's Posts widget gave it, so the page's theme CSS styles it. */
function card(post: WpBlogListPost): string {
  const href = escape(post.path)
  const title = escape(post.title)
  const thumbnail = post.image
    ? `<a class="elementor-post__thumbnail__link" href="${href}" tabindex="-1"><div class="elementor-post__thumbnail">` +
      `<img loading="lazy" decoding="async" width="${post.imageWidth ?? 1920}" height="${post.imageHeight ?? 1080}"` +
      ` src="${escape(optimised(post.image, 640))}"` +
      ` srcset="${[384, 640, 828].map((w) => `${escape(optimised(post.image!, w))} ${w}w`).join(', ')}"` +
      ` sizes="(max-width: 767px) 46vw, (max-width: 1024px) 48vw, 358px"` +
      ` class="attachment-full size-full" alt="${escape(post.imageAlt || post.title)}"></div></a>`
    : ''
  return (
    `<article class="elementor-post elementor-grid-item post-${post.wpId} post type-post status-publish format-standard${post.image ? ' has-post-thumbnail' : ''} hentry category-blog" role="listitem">` +
    `<div class="elementor-post__card">${thumbnail}` +
    `<div class="elementor-post__text"><h2 class="elementor-post__title"><a href="${href}">${title}</a></h2>` +
    `<div class="elementor-post__excerpt"><p>${escape(post.excerpt)}</p></div></div>` +
    `<div class="elementor-post__meta-data"><span class="elementor-post-date">${displayDate(post.date)}</span></div>` +
    `</div></article>`
  )
}

/** WordPress's paginate_links(): first and last page, two either side of the current one, dots between. */
function pager(page: number): string {
  const last = WP_BLOG_LIST_PAGE_COUNT
  const link = (n: number, label: string, cls = 'page-numbers') => `<a class="${cls}" href="${ROUTES.WP_BLOG_LIST_PAGE(n)}">${label}</a>`
  const numbered = (n: number) => `<span class="elementor-screen-only">Page</span>${n}`

  const parts: string[] = []
  parts.push(page > 1 ? link(page - 1, '« Previous', 'page-numbers prev') : '<span class="page-numbers prev">« Previous</span>')
  let dotted = false
  for (let n = 1; n <= last; n++) {
    if (n === page) {
      parts.push(`<span aria-current="page" class="page-numbers current">${numbered(n)}</span>`)
      dotted = false
    } else if (n === 1 || n === last || Math.abs(n - page) <= 2) {
      parts.push(link(n, numbered(n)))
      dotted = false
    } else if (!dotted) {
      parts.push('<span class="page-numbers dots">…</span>')
      dotted = true
    }
  }
  parts.push(page < last ? link(page + 1, 'Next »', 'page-numbers next') : '<span class="page-numbers next">Next »</span>')
  return `<nav class="elementor-pagination" aria-label="Pagination">${parts.join('\n')}</nav>`
}

/**
 * One listing page, ready for WordPressPageView. Null when the number is out of
 * range, or when the converted page 1 is missing or no longer has the post
 * grid this rewrites (then the pages would show nothing of the archive).
 */
export async function getWpBlogListPage(page: number): Promise<WpPage | null> {
  'use cache'
  cacheLife('days')
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.PAGES, pageTag(WP_BLOG_LIST_SLUG))

  if (!Number.isInteger(page) || page < 1 || page > WP_BLOG_LIST_PAGE_COUNT) return null
  const shell = await fetchWpPage(WP_BLOG_LIST_SLUG)
  if (!shell) return null

  const $ = load(shell.content, null, false)
  const grid = $('.elementor-posts-container').first()
  if (!grid.length) {
    console.error('[wp-blog-list] the converted listing has no .elementor-posts-container; cannot render page', page)
    return null
  }
  // Page 1's LCP preloads can include an image from its own July grid, which
  // no page shows any more. The rest (the banner) is the same on every page.
  const gridImages = new Set(grid.find('img').map((_, img) => $(img).attr('src')).get())
  grid.html(postsOn(page).map(card).join('\n'))

  const nav = $('nav.elementor-pagination').first()
  if (nav.length) nav.replaceWith(pager(page))
  else grid.after(pager(page))

  return {
    ...shell,
    content: $.html(),
    preloads: shell.preloads.filter((href) => !gridImages.has(href)),
  }
}
