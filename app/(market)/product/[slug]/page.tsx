import { Suspense } from 'react'
import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import { notFound } from 'next/navigation'
import { getAllProductHandles, getProductByHandle } from '@/services/search.service'
import { getCustomFieldValue, getPriceBasis, isContainerHit } from '@/lib/pricing'
import { formatMoney } from '@/lib/formatters'
import { DEFAULT_LOCATION } from '@/lib/constants'
import { getContainerVideo } from '@/lib/containerVideo'
import { getContainerContent } from '@/lib/data/pdpShippingContainers'
import { breadcrumbNode, faqNode, graph, productNode, siteNodes } from '@/lib/schema'
import { JsonLd } from '@/components/shared/JsonLd'
import { ROUTES } from '@/config/routes'
import { ProductDetail } from './_components/ProductDetail'
import { isProductPanelV2 } from '@/lib/productPanel'
import { PdpSkeleton } from './_components/PdpSkeleton'
import type { ProductHit } from '@/types/product'

type Props = { params: Promise<{ slug: string }> }

// A link prefetch loads this route's App Shell (shared by every page of the
// route) rather than one page's whole payload; the content follows on click.
export const prefetch = 'partial'

/**
 * A few products are built at deploy time. Every other handle gets the App
 * Shell on its first request, is rendered with its params in the background,
 * and is then served whole from the cache until its tags or cache life expire —
 * instead of being rendered by a function on every view.
 *
 * Cache Components requires at least one entry, hence the placeholder (which
 * resolves to a 404) when the catalogue cannot be read during the build.
 */
export async function generateStaticParams() {
  // _doc order is arbitrary; swap in the best sellers once there is a list.
  const handles = (await getAllProductHandles()).slice(0, 24)
  return handles.length ? handles.map(({ handle }) => ({ slug: handle })) : [{ slug: '__placeholder__' }]
}

// Shared by generateMetadata's <meta name="description"> and the JSON-LD
// below, so the two can never drift apart and describe the same product
// two different ways.
function buildProductDescription(product: ProductHit, location: string): string {
  // "$232.14" on a rental product is a MONTHLY figure. Left unqualified here it
  // reaches the meta description and the JSON-LD description as the apparent
  // price of a 40ft container. getPriceBasis() is the single place that knows
  // which it is — see lib/pricing.ts.
  const basis = getPriceBasis(product)
  const price = `${formatMoney(product.sale_price)}${basis.suffix}`
  const qualified =
    basis.period === 'monthly'
      ? `${price} (${basis.label.toLowerCase()}${basis.termMonths ? `, ${basis.termMonths}-month term` : ''})`
      : `${price}`

  return isContainerHit(product)
    ? `Buy or rent a ${product.title}${location ? ` in ${location}` : ''}. From ${qualified}. Nationwide delivery in 1-5 days from 130+ depot locations.`
    : `${product.title} — from ${qualified}. Fast nationwide shipping.`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const result = await getProductByHandle(slug)
  /**
   * `notFound()` here, not only in the body below.
   *
   * The page streams behind a Suspense boundary, so by the time
   * `ProductContent` discovers the miss the 200 has already gone out and the
   * 404 page renders underneath it — a soft 404, which reads as a real page to
   * a crawler. Metadata is awaited before the shell flushes, so this is the
   * last point where the status can still be set. Measured 2026-09-30: an
   * unpublished handle returned HTTP 200 with the "Product Not Found" page.
   *
   * Costs no extra lookup — `getProductByHandle` is cached, so the body's call
   * is the same one.
   */
  if (!result) notFound()
  const { product } = result

  const rawLocation = getCustomFieldValue(product, 'location')
  const location = rawLocation === DEFAULT_LOCATION ? '' : rawLocation
  const grade = getCustomFieldValue(product, 'grade')
  const size = getCustomFieldValue(product, 'length_width')

  const description = buildProductDescription(product, location)

  return {
    title: product.title,
    description,
    alternates: { canonical: ROUTES.PRODUCT(slug) },
    openGraph: {
      title: product.title,
      description: [grade, size, location].filter(Boolean).join(' · ') || description,
      type: 'website',
      images: ogImages(product),
    },
  }
}

