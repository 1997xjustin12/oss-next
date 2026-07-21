import { load } from 'cheerio'
import postcss from 'postcss'
import safeParser from 'postcss-safe-parser'
import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_TAGS } from '@/config/cache'

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

export async function fetchWpPage(segments: string[]): Promise<WpPage | null> {
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

  const page = (await res.json()) as WpPageDto

  const $ = load(page.html ?? '', null, false)
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
  }
}
