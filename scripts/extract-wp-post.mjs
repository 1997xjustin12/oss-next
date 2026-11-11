// Turns a WordPress blog post into a fixed-article content file, the way
// /shipping-container-dimensions was carried over (docs/reference/
// wordpress-to-next-pages.md, "fixed article"). For posts served at the site
// root that the backend never imported, so they 404 on the new site.
//
//   node scripts/extract-wp-post.mjs <slug> <CONST_PREFIX> <lib/data/file.ts>
//   node scripts/extract-wp-post.mjs shipping-container-office CONTAINER_OFFICE lib/data/containerOfficeContent.ts
//
// Reads the post from WordPress's REST API (old.onsitestorage.com) and its live
// page (author, date, h1, SEO). Writes:
//   <PREFIX>_ARTICLE  { title, author, datePublished, dateModified, hero, html }
//   <PREFIX>_FAQS     BlogFaq[] from the post's FAQ accordion
//   <PREFIX>_SEO      { title, description, ogImage, ogType } as WordPress serves them
//
// The body is word for word, as clean markup: Elementor's layout unwrapped,
// sections hidden on every device dropped, heading levels closed up (h2 → h3,
// never a skip), links root-relative without a trailing slash, images kept on
// the CDN. It prints what it changed or left out, for the decisions list.
import { writeFileSync } from 'node:fs'
import * as cheerio from 'cheerio'

const [slug, prefix, out] = process.argv.slice(2)
if (!slug || !prefix || !out) {
  console.error('usage: node scripts/extract-wp-post.mjs <slug> <CONST_PREFIX> <lib/data/file.ts>')
  process.exit(1)
}

const WP = 'https://old.onsitestorage.com'
const CDN = 'https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com'
const UA = { 'User-Agent': 'Mozilla/5.0 (OSS-Next page migration)' }
const notes = []

