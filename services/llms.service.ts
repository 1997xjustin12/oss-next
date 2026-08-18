import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_TAGS } from '@/config/cache'
import { DEPOTS, depotPagePath } from '@/lib/locations'
import { NATIVE_PAGES } from '@/config/pages'
import { ROUTES } from '@/config/routes'
import { SITE, absoluteUrl } from '@/config/site'
import { htmlToMarkdown, htmlToPlainText } from '@/lib/markdown'
import { resolveAgentSummary } from '@/lib/seo'
import { fetchPageSitemap } from '@/services/sitemap.service'
import { fetchWpPage } from '@/services/wp-pages.service'
import { getAllBlogSlugs, getCachedBlogs } from '@/services/blog.service'

/**
 * The `/llms.txt` family: this site, described in Markdown, for a model.
 *
 * The governing rule is CURATION. A sitemap answers "what URLs exist" and
 * already does that for 11,967 of them. llms.txt answers "what is this site,
 * and where should I look" — a question that a dump of every product URL makes
 * harder to answer, not easier. So: entry points, the depot network, the
 * policies, and a sample of the catalog. Not the catalog.
 *
 * Anything omitted for length is reported in the file itself, with the endpoint
 * that does have the full set. A silent truncation reads as completeness.
 */

/** Blog posts listed in llms.txt. Beyond this the blog index is the entry point. */
const MAX_BLOG_LINKS = 40
/** Buying-guide pages sampled from the ~1,600 top-level content pages. */
const MAX_GUIDE_LINKS = 40
/** Pages whose full text is inlined into llms-full.txt. */
const MAX_FULL_PAGES = 20

/**
 * Pages worth naming explicitly, in the order a reader wants them.
 *
 * A curated file needs an opinion about what matters. Ranking these by hand is
 * that opinion: an alphabetical slice of the content set returns forty pages
 * beginning "10 Foot…" and buries the returns policy, which is exactly the page
 * an agent needs before recommending a purchase.
 *
 * Entries are matched against the live page list, so a slug that gets renamed
 * disappears from llms.txt rather than becoming a dead link.
 */
const KEY_PAGES: { path: string; note: string }[] = [
  { path: '/shipping-container-quote', note: 'Request a delivered price quote' },
  { path: '/shipping-container-delivery', note: 'How delivery works, site requirements and truck access' },
  { path: '/shipping-container-faqs', note: 'Frequently asked questions about buying and renting' },
  { path: '/shipping-container-financing', note: 'Financing options' },
  { path: '/shipping-container-rent-to-own-financing', note: 'Rent-to-own terms' },
  { path: '/payment-options', note: 'Accepted payment methods' },
  { path: '/shipping-policy', note: 'Shipping and delivery policy' },
  { path: '/terms-and-conditions', note: 'Terms and conditions' },
  { path: '/privacy-policy', note: 'Privacy policy' },
  { path: '/why-onsite-storage', note: 'About the company and how it compares' },
  { path: '/product-review', note: 'Customer reviews' },
]

/** Depth-2 sections that group related pages — useful entry points on their own. */
const SECTION_PAGES: { path: string; note: string }[] = [
  { path: '/where-to-buy-shipping-containers', note: 'Per-city buying guides across the depot network' },
  { path: '/shipping-container-ideas-inspiration', note: 'Conversion ideas: homes, offices, restaurants, schools' },
  { path: '/shipping-container-accessories-gallery', note: 'Locks, ramps and shelving, with photos' },
  { path: '/shipping-container-modified-containers-gallery', note: 'Doors, windows, paint and other modifications' },
  { path: '/customer-fabrication-gallery', note: 'Completed customer fabrications' },
]

type Link = { title: string; url: string; note?: string }

function renderLinks(links: Link[]): string {
  return links.map((l) => `- [${l.title}](${l.url})${l.note ? `: ${l.note}` : ''}`).join('\n')
}

/**
 * Depot pages, one entry per depot, with the cities it covers as the note.
 *
 * Two filters, both load-bearing:
 *
 *   - DEPOTS has already collapsed the 96 "virtual depot" records into their
 *     parent, so this can't list five city names all linking to the Atlanta
 *     page as though they were separate depots.
 *   - Each candidate URL is checked against the live page list. The depot
 *     records' own `local_specials` field points at `/locations/<city>`, which
 *     does NOT exist — it serves a Not Found page. Only the
 *     `/where-to-buy-shipping-containers/<city>` family is real, and even there
 *     some depots have no page. Emitting a link this file can't stand behind is
 *     worse than omitting the depot.
 */
