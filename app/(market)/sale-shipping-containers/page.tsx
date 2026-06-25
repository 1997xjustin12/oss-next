import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { fetchSaleProducts, fetchAccessories } from '@/services/product.service'
import { LocationHeader } from './_components/LocationHeader'
import { ProductCard } from './_components/ProductCard'
import { AccessoryCard } from './_components/AccessoryCard'
import { FilterPanel } from './_components/FilterPanel'
import { SortBar } from './_components/SortBar'
import { ZipLookup } from './_components/ZipLookup'
import { MobileFilterSheet } from './_components/MobileFilterSheet'
import { PageSkeleton } from './_components/PageSkeleton'

type SearchParams = {
  zipcode?: string
  location?: string
  ptype?: string
  sort?: string
  page?: string
  category?: string
  length_width?: string
  condition?: string
  grade?: string
  height?: string
  type?: string
}

type Props = { searchParams: Promise<SearchParams> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { location = 'Near You', ptype = 'buy' } = await searchParams

  if (ptype === 'accessories') {
    const title = `Shipping Container Accessories ${location}`
    const description = `Shop locks, ramps, vents, shelving kits, and more near ${location}. Fast shipping, low prices.`
    return {
      title,
      description,
      alternates: { canonical: '/sale-shipping-containers?ptype=accessories' },
      openGraph: { title, description, images: ['/images/og-containers.jpg'] },
    }
  }

  const title = `Shipping Containers for Sale ${location}`
  const description = `Buy used and new shipping containers near ${location}. 20ft, 40ft, high cube, and more. Best prices guaranteed — no tax, fast delivery.`
  return {
    title,
    description,
    alternates: { canonical: '/sale-shipping-containers' },
    openGraph: { title, description, images: ['/images/og-containers.jpg'] },
  }
}

// Outer shell — keeps the Promise outside of render until Suspense resolves
export default function SaleContainersPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <SaleContainersContent searchParams={searchParams} />
    </Suspense>
  )
}

// Dispatcher — resolves ptype then branches to the appropriate layout
async function SaleContainersContent({ searchParams }: Props) {
  const params = await searchParams
  const ptype = params.ptype ?? 'buy'
  const { zipcode, location } = params

  return (
    <div className="min-h-screen bg-theme-subtle dark:bg-neutral-950">
      {/* Breadcrumb — shared */}
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

      {/* Location heading — shared */}
      <LocationHeader location={location} zipcode={zipcode} ptype={ptype} />

      {/* Mobile ZIP lookup — buy/rental/rto only, visible below lg */}
      {ptype !== 'accessories' && (
        <div className="lg:hidden px-[5%] pb-3">
          <Suspense>
            <ZipLookup initialZip={zipcode} location={location} ptype={ptype} />
          </Suspense>
        </div>
      )}

      {/* Branch by product type */}
      {ptype === 'accessories'
        ? <AccessoriesLayout params={params} />
        : <ContainersLayout params={params} />
      }
    </div>
  )
}

// ─── Containers layout (buy / rental / rto) ───────────────────────────────────

async function ContainersLayout({ params }: { params: SearchParams }) {
  const {
    zipcode, location, ptype = 'buy', sort = 'default', page,
    length_width, condition, grade, height, type: containerType,
  } = params
  const currentPage = Math.max(1, parseInt(page ?? '1', 10))

  const { products, maxPages } = await fetchSaleProducts({
    location, ptype, sort, page: currentPage,
    length_width, condition, grade, height,
  })

  const paramsStr = new URLSearchParams({
    ...(location           && { location }),
    ...(zipcode            && { zipcode }),
    ...(ptype              && { ptype }),
    ...(sort !== 'default' && { sort }),
    ...(length_width       && { length_width }),
    ...(condition          && { condition }),
    ...(grade              && { grade }),
    ...(height             && { height }),
    ...(containerType      && { type: containerType }),
  }).toString()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 px-[5%] pb-16">
      {/* Sidebar — desktop only */}
      <aside className="hidden lg:block order-2 lg:order-1">
        <FilterPanel zipcode={zipcode} location={location} ptype={ptype} />
      </aside>

      <main className="order-1 lg:order-2 lg:col-span-3 flex flex-col gap-4">
        {/* Mobile filter chips + drawer */}
        <div className="lg:hidden">
          <Suspense>
            <MobileFilterSheet ptype={ptype} />
          </Suspense>
        </div>

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
            <EmptyState label="No containers found" />
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          maxPages={maxPages}
          paramsStr={paramsStr}
          basePath="/sale-shipping-containers"
        />
      </main>
    </div>
  )
}

// ─── Accessories layout ────────────────────────────────────────────────────────

