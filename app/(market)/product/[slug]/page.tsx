import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductByHandle } from '@/services/search.service'
import { getCustomFieldValue, getPriceBasis, isContainerHit } from '@/lib/pricing'
import { DEFAULT_LOCATION } from '@/lib/constants'
import { resolveContainerVariant } from '@/lib/containerVariant'
import { PDP_SHIPPING_CONTAINERS } from '@/lib/data/pdpShippingContainers'
import { breadcrumbNode, faqNode, graph, productNode, siteNodes } from '@/lib/schema'
import { JsonLd } from '@/components/shared/JsonLd'
import { ROUTES } from '@/config/routes'
import { ProductDetail } from './_components/ProductDetail'
import { NoScriptDetails } from './_components/NoScriptDetails'
import { PdpSkeleton } from './_components/PdpSkeleton'
import type { ProductHit } from '@/types/product'

type Props = { params: Promise<{ slug: string }> }

// Shared by generateMetadata's <meta name="description"> and the JSON-LD
// below, so the two can never drift apart and describe the same product
// two different ways.
function buildProductDescription(product: ProductHit, location: string): string {
  // "$232.14" on a rental product is a MONTHLY figure. Left unqualified here it
  // reaches the meta description and the JSON-LD description as the apparent
  // price of a 40ft container. getPriceBasis() is the single place that knows
  // which it is — see lib/pricing.ts.
  const basis = getPriceBasis(product)
  const price = `$${product.sale_price}${basis.suffix}`
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
  if (!result) return { title: 'Product Not Found' }
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
      images: product.images?.[0]?.src ? [{ url: product.images[0].src, width: 1200, height: 630 }] : [],
    },
  }
}

/**
 * The page's whole graph: the shared site entities, the product itself, the
 * breadcrumb trail, and — for containers — the FAQ.
 *
 * The FAQ array is the very same one FaqAccordion renders from, keyed off the
 * same resolveContainerVariant() call, so the structured data can never claim a
 * question the page doesn't show. Google treats FAQ markup with no visible
 * counterpart as a policy violation, so that isn't just tidiness.
 */
function buildJsonLd(product: ProductHit, slug: string) {
  const location = getCustomFieldValue(product, 'location')
  const realLocation = location && location !== DEFAULT_LOCATION ? location : undefined
  const description = buildProductDescription(product, realLocation ?? '')
  const isContainer = isContainerHit(product)

  const faqs = isContainer ? PDP_SHIPPING_CONTAINERS[resolveContainerVariant(product)].faq : []

  return graph([
    ...siteNodes(),
    productNode(product, slug, description),
    breadcrumbNode([
      { name: 'Home', path: ROUTES.HOME },
      { name: 'Shipping Containers', path: ROUTES.PLP },
      { name: product.title },
    ]),
    faqNode(faqs),
  ])
}

async function ProductContent({ params }: Props) {
  const { slug } = await params
  const result = await getProductByHandle(slug)
  if (!result) notFound()
  const { product, related_products } = result

  return (
    <>
      <JsonLd data={buildJsonLd(product, slug)} />
      <ProductDetail product={product} relatedProducts={related_products} />
      {/* Specs and FAQ for consumers that don't run JS — the tabbed UI renders
          neither until hydration. See NoScriptDetails for why. */}
      {isContainerHit(product) && (
        <NoScriptDetails variant={resolveContainerVariant(product)} />
      )}
    </>
  )
}

export default function ProductPage(props: Props) {
  return (
    <Suspense fallback={<PdpSkeleton />}>
      <ProductContent {...props} />
    </Suspense>
  )
}