async function get(url, as = 'text') {
  const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(60_000) })
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`)
  return as === 'json' ? res.json() : res.text()
}

const [posts, pageHtml] = await Promise.all([
  get(`${WP}/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed=wp:featuredmedia`, 'json'),
  get(`${WP}/${slug}/`),
])
const post = posts[0]
if (!post) throw new Error(`no post "${slug}"`)
const page = cheerio.load(pageHtml)

// ── What the live page says ──────────────────────────────────────────────────
const text = (s) => s.replace(/\s+/g, ' ').trim()
const title = text(page('h1').first().text())
const author = text(page('.elementor-post-info__item--type-author').first().text()).replace(/^By\s+/i, '')
const seo = {
  title: page('title').first().text().trim(),
  description: page('meta[name="description"]').attr('content') ?? '',
  ogImage: page('meta[property="og:image"]').attr('content') ?? null,
  ogType: page('meta[property="og:type"]').attr('content') ?? 'article',
}

// ── Links and images ─────────────────────────────────────────────────────────
/** onsitestorage.com links → root-relative, no trailing slash. */
function rewriteHref(href) {
  if (!href) return href
  const m = href.match(/^https?:\/\/(?:www\.|old\.)?onsitestorage\.com(\/[^#?]*)?([?#].*)?$/i)
  if (!m) return href
  const path = (m[1] ?? '/').replace(/\/+$/, '') || '/'
  return path + (m[2] ?? '')
}
/** A WordPress upload → the same file on the CDN. */
function rewriteSrc(src) {
  if (!src) return src
  return src.replace(/^https?:\/\/(?:www\.|old\.)?onsitestorage\.com\/wp-content\//i, `${CDN}/wp-content/`)
}

const KEEP = new Set(['p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'a', 'strong', 'b', 'em', 'i', 'br', 'img', 'figure', 'figcaption', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'blockquote'])
const ATTRS = { a: ['href', 'target', 'rel'], img: ['src', 'alt', 'width', 'height'], th: ['colspan', 'rowspan'], td: ['colspan', 'rowspan'] }

/** Elementor markup → article tags only. */
function clean($, root) {
  root.find('script, style, noscript, svg').remove()
  root.find('*').each((_, el) => {
    const tag = el.tagName?.toLowerCase()
    if (!tag) return
    const node = $(el)
    if (/^h[4-6]$/.test(tag)) {
      el.tagName = 'h3'
      notes.push(`${tag} "${text(node.text()).slice(0, 50)}" → h3`)
    }
    for (const name of Object.keys(el.attribs ?? {})) if (!(ATTRS[el.tagName] ?? []).includes(name)) node.removeAttr(name)
    if (el.tagName === 'a') node.attr('href', rewriteHref(node.attr('href')))
    if (el.tagName === 'img') node.attr('src', rewriteSrc(node.attr('src')))
  })
  // Unwrap everything not kept (div, span, section…), innermost first.
  let changed = true
  while (changed) {
    changed = false
    root.find('*').each((_, el) => {
      if (!KEEP.has(el.tagName?.toLowerCase())) {
        $(el).replaceWith($(el).contents())
        changed = true
      }
    })
  }
  // "<ul><li><h3><b>Cost-effective</b></h3></li></ul>": a heading styled as a bullet → the heading.
  root.find('ul, ol').each((_, el) => {
    const items = $(el).children('li')
    const h = items.first().children('h2, h3')
    if (items.length === 1 && h.length === 1 && !text(items.first().clone().children('h2, h3').remove().end().text())) {
      $(el).replaceWith(`<${h.prop('tagName').toLowerCase()}>${text(h.text())}</${h.prop('tagName').toLowerCase()}>`)
      notes.push(`heading in a one-item list unwrapped: "${text(h.text())}"`)
    }
  })
  root.find('h2 b, h2 strong, h3 b, h3 strong').each((_, el) => { $(el).replaceWith($(el).contents()) })
  root.find('p').each((_, el) => {
    if (!text($(el).text()) && !$(el).find('img').length) $(el).remove()
  })
  return root
}

// ── The body, widget by widget ───────────────────────────────────────────────
const $ = cheerio.load(post.content.rendered)
const hiddenEverywhere = (el) => $(el).closest('.elementor-hidden-desktop.elementor-hidden-tablet.elementor-hidden-mobile').length > 0

const blocks = []
const faqs = []
for (const el of $('[data-widget_type]').toArray()) {
  const type = $(el).attr('data-widget_type')
  if (hiddenEverywhere(el)) {
    notes.push(`left out (hidden on every device): ${type} "${text($(el).text()).slice(0, 60)}"`)
    continue
  }
  const body = $(el).children('.elementor-widget-container').first().length ? $(el).children('.elementor-widget-container').first() : $(el)

  if (type === 'heading.default') {
    const h = body.find('h1,h2,h3,h4,h5,h6').first()
    const words = text(h.text())
    if (!words) continue
    if (/^frequently asked questions$/i.test(words)) continue // BlogFaq renders its own heading
    // WordPress sizes headings by look (h5 under an h2): h2 stays, anything below is h3.
    const tag = h.prop('tagName').toLowerCase()
    const n = tag === 'h1' || tag === 'h2' ? 2 : 3
    if (tag !== 'h2' && tag !== 'h3') notes.push(`${tag} "${words.slice(0, 50)}" → h${n}`)
    blocks.push(`<h${n}>${cheerio.load(h.html(), null, false).text().replace(/</g, '&lt;')}</h${n}>`)
  } else if (type === 'text-editor.default') {
    const html = clean($, body.clone()).html()?.trim()
    if (html) blocks.push(...splitTop(html))
  } else if (type === 'image.default') {
    const img = body.find('img').first()
    if (!img.length) continue
    const src = rewriteSrc(img.attr('src'))
    const alt = img.attr('alt') ?? ''
    const w = img.attr('width')
    const hgt = img.attr('height')
    const tag = `<img src="${src}" alt="${alt.replace(/"/g, '&quot;')}"${w ? ` width="${w}"` : ''}${hgt ? ` height="${hgt}"` : ''}>`
    const link = body.find('a').first().attr('href')
    blocks.push(link ? `<a href="${rewriteHref(link)}">${tag}</a>` : tag)
  } else if (type.startsWith('accordion') || type.startsWith('nested-accordion') || type.startsWith('toggle')) {
    const items = body.find('.elementor-accordion-item, .elementor-toggle-item, details').toArray()
    for (const item of items) {
      const q = text($(item).find('.elementor-tab-title, summary').first().text())
      const a = clean($, $(item).find('.elementor-tab-content, .e-con').first().clone())
      const answerHtml = (a.html() ?? '').trim()
      if (q && answerHtml) faqs.push({ question: q, answer: text(cheerio.load(answerHtml).text()), answerHtml })
    }
  } else {
    notes.push(`unmapped widget: ${type} "${text($(el).text()).slice(0, 60)}"`)
  }
}

