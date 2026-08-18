import { load } from 'cheerio'
import postcss from 'postcss'
import safeParser from 'postcss-safe-parser'
import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_TAGS } from '@/config/cache'
import { SITE_URL } from '@/config/site'
import { htmlToMarkdown } from '@/lib/markdown'

/**
 * Converted WordPress pages, served by the Django pages API.
 *
 * Replaces the old live-scrape iframe proxy (services/wp-proxy.service.ts):
 * pages are now pre-converted and stored in Django, so we render them inline
 * as part of the Next.js document instead of embedding onsitestorage.com.
 * That keeps the markup server-rendered and indexable.
 *
 * The API is key-protected and only ever called server-side, so
 * NEXT_OSS_BACKEND_KEY never reaches the browser.
 */

const BACKEND = (process.env.NEXT_OSS_BACKEND_URL ?? 'http://localhost:8000').replace(/\/+$/, '')
const API_KEY = process.env.NEXT_OSS_BACKEND_KEY

/** CDN that serves the converted pages' images and theme assets. */
export const ASSET_CDN = 'https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com'

/**
 * Class applied to the wrapper the converted markup renders into. Every
 * selector in the page's WordPress CSS is rewritten to sit under it.
 */
export const SCOPE_CLASS = 'wp-content'

const SCOPE = `.${SCOPE_CLASS}`

/** Matches a leading html/body/:root, plus any classes/ids/attrs stuck to it. */
const ROOT_SELECTOR = /^(?:html|body|:root)((?:[.#:[][^\s>+~,]*)*)/i

/**
 * Confine a WordPress stylesheet to the converted-content wrapper.
 *
 * The theme CSS is written for a standalone WordPress document, so it styles
 * bare element selectors globally — including, with !important:
 *
 *   body, h1..h6, p, a, li, span, div:not(...) { font-family: 'Poppins' !important }
 *
 * Injected as-is that repaints the app's own TopBar/Navbar/Footer. Prefixing
 * every selector with the wrapper keeps the converted page pixel-identical
 * while leaving the surrounding React chrome untouched.
 *
 * html/body/:root collapse ONTO the wrapper rather than becoming descendants
 * of it, so `body.elementor-page-123 .foo` still matches once the original
 * body classes are applied to the wrapper itself.
 */
function scopeCss(css: string): string {
  if (!css) return ''

  // safeParser, not postcss.parse: the theme CSS from the API is not valid.
  // Its minifier strips /* */ delimiters but leaves the comment text behind,
  // and emits unbalanced braces, e.g.
  //
  //   once slick adds its class,show it smoothly .foo.slick-initialized{...}
  //   }.slick-slide:not(.slick-active){opacity:0!important}
  //
  // Browsers error-recover from that; postcss.parse throws. Throwing here
  // meant silently dropping the entire 400KB stylesheet and rendering the
  // page unstyled, so we recover the way a browser would.
  let root: postcss.Root
  try {
    root = safeParser(css)
  } catch (err) {
    // Should be unreachable — safeParser recovers rather than throwing. Warn
    // rather than fail silently, since the fallback is an unstyled page.
    console.error('[wp-pages] CSS parse failed, dropping stylesheet:', err)
    return ''
  }

  root.walkRules((rule) => {
    // Keyframe steps (`from`, `50%`) are not selectors — prefixing breaks them.
    const parent = rule.parent
    if (parent?.type === 'atrule' && /keyframes$/i.test((parent as postcss.AtRule).name)) {
      return
    }

    rule.selectors = rule.selectors.map((selector) => {
      const sel = selector.trim()
      if (!sel) return selector

      const rootMatch = sel.match(ROOT_SELECTOR)
      if (rootMatch) {
        const attached = rootMatch[1] ?? ''
        const rest = sel.slice(rootMatch[0].length).trim()
        return rest ? `${SCOPE}${attached} ${rest}` : `${SCOPE}${attached}`
      }

      return `${SCOPE} ${sel}`
    })
  })

  return root.toString()
}

/** Shape returned by GET {BACKEND}/api/pages/detail/<path>/ */
export interface WpPageDto {
  title: string
  html: string
  css?: string | null
  global_css?: string | null
  global_css_url?: string | null
  body_classes?: string[] | null
  seo_title?: string | null
  seo_description?: string | null
  canonical_url?: string | null
  og_title?: string | null
  og_description?: string | null
  og_image?: string | null
}

export interface WpPage extends WpPageDto {
  /** Image-optimised markup ready for rendering. */
  content: string
  /** Likely LCP images, emitted as <link rel="preload"> by the page. */
  preloads: string[]
  /** Theme + per-page CSS, confined to the wrapper via scopeCss(). */
  scopedCss: string
  /** Wrapper classes: SCOPE_CLASS plus the page's original WP body classes. */
  wrapperClass: string
  /**
   * JSON-LD recovered from the converted markup before its scripts were
   * stripped. Parsed, so the page re-serialises it rather than echoing the
   * original text back into the document.
   */
  structuredData: unknown[]
}

/**
 * Pull the page's own structured data out before the scripts are removed.
 *
 * The conversion carries the original WordPress page's
 * `<script type="application/ld+json">` blocks, and stripScripts() below —
 * correctly — deletes every script on the page. Without this step, that took
 * the structured data with it, leaving ~1,700 content pages with none at all.
 *
 * Only well-formed JSON that actually looks like schema.org survives: anything
 * unparseable or without an `@context`/`@type` is dropped rather than passed
 * through to the document, since a broken JSON-LD block is worse for a
 * consumer than an absent one.
 */
function extractJsonLd($: ReturnType<typeof load>): unknown[] {
  const out: unknown[] = []

  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).text().trim()
    if (!raw) return

    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      // WordPress SEO plugins occasionally emit trailing commas or raw
      // newlines inside strings. Not worth a tolerant parser — skip it.
      return
    }

    for (const node of Array.isArray(parsed) ? parsed : [parsed]) {
      if (node && typeof node === 'object' && ('@context' in node || '@type' in node)) {
        out.push(node)
      }
    }
  })

  return out
}

