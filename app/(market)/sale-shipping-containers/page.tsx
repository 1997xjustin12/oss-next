import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { LocationHeader } from './_components/LocationHeader'
import { InstantSearchSection } from './_components/InstantSearchSection'

type SearchParams = {
  zipcode?:  string
  location?: string
  ptype?:    string
}

type Props = { searchParams: Promise<SearchParams> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { location = 'Near You', ptype = 'buy' } = await searchParams

  if (ptype === 'accessories') {
    const title       = `Shipping Container Accessories ${location}`
    const description = `Shop locks, ramps, vents, shelving kits, and more near ${location}. Fast shipping, low prices.`
    return {
      title,
      description,
      alternates: { canonical: '/sale-shipping-containers?ptype=accessories' },
      openGraph:  { title, description, images: ['/images/og-containers.jpg'] },
    }
  }

  const title       = `Shipping Containers for Sale ${location}`
  const description = `Buy used and new shipping containers near ${location}. 20ft, 40ft, high cube, and more. Best prices guaranteed — no tax, fast delivery.`
  return {
    title,
    description,
    alternates: { canonical: '/sale-shipping-containers' },
    openGraph:  { title, description, images: ['/images/og-containers.jpg'] },
  }
}

export default function SaleContainersPage({ searchParams }: Props) {
  return (
    <Suspense>
      <SaleContainersContent searchParams={searchParams} />
    </Suspense>
  )
}

async function SaleContainersContent({ searchParams }: Props) {
  const { ptype = 'buy', zipcode, location } = await searchParams

  return (
    <div className="min-h-screen bg-theme-subtle dark:bg-neutral-950">
      <nav aria-label="Breadcrumb" className="px-[5%] pt-4 pb-1">
        <ol className="flex items-center gap-1 text-xs text-theme-muted">
          <li>
            <Link href="/" className="font-semibold text-theme-primary hover:underline">Home</Link>
          </li>
          <li aria-hidden>/</li>
          <li className="dark:text-gray-400">
            {ptype === 'accessories' ? 'Container Accessories' : 'Product Pricing'}
          </li>
        </ol>
      </nav>

      <LocationHeader location={location} zipcode={zipcode} ptype={ptype} />

      <Suspense>
        <InstantSearchSection />
      </Suspense>
    </div>
  )
}