/**
 * The share image: the walkaround's poster frame when this spec has one, the
 * product record's first photograph otherwise.
 *
 * The poster wins because it is a still chosen for this exact size, condition
 * and grade, where the record image is whatever the catalogue happens to carry
 * — and because it is the only one of the two that is reliably large enough.
 * The posters supplied are 1920x1080; an OG card needs at least 600x315 to
 * render as a large image rather than a thumbnail.
 *
 * **Not the curated gallery photographs**, deliberately. They are the better
 * pictures of the product, but they are supplied around 500x306 — below that
 * 600x315 floor and well below the 1200px width Google wants for a product
 * rich result. Re-exported larger they would be the right source here; until
 * then pointing a crawler at them would be a downgrade.
 *
 * Dimensions are declared only for the record image, where 1200x630 is the
 * existing assumption. The poster's are left out rather than guessed: the
 * folder README asks for 1280x960 while every file supplied so far is
 * 1920x1080, so any number written here would be wrong for one of them. Every
 * crawler fetches the image regardless.
 *
 * Site-relative paths are fine — `metadataBase` in app/layout.tsx resolves them.
 */
function ogImages(product: ProductHit): NonNullable<NonNullable<Metadata['openGraph']>['images']> {
  // Guarded: the spec resolvers fall back to Used / AS IS / 20ft for a product
  // with no container fields, so an accessory would otherwise resolve to the
  // `used_20s_asis` stem and share a shipping-container walkaround.
  const poster = isContainerHit(product) ? getContainerVideo(product)?.poster : null
  if (poster) return [{ url: poster }]

  const first = product.images?.[0]?.src
  return first ? [{ url: first, width: 1200, height: 630 }] : []
}

/**
 * The page's whole graph: the shared site entities, the product itself, the
 * breadcrumb trail, and — for containers — the FAQ.
 *
 * The FAQ array is the very same one FaqAccordion renders from — both read it
 * out of PDP_SHIPPING_CONTAINERS for the size this product resolves to, so the
 * structured data can never claim a question the page doesn't show. Google
 * treats FAQ markup with no visible counterpart as a policy violation, so that
 * isn't just tidiness.
 */
function buildJsonLd(product: ProductHit, slug: string, now: Date) {
  const location = getCustomFieldValue(product, 'location')
  const realLocation = location && location !== DEFAULT_LOCATION ? location : undefined
  const description = buildProductDescription(product, realLocation ?? '')
  const isContainer = isContainerHit(product)

  const faqs = isContainer ? getContainerContent(product).faq : []

  return graph([
    ...siteNodes(),
    productNode(product, slug, description, now),
    breadcrumbNode([
      { name: 'Home', path: ROUTES.HOME },
      { name: 'Shipping Containers', path: ROUTES.PLP },
      { name: product.title },
    ]),
    faqNode(faqs),
  ])
}

/**
 * Today, for the JSON-LD's rolling `priceValidUntil`.
 *
 * Behind 'use cache' because a bare `new Date()` makes a page impossible to
 * prerender, and product pages are now cached whole (generateStaticParams).
 * The date only has to be right to the day, a year out.
 */
async function getToday(): Promise<number> {
  'use cache'
  cacheLife('days')
  return Date.now()
}

async function ProductContent({ params }: Props) {
  const { slug } = await params
  // In parallel: the switch is a cached Redis read, and nothing about the
  // product depends on it, so it must not add its latency to the product's.
  const [result, panelV2, today] = await Promise.all([getProductByHandle(slug), isProductPanelV2(), getToday()])
  if (!result) notFound()
  const { product, related_products } = result

  return (
    <>
      <JsonLd data={buildJsonLd(product, slug, new Date(today))} />
      {/* No separate no-JS copy of the specs and FAQ any more. Both are in the
          server HTML already: the tab section renders every panel (hiding the
          inactive ones) and the FAQ keeps collapsed answers in the DOM. The old
          <noscript> copy crashed cold renders — see BodyTabsSection. */}
      <ProductDetail product={product} relatedProducts={related_products} panelV2={panelV2} />
    </>
  )
}

/**
 * The handle is checked here, above the Suspense boundary, so a miss is a real
 * 404 status rather than a 200 with the not-found page streamed underneath.
 *
 * This used to be impossible: without generateStaticParams, `params` was
 * runtime data and reading it outside Suspense failed every prerender
 * ("encountered runtime data during prerendering", 2026-09-30). With known
 * params it is allowed. The cost: an unlisted handle has no App Shell to serve
 * on its very first request and waits for the render instead — after which the
 * whole page is cached, and `getProductByHandle` is the same cached read the
 * content below makes.
 */
export default async function ProductPage(props: Props) {
  const { slug } = await props.params
  if (!(await getProductByHandle(slug))) notFound()
  return (
    <Suspense fallback={<PdpSkeleton />}>
      <ProductContent {...props} />
    </Suspense>
  )
}
