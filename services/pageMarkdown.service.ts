import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_TAGS } from '@/config/cache'
import { NATIVE_PAGES } from '@/config/pages'
import { PAGE_SEO_DEFAULTS } from '@/config/pageSeoDefaults'
import { ROUTES, isNativePath } from '@/config/routes'
import { SITE, absoluteUrl } from '@/config/site'
import { isDisallowedPath } from '@/config/crawlers'
import { htmlToMarkdown, htmlToPlainText } from '@/lib/markdown'
import { getCustomFieldValue, getPriceBasis, isContainerHit } from '@/lib/pricing'
import { resolveContainerVariant } from '@/lib/containerVariant'
import { PDP_SHIPPING_CONTAINERS, getQuickSpecs } from '@/lib/data/pdpShippingContainers'
import { normaliseRating } from '@/lib/ratings'
import { DEFAULT_LOCATION } from '@/lib/constants'
import { fetchWpPageMarkdown } from '@/services/wp-pages.service'
import { getCachedBlog, getCachedBlogs } from '@/services/blog.service'
import { getProductByHandle, cachedEsSearch } from '@/services/search.service'
import type { ProductHit } from '@/types/product'

/**
 * The Markdown representation of any page on this site.
 *
 * Reachable two ways, both wired in proxy.ts:
 *
 *   /privacy-policy.md                       explicit suffix
 *   /privacy-policy  Accept: text/markdown   content negotiation
 *
 * Why bother when the HTML is already server-rendered: the ~1,700 converted
 * WordPress pages reach a consumer as deeply nested Elementor `<div>`s under
 * ~400KB of theme CSS, and the PDP's substance is spread across a dozen client
 * components. Markdown is the same content at roughly a twentieth of the bytes,
 * with no parsing guesswork about which `<div>` was a heading.
 *
 * Every branch returns `null` for "no Markdown view", which the route turns into
 * a 404. That is deliberate for private pages — /cart.md would be a promise we
 * can't keep, since the cart lives in client state.
 */

export type PageMarkdown = {
  title: string
  markdown: string
  /** Canonical HTML URL of the same page, emitted in the front matter. */
  canonical: string
}

function frontMatter(title: string, canonical: string, description?: string): string {
  return [
    '---',
    `title: ${JSON.stringify(title)}`,
    ...(description ? [`description: ${JSON.stringify(description)}`] : []),
    `canonical: ${canonical}`,
    `site: ${JSON.stringify(SITE.name)}`,
    '---',
  ].join('\n')
}

function compose(
  title: string,
  path: string,
  body: string,
  description?: string,
): PageMarkdown {
  const canonical = absoluteUrl(path)
  return {
    title,
    canonical,
    markdown: [frontMatter(title, canonical, description), `# ${title}`, body]
      .filter(Boolean)
      .join('\n\n')
      .replace(/\n{3,}/g, '\n\n')
      .trimEnd()
      .concat('\n'),
  }
}

// ─── Products ────────────────────────────────────────────────────────────────

function productMarkdown(product: ProductHit, handle: string): string {
  const isContainer = isContainerHit(product)
  const location = getCustomFieldValue(product, 'location')
  const realLocation = location && location !== DEFAULT_LOCATION ? location : undefined
  const rating = normaliseRating(product.ratings)
  const sku = product.variants?.[0]?.sku

  // Never `sale_price` bare — on the ~8,000 rental/RTO products it is a monthly
  // figure, and an unlabelled number here becomes a wrong quote downstream.
  const basis = getPriceBasis(product)

  const facts: [string, string | undefined][] = [
    [basis.label, product.sale_price ? `$${product.sale_price} USD${basis.suffix}` : undefined],
    ['Contract length', basis.termMonths ? `${basis.termMonths} months` : undefined],
    ['SKU', sku],
    ['Condition', getCustomFieldValue(product, 'condition')],
    ['Grade', getCustomFieldValue(product, 'grade')],
    ['Size', getCustomFieldValue(product, 'length_width')],
    ['Height', getCustomFieldValue(product, 'height')],
    ['Delivery location', realLocation],
    ['Rating', rating.count > 0 ? `${rating.value} out of 5, from ${rating.count} reviews` : undefined],
  ]

  const sections: string[] = [
    '## At a glance',
    '',
    '| Field | Value |',
    '| --- | --- |',
    ...facts.filter(([, v]) => v).map(([k, v]) => `| ${k} | ${v} |`),
  ]

  if (isContainer) {
    const specs = getQuickSpecs(product)
    const variant = resolveContainerVariant(product)
    const entry = PDP_SHIPPING_CONTAINERS[variant]

    if (entry.specs?.length) {
      sections.push(
        '',
        '## Specifications',
        '',
        '| Specification | Value |',
        '| --- | --- |',
        ...entry.specs.map((s) => `| ${s.label} | ${s.value} |`),
      )
    }

    if (specs?.lbsTare) {
      sections.push('', `Tare weight: ${specs.lbsTare} lbs.`)
    }

    if (entry.faq?.length) {
      sections.push(
        '',
        '## Frequently asked questions',
        ...entry.faq.flatMap((f) => ['', `### ${f.question}`, '', f.answer]),
      )
    }
  }

  sections.push(
    '',
    '## Ordering',
    '',
    `Delivered nationwide from ${SITE.name}'s depot network. Call ${SITE.telephoneDisplay} or see ${absoluteUrl(ROUTES.PRODUCT(handle))} to order.`,
  )

  return sections.join('\n')
}

