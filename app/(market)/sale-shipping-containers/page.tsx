import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/shared/JsonLd'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { ROUTES } from '@/config/routes'
import { resolvePageMetadata } from '@/lib/seo'
import { LocationHeader } from './_components/LocationHeader'
import { InstantSearchSection } from './_components/InstantSearchSection'
import { PageSkeleton, ResultsSkeleton } from './_components/PageSkeleton'

type SearchParams = {
  zipcode?:  string
  location?: string
  ptype?:    string
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

async function SaleContainersContent({ searchParams }: Props) {
  const { ptype = 'buy', zipcode, location } = await searchParams
  const isAccessories = ptype === 'accessories'

  // Mirrors the visible breadcrumb below exactly, per this project's own SEO
  // rule requiring BreadcrumbList structured data on listing pages.
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://onsitestorage.com' },
      {
        '@type': 'ListItem',
        position: 2,
        name: isAccessories ? 'Container Accessories' : 'Product Pricing',
        item: isAccessories
          ? 'https://onsitestorage.com/sale-shipping-containers?ptype=accessories'
          : 'https://onsitestorage.com/sale-shipping-containers',
      },
    ],
  }

  return (
    <div className="min-h-screen bg-theme-subtle dark:bg-neutral-950">
      <JsonLd data={breadcrumbJsonLd} />
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
    </div>
  )
}
