import { Suspense } from 'react'
import type { Metadata } from 'next'
import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import { cachedEsSearch, DEFAULT_LOCATION } from '@/services/search.service'
import { getPriceBasis } from '@/lib/pricing'
import { formatMoney } from '@/lib/formatters'
import { escapeHtml } from '@/lib/utils'
import { JsonLd } from '@/components/shared/JsonLd'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { ROUTES } from '@/config/routes'
import { breadcrumbNode, graph, itemListNode, siteNodes } from '@/lib/schema'
import { resolvePageMetadata } from '@/lib/seo'
import { LocationHeader } from './_components/LocationHeader'
import { InstantSearchSection, type InitialListing } from './_components/InstantSearchSection'
import { PageSkeleton, ResultsSkeleton } from './_components/PageSkeleton'
import type { ProductHit } from '@/types/product'

type SearchParams = {
  zipcode?:   string
  location?:  string
  ptype?:     string
  q?:         string
  isort?:     string
  accat?:     string
  size?:      string
  condition?: string
  grade?:     string
  height?:    string
  type?:      string
  term?:      string
}

type Props = { searchParams: Promise<SearchParams> }

// The title and description vary with the visitor's location, so this page
// computes its own defaults rather than taking the static ones from
// config/pageSeoDefaults.ts. An override saved in the admin Page Configurator
// still wins over whatever is computed here — that's the point of setting one.
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { location = 'Near You', ptype = 'buy' } = await searchParams

  if (ptype === 'accessories') {
    const title       = `Shipping Container Accessories ${location}`
    const description = `Shop locks, ramps, vents, shelving kits, and more near ${location}. Fast shipping, low prices.`
    return resolvePageMetadata(ROUTES.PLP, {
      title,
      description,
      canonical: ROUTES.PLP_ACCESSORIES,
      openGraph: { title, description, images: ['/images/og-containers.jpg'] },
    })
  }

  const title       = `Shipping Containers for Sale ${location}`
  const description = `Buy used and new shipping containers near ${location}. 20ft, 40ft, high cube, and more. Best prices guaranteed — no tax, fast delivery.`
  return resolvePageMetadata(ROUTES.PLP, {
    title,
    description,
    canonical: ROUTES.PLP,
    openGraph: { title, description, images: ['/images/og-containers.jpg'] },
  })
}

export default function SaleContainersPage({ searchParams }: Props) {
  return (
    <>
      <PageHeadScripts path={ROUTES.PLP} />
      <Suspense fallback={<PageSkeleton />}>
        <SaleContainersContent searchParams={searchParams} />
      </Suspense>
    </>
  )
}

/** URL multi-value convention, same as InstantSearchSection's parseMulti. */
function parseMulti(raw: string | undefined): string[] {
  return raw?.split(',').filter(Boolean) ?? []
}

/**
 * The first page of results: rendered straight into InstantSearch, and described
 * by the ItemList so crawlers that don't execute JavaScript see the same products.
 *
 * Params mirror InstantSearchSection's URL reads one-for-one, and hitsPerPage
 * matches its <Configure />, so these are the same 12 items the visitor's first
 * search would return. Failure is non-fatal: no results here means the browser runs
 * that search itself, and a missing ItemList is a much smaller problem than a
 * listing page that won't render.
 */
/**
 * A hit with only what the cards read. These travel inside the page's HTML, where
 * the description, SEO copy and every field's list of choices were most of the size.
 */
function toListingHit(hit: ProductHit) {
  const without = (item: object, omit: readonly string[]) =>
    Object.fromEntries(Object.entries(item).filter(([key]) => !omit.includes(key)))
  const fields = hit.custom_fields as object[] | undefined
  return {
    ...without(hit, ['body_html', 'seo', 'desc_title', 'created_at', 'updated_at', 'uploaded_at']),
    custom_fields: fields?.map((field) => without(field, ['choices'])),
  }
}

async function fetchListing(params: SearchParams): Promise<InitialListing & { hits: ProductHit[] }> {
  const isAccessories = params.ptype === 'accessories'
  try {
    const { hits, total, nbPages } = await cachedEsSearch({
      // Mirrors the client's ?q= so the ItemList describes the results the
      // visitor is actually looking at, not the unfiltered catalog.
      query: params.q?.trim() ?? '',
      hitsPerPage: 12,
      page: 0,
      facets: [],
      facetFilters: [],
      productType: params.ptype ?? 'buy',
      locationFilter: params.location ?? DEFAULT_LOCATION,
      sortParam: params.isort ?? 'default',
      accessoryCategory: isAccessories ? params.accat : undefined,
      sizeFilter: parseMulti(params.size),
      conditionFilter: parseMulti(params.condition),
      gradeFilter: parseMulti(params.grade),
      heightFilter: parseMulti(params.height),
      containerTypeFilter: parseMulti(params.type),
      termFilter: parseMulti(params.term),
    })
    return { hits: hits as ProductHit[], nbHits: total, nbPages }
  } catch (err) {
    console.error('[plp] first search failed, leaving it to the browser and omitting structured data:', err)
    return { hits: [], nbHits: 0, nbPages: 0 }
  }
}