function depotLinks(live: Set<string>): Link[] {
  const links: Link[] = []
  for (const depot of DEPOTS) {
    const path = depotPagePath(depot)
    if (!path || !live.has(path)) continue
    const others = depot.citiesServed.filter((city) => city !== depot.location.title)
    links.push({
      title: depot.location.title,
      url: absoluteUrl(path),
      note: others.length ? `Also serves ${others.join(', ')}` : 'Depot and service area',
    })
  }
  return links
}

/**
 * The app's own indexable routes.
 *
 * The note is the page's agent summary, which an author can edit in the admin
 * Page Configurator without a deploy (D4) — falling back to the built-in
 * default and then the meta description. That fallback chain lives in
 * resolveAgentSummary(); this just reads it per page.
 */
async function nativePageLinks(): Promise<Link[]> {
  const pages = NATIVE_PAGES.filter((page) => page.indexable)
  return Promise.all(
    pages.map(async (page) => ({
      title: page.label,
      url: absoluteUrl(page.path),
      note: await resolveAgentSummary(page.path),
    })),
  )
}

function titleFromPath(path: string): string {
  return path
    .replace(/^\/|\/$/g, '')
    .split('/')
    .pop()!
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Only emit a curated entry if the page is actually live. */
function curatedLinks(entries: { path: string; note: string }[], live: Set<string>): Link[] {
  return entries
    .filter((entry) => live.has(entry.path))
    .map((entry) => ({ title: titleFromPath(entry.path), url: absoluteUrl(entry.path), note: entry.note }))
}

/**
 * A sample of the ~1,600 top-level guide pages.
 *
 * Sampled with an even stride across the sorted list rather than taking the
 * first N. The slugs are overwhelmingly size-led ("10-foot…", "20-foot…"), so
 * an alphabetical head is forty near-identical pages about 10ft containers,
 * which tells a reader nothing about the breadth of the site. A stride costs
 * nothing and covers the range.
 */
function guideSample(paths: string[], exclude: Set<string>): Link[] {
  const candidates = paths
    .filter((path) => path.replace(/^\/|\/$/g, '').split('/').length === 1)
    .filter((path) => path.length > 1 && !exclude.has(path))
    .sort()

  if (candidates.length <= MAX_GUIDE_LINKS) {
    return candidates.map((path) => ({ title: titleFromPath(path), url: absoluteUrl(path) }))
  }

  const stride = candidates.length / MAX_GUIDE_LINKS
  return Array.from({ length: MAX_GUIDE_LINKS }, (_, i) => {
    const path = candidates[Math.floor(i * stride)]
    return { title: titleFromPath(path), url: absoluteUrl(path) }
  })
}

function header(): string {
  return [
    `# ${SITE.name}`,
    '',
    `> ${SITE.description}`,
    '',
    `Contact: ${SITE.telephoneDisplay} · ${SITE.email}`,
    `Canonical site: ${SITE.url}`,
  ].join('\n')
}

function machineReadableSection(): string {
  return [
    '## Machine-readable endpoints',
    '',
    renderLinks([
      { title: 'sitemap.xml', url: absoluteUrl('/sitemap.xml'), note: 'Every indexable URL — ~12,000 including the full product catalog' },
      { title: 'Sitemap JSON', url: absoluteUrl('/api/sitemap?type=products'), note: 'Raw product URL list with lastmod; ?type=page for content pages' },
      { title: 'Product feed (RSS)', url: absoluteUrl('/api/feeds/google.xml'), note: 'Google Merchant format — price, image, availability, condition per product' },
      // Linked with ?limit= on purpose. The unpaginated pull is ~15MB and
      // currently takes minutes (see F12 in docs/audits/AGENTIC_READINESS.md),
      // so pointing a consumer straight at it invites a timeout. Drop the
      // parameter for the full catalog once you know you want it.
      { title: 'Product feed (JSON Lines)', url: absoluteUrl('/api/feeds/products.jsonl?limit=100'), note: 'Catalog as JSON Lines with an explicit price basis on every item. Page with ?offset= and ?limit=; omit both for all ~10,200 products' },
      { title: 'MCP server', url: absoluteUrl('/api/mcp'), note: 'Connect Claude or ChatGPT directly — search, product detail, delivery availability, page content' },
      { title: 'AI agent policy', url: absoluteUrl('/agents'), note: 'What agents may do, rate limits, attribution, and how to ask for a higher limit' },
      { title: 'llms-full.txt', url: absoluteUrl('/llms-full.txt'), note: 'This file, plus the full text of the key pages inline' },
    ]),
    '',
    '### Agent API',
    '',
    'A read-only JSON API. No authentication, 60 requests/minute per IP.',
    '',
    renderLinks([
      { title: 'OpenAPI 3.1 description', url: absoluteUrl('/openapi.json'), note: 'Start here — full schemas, parameters and examples' },
      { title: 'Search', url: absoluteUrl('/api/agent/v1/search?q=40ft%20high%20cube'), note: 'Catalog search; flat JSON, no envelope' },
      { title: 'Delivery availability', url: absoluteUrl('/api/agent/v1/availability?zip=85001'), note: 'Nearest depot for a ZIP and what it can actually supply' },
    ]),
    '',
    // Deliberately NOT a Markdown link: the URL is a template, so emitting it
    // as one puts a guaranteed-dead link in this file. The link checker caught
    // exactly that.
    `Product detail: \`GET ${absoluteUrl('/api/agent/v1/products/')}<handle>\` — specs, FAQ, delivery, and the same container listed at other depots. Handles come from the search endpoint.`,
    '',
    '> Containers are delivered by truck from a depot network, so what is available depends on the customer\'s location, not just the catalog. For any question involving a place, call /availability rather than /search.',
    '',
    '> Prices: rental and rent-to-own products are priced PER MONTH. Every price in the API carries a `basis` field and a plain-English `description` — quote the description, never the bare number.',
    '',
    `> Every page also has a Markdown representation: append \`.md\` to any URL, or send \`Accept: text/markdown\`. Example: ${absoluteUrl('/privacy-policy')}.md`,
  ].join('\n')
}

/**
 * `/llms.txt` — the curated index.
 */
export async function buildLlmsTxt(): Promise<string> {
  'use cache'
  cacheLife('hours')
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.PAGES, CACHE_TAGS.BLOG)

  const [contentPages, blogSlugs] = await Promise.all([fetchPageSitemap(), getAllBlogSlugs()])

  const paths = contentPages.map((p) => p.path).filter(Boolean).map((p) => `/${p.replace(/^\/+|\/+$/g, '')}`)
  const live = new Set(paths)

  const locations = depotLinks(live)
  const keyLinks = curatedLinks(KEY_PAGES, live)
  const sectionLinks = curatedLinks(SECTION_PAGES, live)
  const guideLinks = guideSample(paths, new Set(KEY_PAGES.map((p) => p.path)))
  const totalGuides = paths.filter((p) => p.replace(/^\/|\/$/g, '').split('/').length === 1).length

  const blogLinks: Link[] = blogSlugs.slice(0, MAX_BLOG_LINKS).map(({ slug }) => ({
    title: slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    url: absoluteUrl(ROUTES.BLOG(slug)),
  }))

  const sections: string[] = [
    header(),
    '',
    '## Shop',
    '',
    renderLinks([
      ...(await nativePageLinks()),
      { title: 'Containers to buy', url: absoluteUrl(`${ROUTES.PLP}?ptype=buy`), note: 'New and used containers for purchase' },
      { title: 'Containers to rent', url: absoluteUrl(`${ROUTES.PLP}?ptype=rental`), note: 'Monthly rental, 3/6/12-month terms' },
      { title: 'Rent-to-own containers', url: absoluteUrl(`${ROUTES.PLP}?ptype=rto`), note: 'Rent-to-own, 12/24/36/48-month terms' },
      { title: 'Accessories', url: absoluteUrl(ROUTES.PLP_ACCESSORIES), note: 'Locks, ramps, vents, shelving and parts' },
    ]),
    '',
    `> Individual product pages live at ${SITE.url}/product/{handle}. The full catalog is ~10,000 products — see the product feed under "Machine-readable endpoints" rather than crawling the listing pages.`,
  ]

  if (keyLinks.length) {
    sections.push('', '## Key pages', '', renderLinks(keyLinks))
  }

  if (sectionLinks.length) {
    sections.push('', '## Galleries and collections', '', renderLinks(sectionLinks))
  }

  if (guideLinks.length) {
    sections.push(
      '',
      '## Buying guides',
      '',
      `A representative sample of ${guideLinks.length} of ${totalGuides} guide pages, spread across the full set rather than the first N alphabetically. Every one is listed in sitemap.xml.`,
      '',
      renderLinks(guideLinks),
    )
  }

  if (blogLinks.length) {
    sections.push('', '## Articles', '', renderLinks(blogLinks))
    if (blogSlugs.length > blogLinks.length) {
      sections.push(
        '',
        `> Showing ${blogLinks.length} of ${blogSlugs.length} articles. Full index: ${absoluteUrl(ROUTES.BLOGS)}`,
      )
    }
  }

  if (locations.length) {
    sections.push(
      '',
      '## Depot locations',
      '',
      `Delivery is dispatched from ${DEPOTS.length} depots across the USA and Canada. The ${locations.length} with a published page are listed below; each covers that depot's service area, hours and local pricing.`,
      '',
      renderLinks(locations),
    )
  }

  sections.push('', machineReadableSection(), '')

  return sections.join('\n')
}

