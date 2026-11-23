import { load } from 'cheerio'

/** Tags a product description may keep; anything else is unwrapped (its text stays) or, below, removed. */
const ALLOWED = new Set([
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'a',
  'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img',
])
/** Removed with their content: code, embeds and form controls are never product copy. */
const DROPPED = 'script, style, iframe, object, embed, form, input, button, select, textarea, link, meta, noscript, svg, canvas, template'
/** The attributes each kept tag may carry; every other attribute (style, class, on*) is stripped. */
const ATTRS: Record<string, readonly string[]> = { a: ['href'], img: ['src', 'alt', 'width', 'height'], th: ['colspan', 'rowspan'], td: ['colspan', 'rowspan'] }
type Tag = { tagName: string; attribs: Record<string, string> }
const isTag = <T extends object>(node: T): node is T & Tag => 'tagName' in node && 'attribs' in node

const SAFE_URL = /^(https?:\/\/|\/(?!\/)|#|mailto:|tel:)/i

/**
 * A product's backend description (`body_html`, written in WordPress), made
 * safe and plain enough to render on the product page: an allowlist of
 * formatting tags, no scripts, embeds, event handlers or inline styles (the
 * WordPress export wraps every paragraph in `<span style="font-weight:400">`,
 * which would also fight the page's dark mode), links only to http(s),
 * relative, mailto and tel URLs. An `h1` becomes an `h2`: the page has its own.
 * Empty when there is no text to show. Server-side only (cheerio).
 */
export function productDescriptionHtml(html: unknown): string {
  if (typeof html !== 'string' || !html.trim()) return ''
  const $ = load(html, null, false)
  $(DROPPED).remove()
  $('h1').toArray().filter(isTag).forEach((el) => {
    el.tagName = 'h2'
  })
  // Deepest first, so unwrapping a parent never skips a child.
  $('*')
    .toArray()
    .filter(isTag)
    .reverse()
    .forEach((el) => {
      const node = $(el)
      const tag = el.tagName.toLowerCase()
      if (!ALLOWED.has(tag)) {
        node.replaceWith(node.contents())
        return
      }
      const keep = ATTRS[tag] ?? []
      for (const name of Object.keys(el.attribs)) if (!keep.includes(name.toLowerCase())) node.removeAttr(name)
      if (tag === 'a') {
        const href = node.attr('href')?.trim() ?? ''
        if (!SAFE_URL.test(href)) node.removeAttr('href')
        else if (/^https?:\/\//i.test(href)) node.attr('rel', 'noopener')
      }
      if (tag === 'img') {
        const src = node.attr('src')?.trim() ?? ''
        if (!/^https:\/\//i.test(src)) return void node.remove()
        node.attr('loading', 'lazy').attr('decoding', 'async')
        if (node.attr('alt') === undefined) node.attr('alt', '')
      }
    })
  // Paragraphs left empty by the clean-up (WordPress's &nbsp; spacers).
  $('p').each((_, el) => {
    const p = $(el)
    if (!p.text().replace(/ /g, ' ').trim() && !p.find('img, br').length) p.remove()
  })
  const out = $.html().trim()
  return $.root().text().trim() || $('img').length ? out : ''
}
