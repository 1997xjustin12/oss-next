// One-off: copies WordPress's blog listing (/shipping-containers-blogs/ and its
// numbered pages) into lib/data/wpBlogListArchive.ts.
//
// Why: the backend converted only the listing's first page, as it stood in
// July 2026, and none of its numbered pages, so the pager on it led to 404s.
// WordPress's listing is the only place the order, excerpts and dates of the
// old posts exist together. 541 posts on 46 pages on 2026-11-16, newest first.
// The listing route (app/(market)/shipping-containers-blogs) renders every
// page, page 1 included, from this copy inside the converted page 1's markup.
//
// Not part of the build: WordPress is going away, and the copy is the record
// from then on. New posts belong to the native blog (/blogs). Run it again
// only to re-take the copy while WordPress is up:
//
//   node scripts/archive-wp-blog-list.mjs [origin]
//
// Links are stored as paths on this site. A post this app serves from the
// native blog instead (the newest few) links to /blogs/<slug>; anything else
// keeps its WordPress path, which the catch-all or a redirect answers. It
// refuses to write fewer posts than the file already holds.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const ORIGIN = (process.argv[2] ?? 'https://old.onsitestorage.com').replace(/\/+$/, '')
const LIST = '/shipping-containers-blogs'
const records = new URL('../lib/data/wpBlogListArchive.ts', import.meta.url)
const count = new URL('../lib/data/wpBlogListPageCount.ts', import.meta.url)