/** Does the recovered data already describe this type of node? */
export function hasSchemaType(nodes: unknown[], type: string): boolean {
  const matches = (node: unknown): boolean => {
    if (!node || typeof node !== 'object') return false
    const record = node as Record<string, unknown>

    const nodeType = record['@type']
    if (nodeType === type) return true
    if (Array.isArray(nodeType) && nodeType.includes(type)) return true

    // Recurse into @graph — SEO plugins put everything inside one.
    const nested = record['@graph']
    return Array.isArray(nested) && nested.some(matches)
  }

  return nodes.some(matches)
}

/**
 * Leave the first `<h1>` alone and demote every later one to `<h2>`.
 *
 * Converted Elementor pages routinely carry the same heading twice — once in a
 * desktop-only section and once in a mobile-only one — so a depot page ships
 * two identical `<h1>`s. Both are real elements in the DOM; only one is ever
 * visible. A document with two `<h1>`s has no unambiguous title, which is
 * exactly the question a crawler or an assistant asks first.
 *
 * Demoting rather than deleting: the duplicate is a real heading for the
 * section it introduces, and removing it would strip a visible heading from
 * whichever breakpoint owns it. Only the level is wrong, so only the level
 * changes. Classes and content are untouched, so nothing moves on screen.
 */
function demoteExtraH1s($: ReturnType<typeof load>): void {
  const h1s = $('h1')
  if (h1s.length < 2) return

  h1s.slice(1).each((_, el) => {
    const heading = $(el)
    heading.replaceWith(
      $('<h2></h2>')
        .attr(heading.attr() ?? {})
        .html(heading.html() ?? ''),
    )
  })
}

/**
 * Prioritise the first two images and lazy-load the rest, leaving any tag that
 * already declares its own loading/fetchpriority untouched.
 */
function optimiseImages($: ReturnType<typeof load>): void {
  $('img').each((i, el) => {
    const img = $(el)
    if (img.attr('loading') || img.attr('fetchpriority')) return
    if (i < 2) {
      img.attr('fetchpriority', 'high')
    } else {
      img.attr('loading', 'lazy')
      img.attr('decoding', 'async')
    }
  })
}

/**
 * Hero background + first <img> — the likely LCP candidates.
 *
 * The hero is the background of the FIRST top-level section still present
 * after chrome removal (looked up by its element id in the page CSS), not
 * merely the first background rule in the stylesheet.
 */
