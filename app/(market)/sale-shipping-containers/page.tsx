import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { fetchSaleProducts } from '@/services/product.service'
import { LocationHeader } from './_components/LocationHeader'
import { ProductCard } from './_components/ProductCard'
import { FilterPanel } from './_components/FilterPanel'
import { SortBar } from './_components/SortBar'
import { PageSkeleton } from './_components/PageSkeleton'

type SearchParams = {
  zipcode?: string
  location?: string
  ptype?: string
  sort?: string
  page?: string
}

type Props = { searchParams: Promise<SearchParams> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { location = 'Near You' } = await searchParams
  const title = `Shipping Containers for Sale ${location}`
  const description = `Buy used and new shipping containers near ${location}. 20ft, 40ft, high cube, and more. Best prices guaranteed — no tax, fast delivery.`
  return {
    title,
    description,
    alternates: { canonical: '/sale-shipping-containers' },
    openGraph: {
      title,
      description,
      images: ['/images/og-containers.jpg'],
    },
  }
}

// Synchronous shell — keeps searchParams outside the render until Suspense picks it up
export default function SaleContainersPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <SaleContainersContent searchParams={searchParams} />
    </Suspense>
  )
}

async function SaleContainersContent({ searchParams }: Props) {
  const { zipcode, location, ptype = 'buy', sort = 'default', page } = await searchParams
  const currentPage = Math.max(1, parseInt(page ?? '1', 10))

  const { products, maxPages } = await fetchSaleProducts({ location, ptype, sort, page: currentPage })

  // Serialize current params so client components can build updated URLs
  const paramsStr = new URLSearchParams({
    ...(location           && { location }),
    ...(zipcode            && { zipcode }),
    ...(ptype              && { ptype }),
    ...(sort !== 'default' && { sort }),
  }).toString()

  return (
    <div className="min-h-screen bg-theme-subtle">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="px-[5%] pt-4 pb-1">
        <ol className="flex items-center gap-1 text-xs text-theme-muted">
          <li>
            <Link href="/" className="font-semibold text-theme-primary hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>Product Pricing</li>
        </ol>
      </nav>

      {/* Location heading */}
      <LocationHeader location={location} zipcode={zipcode} />

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 px-[5%] pb-16">
        {/* Sidebar */}
        <aside className="order-2 lg:order-1">
          <FilterPanel zipcode={zipcode} location={location} ptype={ptype} />
        </aside>

        {/* Main */}
        <main className="order-1 lg:order-2 lg:col-span-3 flex flex-col gap-4">
          <SortBar
            count={products.length}
            location={location}
            currentSort={sort}
            baseParams={paramsStr}
            currentPage={currentPage}
            maxPages={maxPages}
          />

          <div className="flex flex-col gap-4">
            {products.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="rounded-lg border border-theme-border bg-white px-6 py-16 text-center">
                <p className="text-lg font-bold text-theme-dark mb-1">No containers found</p>
                <p className="text-sm text-theme-muted">
                  Try a different ZIP code or{' '}
                  <a href="tel:8889779085" className="text-theme-primary font-semibold hover:underline">
                    call us at (888) 977-9085
                  </a>
                  .
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {maxPages > 1 && (
            <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5 py-2">
              {currentPage > 1 && (
                <Link
                  href={`/sale-shipping-containers?${paramsStr}&page=${currentPage - 1}`}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-theme-border text-sm font-bold text-theme-dark-2 hover:border-theme-primary hover:text-theme-primary transition-colors"
                >
                  ‹
                </Link>
              )}
              {Array.from({ length: maxPages }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={`/sale-shipping-containers?${paramsStr}&page=${n}`}
                  className={`flex h-9 w-9 items-center justify-center rounded-md border text-sm font-bold transition-colors ${
                    n === currentPage
                      ? 'border-theme-primary bg-theme-primary text-white'
                      : 'border-theme-border text-theme-dark-2 hover:border-theme-primary hover:text-theme-primary'
                  }`}
                >
                  {n}
                </Link>
              ))}
              {currentPage < maxPages && (
                <Link
                  href={`/sale-shipping-containers?${paramsStr}&page=${currentPage + 1}`}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-theme-border text-sm font-bold text-theme-dark-2 hover:border-theme-primary hover:text-theme-primary transition-colors"
                >
                  ›
                </Link>
              )}
            </nav>
          )}
        </main>
      </div>
    </div>
  )
}