function env(name) {
  if (process.env[name]) return process.env[name]
  for (const file of ['../.env.local', '../.env']) {
    try {
      const line = readFileSync(new URL(file, import.meta.url), 'utf8').split(/\r?\n/).find((l) => l.startsWith(`${name}=`))
      if (line) return line.slice(name.length + 1).trim().replace(/^["']|["']$/g, '')
    } catch {}
  }
  return undefined
}

const decode = (s) =>
  s
    .replace(/&#0?38;|&amp;/g, '&')
    .replace(/&#8217;|&#039;|&#39;/g, '’')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8230;|&hellip;/g, '…')
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()

/** "November 6, 2026" → "2026-11-06", read as a calendar date (no time zone). */
function isoDate(text) {
  const m = text.match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/)
  if (!m) return null
  const month = new Date(`${m[1]} 1, 2000`).getMonth() + 1
  if (!month) return null
  return `${m[3]}-${String(month).padStart(2, '0')}-${m[2].padStart(2, '0')}`
}

/**
 * Jetpack's i0.wp.com proxy in front of the Space → the Space's CDN host, the
 * one next.config.ts lets the image optimizer fetch (the same files).
 */
function cdnUrl(src) {
  let url = new URL(decode(src))
  if (/^i\d\.wp\.com$/.test(url.hostname)) url = new URL(`https://${url.pathname.slice(1)}`)
  url.search = ''
  url.hostname = url.hostname.replace(/^([^.]+)\.([a-z0-9]+)\.digitaloceanspaces\.com$/, '$1.$2.cdn.digitaloceanspaces.com')
  return url.toString()
}

/** Slugs the native blog serves, so those posts link to /blogs/<slug>. */
async function nativeBlogSlugs() {
  const backend = env('NEXT_OSS_BACKEND_URL')?.replace(/\/+$/, '')
  const key = env('NEXT_OSS_BACKEND_KEY')
  const store = env('NEXT_PUBLIC_STORE_KEY')?.trim().toLowerCase() || 'onsite'
  if (!backend || !key) throw new Error('NEXT_OSS_BACKEND_URL / NEXT_OSS_BACKEND_KEY are needed to tell native posts apart')
  const slugs = new Set()
  for (let page = 1; ; page++) {
    const res = await fetch(`${backend}/api/blogs/?store=${store}&page=${page}&page_size=50`, { headers: { Authorization: `Api-Key ${key}` } })
    if (res.status === 404) break
    if (!res.ok) throw new Error(`blogs API: HTTP ${res.status}`)
    const data = await res.json()
    for (const post of data.results ?? []) slugs.add(post.slug)
    if (!data.next) break
  }
  return slugs
}

const native = await nativeBlogSlugs()
const posts = []
let pages = 0

for (let n = 1; ; n++) {
  const url = `${ORIGIN}${LIST}/${n === 1 ? '' : `${n}/`}`
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (archive of the blog listing)' }, redirect: 'manual', signal: AbortSignal.timeout(60_000) })
  if (res.status !== 200) break
  const html = await res.text()
  // WordPress answers a page past the end with the last real one (or a 404).
  const current = html.match(/aria-current="page" class="page-numbers current"><span[^>]*>Page<\/span>(\d+)/)?.[1]
  if (n > 1 && current !== String(n)) break
  const cards = [...html.matchAll(/<article[\s\S]*?<\/article>/g)].map((m) => m[0])
  if (!cards.length) break
  pages = n

  for (const card of cards) {
    const href = card.match(/elementor-post__title">\s*<a href="([^"]+)"/)?.[1]
    const date = isoDate(decode(card.match(/elementor-post-date">([\s\S]*?)<\/span>/)?.[1] ?? ''))
    const wpId = card.match(/\bpost-(\d+)\b/)?.[1]
    if (!href || !date || !wpId) throw new Error(`page ${n}: unreadable card\n${card.slice(0, 400)}`)

    let path = new URL(href).pathname.replace(/\/+$/, '')
    const slug = path.slice(1)
    if (native.has(slug)) path = `/blogs/${slug}`

    const img = card.match(/<img[^>]*>/)?.[0]
    const attr = (name) => img?.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1]
    posts.push({
      wpId: Number(wpId),
      path,
      title: decode(card.match(/elementor-post__title">\s*<a[^>]*>([\s\S]*?)<\/a>/)?.[1] ?? ''),
      excerpt: decode(card.match(/elementor-post__excerpt">([\s\S]*?)<\/div>/)?.[1] ?? ''),
      date,
      ...(img
        ? {
            image: cdnUrl(attr('src')),
            imageAlt: decode(attr('alt') ?? ''),
            imageWidth: Number(attr('width')) || 1920,
            imageHeight: Number(attr('height')) || 1080,
          }
        : {}),
    })
  }
}

if (!posts.length) throw new Error(`no posts read from ${ORIGIN}${LIST}/`)
if (new Set(posts.map((p) => p.wpId)).size !== posts.length) throw new Error('a post appears twice: the listing changed while it was being read; run again')
if (existsSync(records)) {
  const had = (readFileSync(records, 'utf8').match(/"wpId":/g) ?? []).length
  if (posts.length < had) throw new Error(`found ${posts.length} posts, the archive holds ${had}: not overwriting`)
}

writeFileSync(
  records,
  `// Generated by scripts/archive-wp-blog-list.mjs from ${ORIGIN}${LIST}/
// WordPress's blog listing, copied once, in its own order (newest first).
// Server-only: read through services/wpBlogList.service.ts.
import type { WpBlogListPost } from '@/types/wpBlogList'

export const WP_BLOG_LIST_TAKEN_AT = '${new Date().toISOString()}'

export const WP_BLOG_LIST_ARCHIVE: readonly WpBlogListPost[] = [
${posts.map((p) => `  ${JSON.stringify(p)},`).join('\n')}
]
`,
)

const perPage = Math.ceil(posts.length / pages)
writeFileSync(
  count,
  `// Generated by scripts/archive-wp-blog-list.mjs. A plain number with no
// imports, so config/routes.ts can claim the listing's pages without loading
// the archive itself (lib/data/wpBlogListArchive.ts).

/** Posts per listing page, as WordPress paged them. */
export const WP_BLOG_LIST_PER_PAGE = ${perPage}

/** Pages in the archived listing: /shipping-containers-blogs, then /2 … /${pages}. */
export const WP_BLOG_LIST_PAGE_COUNT = ${pages}
`,
)

console.log(`${posts.length} posts on ${pages} pages (${perPage} per page); ${posts.filter((p) => p.path.startsWith('/blogs/')).length} link to the native blog`)