function lcpCandidates($: ReturnType<typeof load>, css: string): string[] {
  const urls: string[] = []

  const firstSection = $('[class*="elementor-element-"]').first().attr('class') ?? ''
  const id = firstSection.match(/elementor-element-([a-z0-9]+)/i)?.[1]
  if (id) {
    const rule = css.match(
      new RegExp(
        `elementor-element-${id}[^{]*\\{[^}]*background-image:\\s*url\\(["']?(https?:[^)"']+?)["']?\\)`,
        'i',
      ),
    )
    if (rule) urls.push(rule[1])
  }

  if (!urls.length) {
    const bg = css.match(/background-image:\s*url\(["']?(https?:[^)"']+)["']?\)/i)
    if (bg) urls.push(bg[1])
  }

  const firstImg = $('img').first().attr('src')
  if (firstImg && !urls.includes(firstImg)) urls.push(firstImg)

  return urls
}

/**
 * The raw page record from the backend, cached once per path.
 *
 * Split out so the HTML view and the Markdown view share a single network read
 * while deriving completely different things from it. The Markdown view must
 * not pay for `scopeCss()` — that is a PostCSS parse of up to ~400KB of theme
 * stylesheet whose entire purpose is to keep the rendered page pixel-identical,
 * and Markdown has no pixels.
 */
async function fetchWpPageDto(segments: string[]): Promise<WpPageDto | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.PAGES)

  const suffix = segments.length ? `${segments.map(encodeURIComponent).join('/')}/` : ''

  let res: Response
  try {
    res = await fetch(`${BACKEND}/api/pages/detail/${suffix}`, {
      headers: { Authorization: `Api-Key ${API_KEY}` },
      signal: AbortSignal.timeout(15_000),
    })
  } catch {
    return null
  }

  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Pages API ${res.status}: ${await res.text()}`)

  return (await res.json()) as WpPageDto
}

/**
 * A converted WordPress page as Markdown.
 *
 * Deliberately does NOT go through fetchWpPage(): that path scopes the theme
 * CSS, rewrites image attributes and computes LCP preloads, none of which mean
 * anything in Markdown. htmlToMarkdown() drops `<script>`/`<style>` itself
 * (see DROPPED in lib/markdown.ts), so the raw HTML can go straight in.
 */
export async function fetchWpPageMarkdown(
  segments: string[],
): Promise<{ title: string; description?: string; markdown: string } | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.PAGES)

  const page = await fetchWpPageDto(segments)
  if (!page) return null

  const markdown = htmlToMarkdown(page.html ?? '', {
    baseUrl: SITE_URL,
    // The route emits the page title as the H1, so the body starts at H2.
    startingHeadingLevel: 2,
  })
  if (!markdown) return null

  return {
    title: page.seo_title || page.title,
    description: page.seo_description ?? undefined,
    markdown,
  }
}

export async function fetchWpPage(segments: string[]): Promise<WpPage | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.PAGES)

  const page = await fetchWpPageDto(segments)
  if (!page) return null

  const $ = load(page.html ?? '', null, false)

  // Recover the page's structured data BEFORE the scripts are removed — the
  // removal below is indiscriminate by design, and ld+json is the one kind of
  // script worth keeping (as data, not as executable markup).
  const structuredData = extractJsonLd($)

  // Strip the converted markup's own <script> tags. The Django conversion keeps
  // the original WordPress page's third-party form scripts — Google reCAPTCHA,
  // Zoho web-to-contact, geo-blocking snippets. Because this HTML is injected
  // via server-side dangerouslySetInnerHTML, those scripts run during the
  // browser's initial parse (unlike client-inserted scripts, which don't), and
  // reCAPTCHA in particular installs global state that then throws
  // "reCAPTCHA placeholder element must be empty" on the next client-side
  // navigation — surfacing as the app's error boundary. These are marketing
  // pages: they render from HTML + scoped CSS, and their JS never ran on
  // soft-navigated visits anyway, so removing it is consistent, not a loss.
  // (Embedded lead-capture forms need a native reimplementation — see the Zoho
  // quote-form item in the audit.)
  $('script').remove()

  demoteExtraH1s($)
  optimiseImages($)

  // Converted pages are content-only — the conversion drops the WordPress
  // header/footer — so the (market) layout's TopBar/Navbar/Footer are the
  // page's only chrome and nothing needs stripping here.
  const scopedCss = [scopeCss(page.global_css ?? ''), scopeCss(page.css ?? '')]
    .filter(Boolean)
    .join('\n')

  // The original body classes move onto the wrapper, because scopeCss()
  // collapsed `body.foo` selectors down to `.wp-content.foo`.
  const wrapperClass = [SCOPE_CLASS, ...(page.body_classes ?? [])].join(' ')

  return {
    ...page,
    content: $.html(),
    preloads: lcpCandidates($, page.css ?? ''),
    scopedCss,
    wrapperClass,
    structuredData,
  }
}
