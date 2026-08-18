import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { cachedEsSearch, DEFAULT_LOCATION } from '@/services/search.service'
import { getPriceBasis } from '@/lib/pricing'
import { JsonLd } from '@/components/shared/JsonLd'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { ROUTES } from '@/config/routes'
import { breadcrumbNode, graph, itemListNode, siteNodes } from '@/lib/schema'
import { resolvePageMetadata } from '@/lib/seo'
import { LocationHeader } from './_components/LocationHeader'
import { InstantSearchSection } from './_components/InstantSearchSection'
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
 * The first page of results, fetched server-side purely so the page can emit an
 * ItemList describing what a visitor actually sees.
 *
 * The results themselves are still rendered by InstantSearch on the client —
 * this does not replace that. It exists because the client-only listing is
 * invisible to any crawler or agent that doesn't execute JavaScript, which
 * includes most of them: without this, the PLP's HTML advertises a shop with no
 * products in it.
 *
 * Params mirror InstantSearchSection's URL reads one-for-one, and hitsPerPage
 * matches its <Configure hitsPerPage={12} />, so the list describes the same 12
 * items the visitor gets. Failure is non-fatal — a missing ItemList is a much
 * smaller problem than a listing page that won't render.
 */
async function fetchListingHits(params: SearchParams): Promise<ProductHit[]> {
  const isAccessories = params.ptype === 'accessories'
  try {
    const { hits } = await cachedEsSearch({
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
    return hits as ProductHit[]
  } catch (err) {
    console.error('[plp] ItemList search failed, omitting structured data:', err)
    return []
  }
}

async function SaleContainersContent({ searchParams }: Props) {
  const params = await searchParams
  const { ptype = 'buy', zipcode, location } = params
  const isAccessories = ptype === 'accessories'

  const listingName = isAccessories ? 'Container Accessories' : 'Product Pricing'
  const listingPath = isAccessories ? ROUTES.PLP_ACCESSORIES : ROUTES.PLP

  const hits = await fetchListingHits(params)

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
            <Link href={ROUTES.HOME} className="font-semibold text-theme-primary hover:underline">Home</Link>
          </li>
          <li aria-hidden>/</li>
          <li className="dark:text-gray-400">
            {isAccessories ? 'Container Accessories' : 'Product Pricing'}
          </li>
        </ol>
      </nav>

      <LocationHeader location={location} zipcode={zipcode} ptype={ptype} />

      <Suspense fallback={<ResultsSkeleton />}>
        <InstantSearchSection />
      </Suspense>

      {/* The results grid above is rendered entirely by InstantSearch on the
          client, so without JavaScript this page is a shop with no products in
          it. These are the same `hits` the ItemList structured data describes,
          as real links a crawler can follow. Dropped by any browser that runs
          JS, so it costs nothing visually. */}
      {hits.length > 0 && (
        <noscript>
          <section aria-labelledby="noscript-results-heading" className="px-[5%] py-6">
            <h2 id="noscript-results-heading" className="text-lg font-bold mb-3">
              {listingName}
            </h2>
            <ul>
              {hits.map((hit) => {
                const basis = getPriceBasis(hit)
                return (
                  <li key={hit.handle} className="mb-2">
                    <Link href={ROUTES.PRODUCT(hit.handle)}>{hit.title}</Link>
                    {hit.sale_price ? ` — $${hit.sale_price}${basis.suffix}` : ''}
                    {basis.period === 'monthly' ? ` (${basis.label.toLowerCase()})` : ''}
                  </li>
                )
              })}
            </ul>
          </section>
        </noscript>
      )}
    </div>
  )
}
