import { load } from 'cheerio'
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
 * NEXT_SOLANA_BACKEND_KEY never reaches the browser.
 */

const BACKEND = (process.env.NEXT_OSS_BACKEND_URL ?? 'http://localhost:8000').replace(/\/+$/, '')
const API_KEY = process.env.NEXT_SOLANA_BACKEND_KEY

/** CDN that serves the converted pages' images and theme assets. */
export const ASSET_CDN = 'https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com'

/**
 * Site chrome baked into the converted markup by WordPress. The Next.js
 * (market) layout supplies TopBar/Navbar/Footer, so these are dropped to
 * avoid rendering two headers and two footers on the same page.
 */
const CHROME_SELECTORS = [
  '[data-elementor-type="header"]',
  '[data-elementor-type="footer"]',
  '.elementor-location-header',
  '.elementor-location-footer',
  'header#masthead',
  'footer#colophon',
  '.site-header',
  '.site-footer',
].join(', ')

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
  /** Chrome-stripped, image-optimised markup ready for rendering. */
  content: string
  /** Likely LCP images, emitted as <link rel="preload"> by the page. */
  preloads: string[]
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
  $(CHROME_SELECTORS).remove()
  optimiseImages($)

  return {
    ...page,
    content: $.html(),
    preloads: lcpCandidates($, page.css ?? ''),
  }
}