/** One string per top-level element, as the dimensions content is laid out. */
function splitTop(html) {
  const c = cheerio.load(html, null, false)
  return c.root().contents().toArray().map((n) => (n.type === 'text' ? text(c(n).text()) : c.html(n).trim())).filter(Boolean).map((s) => (s.startsWith('<') ? s : `<p>${s}</p>`))
}

// The header picture: the body's first image when the body opens with one (as
// WordPress shows it under the title), else the featured image.
const featured = post._embedded?.['wp:featuredmedia']?.[0]
let hero = null
const opening = cheerio.load(blocks[0] ?? '', null, false)('img').first()
if (blocks[0] && /^(<a [^>]*>)?<img /.test(blocks[0]) && opening.length) {
  hero = { src: opening.attr('src'), alt: opening.attr('alt') || title, width: Number(opening.attr('width') ?? 1200), height: Number(opening.attr('height') ?? 675) }
  blocks.shift()
  notes.push('header picture: the first image of the body, as WordPress shows it under the title')
} else if (featured?.source_url) {
  hero = { src: rewriteSrc(featured.source_url), alt: featured.alt_text || title, width: featured.media_details?.width ?? 1200, height: featured.media_details?.height ?? 675 }
  notes.push('header picture: the featured image')
}

const constName = (s) => `${prefix}_${s}`
const file = `/**
 * /${slug}, carried over from the WordPress post it replaced (post ${post.id},
 * served at the site root; ${new Date().toISOString().slice(0, 10)}). It never reached the backend, so it is
 * a fixed article rather than a backend post (components/blog/FixedArticle.tsx).
 *
 * Generated by scripts/extract-wp-post.mjs: \`html\` is the post body, word for
 * word, as clean markup (Elementor unwrapped, links root-relative, images on the
 * CDN); \`hero\` is the header picture and \`faqs\` the FAQ accordion. Left out:
 * the WordPress sidebar, the post navigation and anything hidden on every device.
${notes.map((n) => ` * - ${n}`).join('\n')}
 */

import type { BlogFaq } from '@/types/blog'
import type { FixedArticleContent } from '@/components/blog/FixedArticle'

export const ${constName('ARTICLE')}: FixedArticleContent = {
  title: ${JSON.stringify(title)},
  author: ${JSON.stringify(author)},
  datePublished: ${JSON.stringify(post.date_gmt + '+00:00')},
  dateModified: ${JSON.stringify(post.modified_gmt + '+00:00')},
  hero: ${JSON.stringify(hero)},
  html: [
${blocks.map((b) => `    ${JSON.stringify(b)},`).join('\n')}
  ].join('\\n'),
}

export const ${constName('FAQS')}: BlogFaq[] = ${JSON.stringify(faqs, null, 2)}

/** As WordPress serves them, for config/pageSeoDefaults.ts. */
export const ${constName('SEO')} = ${JSON.stringify(seo, null, 2)}
`
writeFileSync(out, file)
console.log(`${out}: "${title}" by ${author}; ${blocks.length} blocks, ${faqs.length} FAQs, hero ${hero ? 'yes' : 'none'}`)
for (const n of notes) console.log(`  - ${n}`)
console.log(`  seo: ${JSON.stringify(seo)}`)