// ─── Listing ─────────────────────────────────────────────────────────────────

function listingMarkdown(hits: ProductHit[], heading: string): string {
  if (!hits.length) return 'No products matched this listing.'
  return [
    `## ${heading}`,
    '',
    '| Product | Price | Basis | Condition | Size | URL |',
    '| --- | --- | --- | --- | --- | --- |',
    ...hits.map((hit) => {
      const basis = getPriceBasis(hit)
      return [
        '',
        hit.title,
        hit.sale_price ? `$${hit.sale_price}${basis.suffix}` : '—',
        // Explicit column rather than a suffix alone: a table is read down, and
        // a column of prices where some are monthly and some are one-time is
        // exactly the shape that gets misread.
        basis.period === 'monthly' ? `${basis.label}${basis.termMonths ? `, ${basis.termMonths}mo term` : ''}` : 'One-time purchase',
        getCustomFieldValue(hit, 'condition') || '—',
        getCustomFieldValue(hit, 'length_width') || '—',
        absoluteUrl(ROUTES.PRODUCT(hit.handle)),
        '',
      ].join(' | ').trim()
    }),
    '',
    `Showing ${hits.length} of a catalog of ~10,000. The full set is at ${absoluteUrl('/api/feeds/google.xml')}.`,
  ].join('\n')
}

// ─── Dispatch ────────────────────────────────────────────────────────────────

/**
 * Static native pages describe themselves from their registered SEO copy.
 * There is no attempt to render their React tree to Markdown — the homepage's
 * value to a reader is its headings and links, which llms.txt already carries,
 * and a half-transcribed hero section would be worse than an honest summary.
 */
function nativeStaticMarkdown(path: string): PageMarkdown | null {
  const page = NATIVE_PAGES.find((p) => p.path === path)
  const seo = PAGE_SEO_DEFAULTS[path]
  if (!page || !seo || !page.indexable) return null

  return compose(
    seo.title,
    path,
    [
      seo.description,
      '',
      `See ${absoluteUrl('/llms.txt')} for a curated index of this site, or ${absoluteUrl(path)} for the page itself.`,
    ].join('\n'),
    seo.description,
  )
}

export async function getPageMarkdown(segments: string[]): Promise<PageMarkdown | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.PAGES, CACHE_TAGS.PRODUCTS, CACHE_TAGS.BLOG)

  const path = `/${segments.join('/')}`.replace(/\/+$/, '') || '/'

  // Private pages have no meaningful Markdown view, and advertising one would
  // contradict the robots.txt disallow they already carry.
  if (isDisallowedPath(path)) return null

  const [first, second] = segments

  // ── Product detail ────────────────────────────────────────────────────────
  if (first === 'product' && second) {
    const result = await getProductByHandle(second)
    if (!result) return null
    const { product } = result
    return compose(product.title, ROUTES.PRODUCT(second), productMarkdown(product, second))
  }

  // ── Blog ──────────────────────────────────────────────────────────────────
  if (first === 'blogs' && second) {
    const post = await getCachedBlog(second)
    if (!post) return null
    const body = htmlToMarkdown(post.contentHtml, {
      baseUrl: SITE.url,
      startingHeadingLevel: 2,
    })
    return compose(
      post.title,
      ROUTES.BLOG(second),
      [post.date ? `Published ${post.date.slice(0, 10)}.` : '', body].filter(Boolean).join('\n\n'),
      post.seo.description || htmlToPlainText(post.excerpt, 200) || undefined,
    )
  }

  if (first === 'blogs' && !second) {
    const list = await getCachedBlogs()
    return compose(
      'Blog',
      ROUTES.BLOGS,
      [
        `${list.count} articles about shipping containers, storage and delivery.`,
        '',
        ...list.posts.map(
          (p) => `- [${p.title}](${absoluteUrl(ROUTES.BLOG(p.slug))}): ${htmlToPlainText(p.excerpt, 160)}`,
        ),
      ].join('\n'),
    )
  }

  // ── Product listing ───────────────────────────────────────────────────────
  if (first === 'sale-shipping-containers') {
    const { hits } = await cachedEsSearch({
      query: '',
      hitsPerPage: 24,
      page: 0,
      facets: [],
      facetFilters: [],
      productType: 'buy',
      locationFilter: DEFAULT_LOCATION,
      sortParam: 'default',
      accessoryCategory: undefined,
      sizeFilter: [],
      conditionFilter: [],
      gradeFilter: [],
      heightFilter: [],
      containerTypeFilter: [],
      termFilter: [],
    })
    return compose(
      'Shipping Containers For Sale',
      ROUTES.PLP,
      listingMarkdown(hits as ProductHit[], 'Containers currently listed'),
    )
  }

  // ── Other native routes ───────────────────────────────────────────────────
  if (isNativePath(path)) return nativeStaticMarkdown(path)

  // ── WordPress-converted content ───────────────────────────────────────────
  const page = await fetchWpPageMarkdown(segments)
  if (!page) return null
  return compose(page.title, path, page.markdown, page.description)
}