/**
 * The <noscript> product list, as a single HTML string.
 *
 * Deliberately not JSX. On a cold render React can split any subtree into
 * streamed pieces, leaving a placeholder where each piece will go — and a
 * browser with JavaScript on reads <noscript> contents as plain text, so a
 * placeholder inside it never becomes an element and React's swap script
 * crashes the page ("Cannot read properties of null (reading 'parentNode')").
 * Reproduced on a cold load of ?ptype=rto, with the placeholders landing right
 * after ordinary <li><a> rows: plain elements are split too, so the only safe
 * content is something React cannot split. A dangerouslySetInnerHTML string is
 * written as one chunk and never parsed by React. The same crash took down the
 * product page until its <noscript> copy was removed.
 *
 * Every dynamic value is escaped: JSX did that for free, a string does not.
 */
function noscriptListingHtml(heading: string, hits: ProductHit[]): string {
  const items = hits
    .map((hit) => {
      const basis = getPriceBasis(hit)
      const price = hit.sale_price ? ` — ${formatMoney(hit.sale_price)}${basis.suffix}` : ''
      const period = basis.period === 'monthly' ? ` (${basis.label.toLowerCase()})` : ''
      const href = escapeHtml(ROUTES.PRODUCT(String(hit.handle)))
      return `<li class="mb-2"><a href="${href}">${escapeHtml(String(hit.title ?? ''))}</a>${escapeHtml(price + period)}</li>`
    })
    .join('')
  return (
    `<section aria-labelledby="noscript-results-heading" class="px-[5%] py-6">` +
    `<h2 id="noscript-results-heading" class="text-lg font-bold mb-3">${escapeHtml(heading)}</h2>` +
    `<ul>${items}</ul></section>`
  )
}

async function SaleContainersContent({ searchParams }: Props) {
  const params = await searchParams
  const { ptype = 'buy', zipcode, location } = params
  const isAccessories = ptype === 'accessories'

  const listingName = isAccessories ? 'Container Accessories' : 'Product Pricing'
  const listingPath = isAccessories ? ROUTES.PLP_ACCESSORIES : ROUTES.PLP

  const initialListing = await fetchListing(params)
  const { hits } = initialListing

  const jsonLd = graph([
    ...siteNodes(),
    // Mirrors the visible breadcrumb below exactly, per this project's own SEO
    // rule requiring BreadcrumbList structured data on listing pages.
    breadcrumbNode([
      { name: 'Home', path: ROUTES.HOME },
      { name: listingName, path: listingPath },
    ]),
    itemListNode(hits, `${listingName} — ${location ?? 'Near You'}`),
  ])

  return (
    <div className="min-h-screen bg-theme-subtle dark:bg-neutral-950">
      <JsonLd data={jsonLd} />
      <nav aria-label="Breadcrumb" className="px-[5%] pt-4 pb-1">
        <ol className="flex items-center gap-1 text-xs text-theme-muted">
          <li>
            <Link href={ROUTES.HOME} className="font-semibold text-theme-primary underline underline-offset-2 hover:decoration-2">Home</Link>
          </li>
          <li aria-hidden>/</li>
          <li className="dark:text-gray-400">
            {isAccessories ? 'Container Accessories' : 'Product Pricing'}
          </li>
        </ol>
      </nav>

      <LocationHeader location={location} zipcode={zipcode} ptype={ptype} />

      <Suspense fallback={<ResultsSkeleton />}>
        <InstantSearchSection initialListing={{ ...initialListing, hits: hits.map(toListingHit) }} />
      </Suspense>

      {/* The same `hits` as plain links, in case the server-rendered results
          above ever come out empty on a render the browser then has to fill in.
          Dropped by any browser that runs JS, so it costs nothing visually.

          One pre-built HTML string, not JSX children — see noscriptListingHtml. */}
      {hits.length > 0 && (
        <noscript dangerouslySetInnerHTML={{ __html: noscriptListingHtml(listingName, hits) }} />
      )}
    </div>
  )
}
