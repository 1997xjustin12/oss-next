import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductByHandle } from '@/services/search.service'
import { getCustomFieldValue, isContainerHit } from '@/lib/pricing'
import { DEFAULT_LOCATION } from '@/lib/constants'
import { BASE_URL } from '@/lib/helpers'
import { getQuickSpecs } from '@/lib/data/pdpShippingContainers'
import { JsonLd } from '@/components/shared/JsonLd'
import { ROUTES } from '@/config/routes'
import { ProductDetail } from './_components/ProductDetail'
import { PdpSkeleton } from './_components/PdpSkeleton'
import type { ProductHit } from '@/types/product'

type Props = { params: Promise<{ slug: string }> }

// Shared by generateMetadata's <meta name="description"> and the JSON-LD
// below, so the two can never drift apart and describe the same product
// two different ways.
function buildProductDescription(product: ProductHit, location: string): string {
  return isContainerHit(product)
    ? `Buy or rent a ${product.title}${location ? ` in ${location}` : ''}. Starting at $${product.sale_price}. Nationwide delivery in 1-5 days from 130+ depot locations.`
    : `${product.title} — starting at $${product.sale_price}. Fast nationwide shipping.`
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

// schema.org's condition enum — only emitted when our own `condition`
// custom_fields value actually maps to one of these three real states.
const CONDITION_SCHEMA: Record<string, string> = {
  New: 'https://schema.org/NewCondition',
  Used: 'https://schema.org/UsedCondition',
  Refurbished: 'https://schema.org/RefurbishedCondition',
}

const PAYMENT_TYPE_LABEL: Record<string, string> = {
  buy: 'Buy',
  rental: 'Rental',
  rto: 'Rent-to-Own',
}

// lib/data/pdpShippingContainers.ts's lbsTare is a reference figure, either a
// single value ("4,914") or a manufacturer-variance range ("8,000–8,400") —
// schema.org's weight.value wants one number, so a range is averaged rather
// than guessed at or dropped.
function parseTareWeight(lbsTare: string): number | undefined {
  const nums = lbsTare.replace(/,/g, '').match(/\d+(\.\d+)?/g)
  if (!nums || nums.length === 0) return undefined
  const values = nums.map(Number)
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
}

function buildJsonLd(product: ProductHit, slug: string) {
  const sku = product.variants?.[0]?.sku
  const isContainer = isContainerHit(product)
  const location = getCustomFieldValue(product, 'location')
  const realLocation = location && location !== DEFAULT_LOCATION ? location : undefined
  const condition = getCustomFieldValue(product, 'condition')
  const conditionSchema = CONDITION_SCHEMA[condition]
  const paymentType = getCustomFieldValue(product, 'payment_type')

  const additionalProperty = isContainer
    ? [
        { '@type': 'PropertyValue', name: 'Container Size', value: getCustomFieldValue(product, 'length_width') },
        { '@type': 'PropertyValue', name: 'Grade', value: getCustomFieldValue(product, 'grade') },
        { '@type': 'PropertyValue', name: 'Height Type', value: getCustomFieldValue(product, 'height') },
        { '@type': 'PropertyValue', name: 'Material', value: 'Corten Steel' },
        ...(PAYMENT_TYPE_LABEL[paymentType]
          ? [{ '@type': 'PropertyValue', name: 'Payment Type', value: PAYMENT_TYPE_LABEL[paymentType] }]
          : []),
        ...(realLocation ? [{ '@type': 'PropertyValue', name: 'Delivery Location', value: realLocation }] : []),
      ].filter((p) => p.value)
    : undefined

  const tareWeight = isContainer ? parseTareWeight(getQuickSpecs(product).lbsTare) : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    ...(sku && { sku, mpn: sku, gtin: sku }), // no real GTIN data exists — reusing the SKU, same as mpn
    description: buildProductDescription(product, realLocation ?? ''),
    image: product.images?.map((img) => img.src).filter(Boolean),
    ...(conditionSchema && { itemCondition: conditionSchema }),
    brand: { '@type': 'Brand', name: 'On-Site Storage Solutions' },
    ...(additionalProperty && additionalProperty.length > 0 && { additionalProperty }),
    ...(tareWeight && { weight: { '@type': 'QuantitativeValue', value: tareWeight, unitCode: 'LBR' } }),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: product.sale_price,
      availability: 'https://schema.org/InStock',
      ...(conditionSchema && { itemCondition: conditionSchema }),
      // A rolling window rather than a fixed date so this never goes stale —
      // container pricing is reviewed well within a year.
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      url: `${BASE_URL.replace(/\/$/, '')}/product/${slug}`,
      seller: { '@type': 'Organization', name: 'On-Site Storage Solutions' },
      ...(isContainer && {
        shippingDetails: {
          '@type': 'OfferShippingDetails',
          shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 2, unitCode: 'DAY' },
            transitTime: { '@type': 'QuantitativeValue', minValue: 3, maxValue: 5, unitCode: 'DAY' },
          },
        },
      }),
      // No hasMerchantReturnPolicy — the real return policy (a money-back
      // guarantee minus shipping, per the PDP Warranty tab) hasn't been
      // finalized into concrete terms (return window, conditions) yet.
      // Add this once that's settled; don't guess at it in the meantime.
    },
    // No aggregateRating — the ES index only carries a bare `ratings`
    // number, no reviewCount, and schema.org's AggregateRating requires one.
  }
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
