import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchProduct } from '@/services/product.service'
import { ProductDetail } from './_components/ProductDetail'
import type { WpSingleProduct } from '@/types/product'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await fetchProduct(slug)
  if (!product) return { title: 'Product Not Found' }

  return {
    title: product.container_title,
    description: `Buy or rent a ${product.container_title} in ${product.location}. Starting at $${product.product_price}. Nationwide delivery in 1-5 days from 130+ depot locations.`,
    alternates: { canonical: `/product/${slug}` },
    openGraph: {
      title: product.container_title,
      description: `${product.grade} - ${product.size} - ${product.location} - From $${product.product_price}`,
      type: 'website',
      images: product.thumbnail_url ? [{ url: product.thumbnail_url, width: 1200, height: 630 }] : [],
    },
  }
}

function buildJsonLd(product: WpSingleProduct) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.container_title,
    sku: product.sku,
    description: `${product.grade} ${product.size} shipping container in ${product.location}.`,
    image: product.thumbnail_url,
    brand: { '@type': 'Brand', name: 'On-Site Storage Solutions' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: product.product_price?.replace(/,/g, ''),
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'On-Site Storage Solutions' },
    },
    aggregateRating: product.review_count
      ? { '@type': 'AggregateRating', ratingValue: product.ratings, reviewCount: String(product.review_count) }
      : undefined,
  }
}

async function ProductContent({ params }: Props) {
  const { slug } = await params
  const product = await fetchProduct(slug)
  if (!product) notFound()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(product)) }}
      />
      <ProductDetail product={product} />
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
