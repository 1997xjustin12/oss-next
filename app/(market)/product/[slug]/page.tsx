import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductByHandle } from '@/services/search.service'
import { getCustomFieldValue, isContainerHit } from '@/lib/pricing'
import { ProductDetail } from './_components/ProductDetail'
import type { ProductHit } from '@/types/product'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const result = await getProductByHandle(slug)
  if (!result) return { title: 'Product Not Found' }
  const { product } = result

  const location = getCustomFieldValue(product, 'location')
  const grade = getCustomFieldValue(product, 'grade')
  const size = getCustomFieldValue(product, 'length_width')

  const description = isContainerHit(product)
    ? `Buy or rent a ${product.title}${location ? ` in ${location}` : ''}. Starting at $${product.sale_price}. Nationwide delivery in 1-5 days from 130+ depot locations.`
    : `${product.title} — starting at $${product.sale_price}. Fast nationwide shipping.`

  return {
    title: product.title,
    description,
    alternates: { canonical: `/product/${slug}` },
    openGraph: {
      title: product.title,
      description: [grade, size, location].filter(Boolean).join(' · ') || description,
      type: 'website',
      images: product.images?.[0]?.src ? [{ url: product.images[0].src, width: 1200, height: 630 }] : [],
    },
  }
}

function buildJsonLd(product: ProductHit) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    sku: product.variants?.[0]?.sku,
    image: product.images?.[0]?.src,
    brand: { '@type': 'Brand', name: 'On-Site Storage Solutions' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: product.sale_price,
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'On-Site Storage Solutions' },
    },
    // NOTE: no aggregateRating — the ES index only carries a bare `ratings`
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(product)) }}
      />
      <ProductDetail product={product} relatedProducts={related_products} />
    </>
  )
}

export default function ProductPage(props: Props) {
  return (
    <Suspense fallback={<div className="min-h-screen animate-pulse bg-theme-subtle" />}>
      <ProductContent {...props} />
    </Suspense>
  )
}
