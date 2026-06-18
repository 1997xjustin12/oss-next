import * as cheerio from 'cheerio'
import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_TAGS } from '@/config/cache'

const TARGET_SITE = 'https://onsitestorage.com'

export interface WpProxyMeta {
  title: string
  description?: string
  keywords?: string
  robots?: string
  canonical?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  twitterCard?: string
}

export interface WpProxyData {
  meta: WpProxyMeta
  headElements: string
  preScripts: string    // link/style/script in <body> BEFORE the content block
  footerScripts: string // link/style/script in <body> AFTER the content block
  elementorHtml: string
  bodyClass: string
}

export async function fetchWordPressPage(slug: string, search = ''): Promise<WpProxyData | null> {
  'use cache'
  cacheLife('hours')
  cacheTag(CACHE_TAGS.ALL)

  const normalised = slug.replace(/^\/+|\/+$/g, '')
  const url = `${TARGET_SITE}/${normalised}/${search}`

  let html: string
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(15_000),
    })
    if (!res.ok) return null
    html = await res.text()
  } catch {
    return null
  }

  const $ = cheerio.load(html)

  // ── 1. Structured SEO metadata ────────────────────────────────────────────
  const canonicalHref = $('link[rel="canonical"]').attr('href')
  const meta: WpProxyMeta = {
    title: $('title').text() || 'Onsite Storage',
    description: $('meta[name="description"]').attr('content'),
    keywords: $('meta[name="keywords"]').attr('content'),
    robots: $('meta[name="robots"]').attr('content'),
    canonical: canonicalHref?.startsWith(TARGET_SITE)
      ? canonicalHref.replace(TARGET_SITE, '') || '/'
      : canonicalHref,
    ogTitle: $('meta[property="og:title"]').attr('content'),
    ogDescription: $('meta[property="og:description"]').attr('content'),
    ogImage: $('meta[property="og:image"]').attr('content'),
    twitterCard: $('meta[name="twitter:card"]').attr('content'),
  }

  // ── 2. Fix relative asset URLs to point back to the WordPress origin ──────
  $('img, script, link').each((_, el) => {
    if ($(el).is('link[rel="canonical"]')) return
    for (const attr of ['src', 'href'] as const) {
      const val = $(el).attr(attr)
      if (val?.startsWith('/') && !val.startsWith('//')) {
        $(el).attr(attr, `${TARGET_SITE}${val}`)
      }
    }
  })

  // ── 3. Rewrite internal links to local paths ──────────────────────────────
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href')?.trim() ?? ''
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) return
    if (href === TARGET_SITE || href === `${TARGET_SITE}/` || href === '/') {
      $(el).attr('href', '/')
      return
    }
    if (href.startsWith(TARGET_SITE)) {
      $(el).attr('href', '/' + href.slice(TARGET_SITE.length).replace(/^\/+/, ''))
    } else if (href.startsWith('/') && !href.startsWith('//')) {
      $(el).attr('href', '/' + href.replace(/^\/+/, ''))
    }
  })

  // ── 4. Extract main Elementor page content ────────────────────────────────
  let mainContent = $('[data-elementor-type="wp-page"]')
  if (!mainContent.length) mainContent = $('main')
  if (!mainContent.length) mainContent = $('.elementor')

  const elementorHtml = mainContent.length
    ? $.html(mainContent)
    : '<p>Content block not found.</p>'

  const bodyClass = $('body').attr('class') ?? ''

  // ── 5. Collect head CSS/JS so Elementor styles render correctly ──────────
  let headElements = ''
  $('head')
    .find('link, style, script')
    .each((_, el) => {
      if ($(el).is('link[rel="canonical"]')) return
      headElements += $.html(el) + '\n'
    })

  // ── 6. Collect body assets outside the content block, preserving order ──────
  // Split into preScripts / footerScripts so the assembled HTML mirrors the
  // original WordPress DOM order: preScripts → content → footerScripts.
  // Includes link (stylesheets), style (inline CSS), and script tags — the
  // `link` selector is the gap vs. the old scan which only covered script/style.
  const mainEl = mainContent.get(0) as unknown as { parent: unknown } | undefined
  const bodyEl = $('body').get(0)
  const bodyChildren: unknown[] = bodyEl ? (bodyEl as unknown as { children: unknown[] }).children : []

  // Walk up from any element to find its direct child of <body>
  function bodyAncestorOf(el: unknown): unknown {
    let node = el as { parent: unknown } | null
    while (node && (node as { parent: unknown }).parent !== bodyEl) {
      node = (node as { parent: { parent: unknown } }).parent
    }
    return node
  }

  const mainBodyAncestor = mainEl ? bodyAncestorOf(mainEl) : null
  const mainBodyIndex = mainBodyAncestor ? bodyChildren.indexOf(mainBodyAncestor) : -1

  let preScripts = ''
  let footerScripts = ''

  $('body').find('script, style, link').each((_, el) => {
    if ($(el).is('link[rel="canonical"]')) return
    if (mainContent.length && $(el).closest(mainContent).length) return

    const ancestor = bodyAncestorOf(el)
    const elIndex = ancestor ? bodyChildren.indexOf(ancestor) : Infinity
    const bucket = mainBodyIndex >= 0 && elIndex < mainBodyIndex ? 'pre' : 'post'
    if (bucket === 'pre') preScripts += $.html(el) + '\n'
    else footerScripts += $.html(el) + '\n'
  })

  return { meta, headElements, preScripts, footerScripts, elementorHtml, bodyClass }
}