/**
 * `/llms-full.txt` — the index, plus the actual text of the highest-value
 * pages, so a model can answer from one fetch instead of twenty.
 *
 * Bounded at MAX_FULL_PAGES: the WordPress set is ~1,700 pages, and inlining
 * them would produce a file no consumer would read. Which pages were included
 * and how many were skipped is stated in the output.
 */
export async function buildLlmsFullTxt(): Promise<string> {
  'use cache'
  cacheLife('hours')
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.PAGES, CACHE_TAGS.BLOG)

  const [index, contentPages, blogList] = await Promise.all([
    buildLlmsTxt(),
    fetchPageSitemap(),
    getCachedBlogs(),
  ])

  const paths = contentPages.map((p) => p.path).filter(Boolean).map((p) => `/${p.replace(/^\/+|\/+$/g, '')}`)
  const live = new Set(paths)
  const candidates = paths.filter((path) => path.replace(/^\/|\/$/g, '').split('/').length === 1 && path.length > 1)

  // Key pages first — a reader who fetches one file wants the returns policy
  // and the delivery terms inlined, not the twenty alphabetically-first guides.
  const keyPaths = KEY_PAGES.map((p) => p.path).filter((path) => live.has(path))
  const selected = [...new Set([...keyPaths, ...candidates.sort()])].slice(0, MAX_FULL_PAGES)

  const pages = await Promise.all(
    selected.map(async (path) => {
      const segments = path.replace(/^\/|\/$/g, '').split('/')
      try {
        const page = await fetchWpPage(segments)
        if (!page) return null
        const body = htmlToMarkdown(page.content, {
          baseUrl: SITE.url,
          startingHeadingLevel: 3,
        })
        if (!body) return null
        return [`## ${page.title}`, '', `Source: ${absoluteUrl(path)}`, '', body].join('\n')
      } catch (err) {
        console.error(`[llms] failed to inline ${path}:`, err)
        return null
      }
    }),
  )

  const included = pages.filter((p): p is string => Boolean(p))

  const articles = blogList.posts.map((post) =>
    [
      `## ${post.title}`,
      '',
      `Source: ${absoluteUrl(ROUTES.BLOG(post.slug))}${post.date ? ` · Published ${post.date.slice(0, 10)}` : ''}`,
      '',
      htmlToPlainText(post.excerpt, 400),
    ].join('\n'),
  )

  return [
    index.trimEnd(),
    '---',
    '# Full page text',
    `Inlined below: ${included.length} content pages of ${candidates.length} top-level candidates, and ${articles.length} article summaries of ${blogList.count} articles. Everything omitted is reachable from the links above.`,
    ...included,
    ...(articles.length ? ['# Article summaries', ...articles] : []),
  ]
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .concat('\n')
}
