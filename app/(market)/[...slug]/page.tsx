import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { fetchWordPressPage } from '@/services/wp-proxy.service'
import { WpPageRenderer } from './_components/WpPageRenderer'

// Routes with dedicated Next.js pages — never forward these to the WP proxy.
const NATIVE_ROUTE_PREFIXES = ['product']

type Props = {
  params: Promise<{ slug: string[] }>
  searchParams: Promise<Record<string, string>>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  if (NATIVE_ROUTE_PREFIXES.includes(slug[0])) return { title: 'Not Found' }
  const data = await fetchWordPressPage(slug.join('/'))
  if (!data) return { title: 'Not Found' }

  const { meta } = data
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    robots: meta.robots,
    alternates: meta.canonical ? { canonical: meta.canonical } : undefined,
    openGraph: {
      title: meta.ogTitle ?? meta.title,
      description: meta.ogDescription ?? meta.description,
      images: meta.ogImage ? [{ url: meta.ogImage }] : undefined,
    },
    twitter: {
      card: (meta.twitterCard as 'summary' | 'summary_large_image') ?? 'summary_large_image',
    },
  }
}

async function ProxyContent({ params, searchParams }: Props) {
  const { slug } = await params
  if (NATIVE_ROUTE_PREFIXES.includes(slug[0])) notFound()
  const search = await searchParams

  // Check the page exists before rendering the iframe
  const data = await fetchWordPressPage(slug.join('/'))
  if (!data) notFound()

  const query = new URLSearchParams(search).toString()
  const src = `/api/wp-proxy/${slug.join('/')}${query ? `?${query}` : ''}`

  return <WpPageRenderer src={src} />
}

export default function WpProxyPage(props: Props) {
  return (
    <Suspense fallback={<div className="min-h-screen animate-pulse bg-gray-100" />}>
      <ProxyContent {...props} />
    </Suspense>
  )
}