const ACCESSORY_CATEGORIES = [
  { label: 'All',      value: null },
  { label: 'Lighting', value: 'lighting' },
  { label: 'Parts',    value: 'parts' },
  { label: 'Ramp',     value: 'ramp-accesories' },
  { label: 'Security', value: 'security' },
  { label: 'Shelving', value: 'shelving' },
  { label: 'Others',   value: 'others' },
] as const

const ACCESSORIES_SORT_OPTIONS = [
  { value: 'default',    label: 'Default' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc',   label: 'Name: A → Z' },
  { value: 'name-desc',  label: 'Name: Z → A' },
]

async function AccessoriesLayout({ params }: { params: SearchParams }) {
  const { zipcode, location, sort = 'default', page, category } = params
  const currentPage = Math.max(1, parseInt(page ?? '1', 10))

  const { accessories, maxPages } = await fetchAccessories({
    page: currentPage,
    sort,
    category,
  })

  const paramsStr = new URLSearchParams({
    ptype: 'accessories',
    ...(location           && { location }),
    ...(zipcode            && { zipcode }),
    ...(sort !== 'default' && { sort }),
    ...(category           && { category }),
  }).toString()

  const categoryHref = (cat: string | null) => {
    const p = new URLSearchParams(paramsStr)
    if (cat) p.set('category', cat)
    else p.delete('category')
    p.delete('page')
    return `/sale-shipping-containers?${p.toString()}`
  }

  return (
    <div className="px-[5%] pb-16 flex flex-col gap-4">
      {/* Category filter chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {ACCESSORY_CATEGORIES.map((cat) => {
          const isActive = cat.value === null ? !category : category === cat.value
          return (
            <Link
              key={cat.label}
              href={categoryHref(cat.value)}
              scroll={false}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold border transition-colors ${
                isActive
                  ? 'bg-theme-primary text-white border-theme-primary'
                  : 'bg-white dark:bg-neutral-900 text-theme-dark-2 dark:text-gray-300 border-theme-border dark:border-neutral-700 hover:border-theme-primary dark:hover:border-theme-primary'
              }`}
            >
              {cat.label}
            </Link>
          )
        })}
      </div>

      <SortBar
        count={accessories.length}
        location={location}
        currentSort={sort}
        baseParams={paramsStr}
        currentPage={currentPage}
        maxPages={maxPages}
        sortOptions={ACCESSORIES_SORT_OPTIONS}
        itemLabel="item"
      />

      {accessories.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {accessories.map((product) => (
            <AccessoryCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState label="No accessories found" />
      )}

      <Pagination
        currentPage={currentPage}
        maxPages={maxPages}
        paramsStr={paramsStr}
        basePath="/sale-shipping-containers"
      />
    </div>
  )
}

// ─── Shared sub-components ─────────────────────────────────────────────────────

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-theme-border dark:border-neutral-800 bg-white dark:bg-neutral-900 px-6 py-16 text-center">
      <p className="text-lg font-bold text-theme-dark dark:text-gray-100 mb-1">{label}</p>
      <p className="text-sm text-theme-muted dark:text-gray-400">
        Try a different ZIP code or{' '}
        <a href="tel:8889779085" className="text-theme-primary font-semibold hover:underline">
          call us at (888) 977-9085
        </a>
        .
      </p>
    </div>
  )
}

function Pagination({
  currentPage,
  maxPages,
  paramsStr,
  basePath,
}: {
  currentPage: number
  maxPages: number
  paramsStr: string
  basePath: string
}) {
  if (maxPages <= 1) return null
  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5 py-2">
      {currentPage > 1 && (
        <Link
          href={`${basePath}?${paramsStr}&page=${currentPage - 1}`}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-theme-border dark:border-neutral-700 text-sm font-bold text-theme-dark-2 dark:text-gray-400 hover:border-theme-primary hover:text-theme-primary transition-colors"
        >
          ‹
        </Link>
      )}
      {Array.from({ length: maxPages }, (_, i) => i + 1).map((n) => (
        <Link
          key={n}
          href={`${basePath}?${paramsStr}&page=${n}`}
          className={`flex h-9 w-9 items-center justify-center rounded-md border text-sm font-bold transition-colors ${
            n === currentPage
              ? 'border-theme-primary bg-theme-primary text-white'
              : 'border-theme-border dark:border-neutral-700 text-theme-dark-2 dark:text-gray-400 hover:border-theme-primary hover:text-theme-primary'
          }`}
        >
          {n}
        </Link>
      ))}
      {currentPage < maxPages && (
        <Link
          href={`${basePath}?${paramsStr}&page=${currentPage + 1}`}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-theme-border dark:border-neutral-700 text-sm font-bold text-theme-dark-2 dark:text-gray-400 hover:border-theme-primary hover:text-theme-primary transition-colors"
        >
          ›
        </Link>
      )}
    </nav>
  )
}
