import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { AllCityPage } from '@/components/allCity/AllCityPage'
import { allCityPath } from '@/lib/allCityPage'
import { resolvePageMetadata } from '@/lib/seo'
import { getAllCityDepot, getAllCityPage, getAllCityTemplate } from '@/services/allCity.service'
import type { AllCityPage as AllCityPageRecord } from '@/types/allCity'

type Props = {
  params: Promise<{ slug: string }>
}

// As the other dynamic routes: a prefetch loads the route's shell, the page follows on click.
export const prefetch = 'partial'

// The slug is read above the Suspense boundary on purpose (see the page below):
// that is what makes an unknown city a real 404. It costs the instant shell on
// navigation, which dev reports as "URL data outside of Suspense"; this opts
// the route out of that check, as the docs offer (route-segment-config/instant).
export const instant = false

/**
 * The four pages migrated first are built at deploy time; the other 8,500
 * render on their first visit and are cached whole after it (every read is
 * cached). Building all of them would add thousands of pages to every deploy
 * for pages most of which see little traffic (docs/reference/all-city-pages.md §3.4).
 */
export function generateStaticParams() {
  return ['storage-units-cocoa-beach-fl', 'abbeville-storage-unit', 'abbott-shipping-containers', 'acme-storage-container'].map((slug) => ({ slug }))
}

/** The page to render, or null for an unknown or hidden slug. */
async function findPage(slug: string): Promise<AllCityPageRecord | null> {
  const page = await getAllCityPage(slug)
  return page && !page.hidden ? page : null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await findPage(slug)
  if (!page) notFound()
  const path = allCityPath(slug)
  // Not registered in the Page Configurator (8,541 rows would bury its list);
  // the page's SEO is edited on its own All City Pages screen.
  return resolvePageMetadata(path, {
    // WordPress's titles carry their own ending ("| Best Prices & Fast Delivery"), not the site's.
    title: page.seo.title,
    absoluteTitle: true,
    description: page.seo.description,
    canonical: page.seo.canonical || path,
    focusKeyphrase: page.seo.focusKeyphrase,
    keywords: page.seo.keywords,
    ...(page.seo.noindex ? { robots: { index: false, follow: true } } : {}),
    // Yoast declared article; WordPress had no og:image, so the site default applies.
    openGraph: { type: 'article' },
  })
}

async function CityContent({ page }: { page: AllCityPageRecord }) {
  const [template, depot] = await Promise.all([getAllCityTemplate(), getAllCityDepot(page.depotKey)])
  // The import refuses a row whose depot is unknown; an admin edit is validated the same way.
  if (!depot) notFound()
  return <AllCityPage page={page} template={template} depot={depot} />
}

/**
 * /all-city/[slug]: WordPress's "Cities" pages, at the URLs WordPress served.
 *
 * The slug is checked here, above the Suspense boundary, so an unknown or
 * hidden one is a real 404 and a redirect a real 301, rather than a 200 with
 * the outcome streamed underneath (the product route's pattern).
 */
export default async function AllCityRoutePage({ params }: Props) {
  const { slug } = await params
  const page = await findPage(slug)
  if (!page) notFound()
  if (page.redirectTo && page.redirectTo !== slug) permanentRedirect(allCityPath(page.redirectTo))
  return (
    <Suspense fallback={<div className="min-h-screen animate-pulse bg-neutral-100 dark:bg-neutral-900" />}>
      <CityContent page={page} />
    </Suspense>
  )
}
