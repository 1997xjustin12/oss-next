import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { fetchWpPage, ASSET_CDN } from '@/services/wp-pages.service'

/**
 * Catch-all for converted WordPress pages.
 *
 *   /customer-fabrication-gallery/shipping-container-floor  -> Django pages API
 *
 * This is a REQUIRED catch-all ([...slug], not [[...slug]]), so it never
 * matches "/" — the homepage stays with (home)/page.tsx. Next.js also gives
 * static segments priority, so every native route below (market) wins over
 * this file.
 *
 * The converted markup ships its own WordPress theme CSS but has its header
 * and footer stripped in the service, so pages render inside the app's own
 * TopBar/Navbar/Footer from (market)/layout.tsx.
 */

// Routes with dedicated Next.js pages — never forward these to the pages API.
// Guards partial matches (e.g. "/product" with no handle) that would otherwise
// fall through to this catch-all.
const NATIVE_ROUTE_PREFIXES = [
  'product',
  'cart',
  'checkout',
  'wishlist',
  'my-account',
  'sale-shipping-containers',
]

type Props = {
  params: Promise<{ slug: string[] }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  if (NATIVE_ROUTE_PREFIXES.includes(slug[0])) return { title: 'Not Found' }

  const page = await fetchWpPage(slug)
  if (!page) return { title: 'Not Found' }

  return {
    title: page.seo_title || page.title,
    description: page.seo_description ?? undefined,
    alternates: page.canonical_url ? { canonical: page.canonical_url } : undefined,
    openGraph: {
      title: page.og_title || page.seo_title || page.title,
      description: page.og_description || page.seo_description || undefined,
      images: page.og_image ? [{ url: page.og_image }] : undefined,
    },
  }
}

async function WpContent({ params }: Props) {
  const { slug } = await params
  if (NATIVE_ROUTE_PREFIXES.includes(slug[0])) notFound()

  const page = await fetchWpPage(slug)
  if (!page) notFound()

  // Theme CSS targets body classes (e.g. body.elementor-page-123) — add the
  // original WP body classes so those selectors match. Additive, not a
  // reassignment: the root layout and providers put their own classes on
  // <body>, and clobbering them would break the surrounding app.
  const bodyClassScript = page.body_classes?.length
    ? `document.body.classList.add(${page.body_classes.map((c) => JSON.stringify(c)).join(', ')});`
    : ''

  return (
    <>
      <link rel="preconnect" href={ASSET_CDN} />
      {page.preloads.map((href) => (
        <link key={href} rel="preload" as="image" href={href} fetchPriority="high" />
      ))}

      {/* Per-page pruned subset of the theme CSS (from the API) — falls back
          to the full stylesheet on the CDN if the API didn't provide one. */}
      {page.global_css ? (
        <style dangerouslySetInnerHTML={{ __html: page.global_css }} />
      ) : (
        page.global_css_url && <link rel="stylesheet" href={page.global_css_url} />
      )}
      {page.css && <style dangerouslySetInnerHTML={{ __html: page.css }} />}

      {bodyClassScript && <script dangerouslySetInnerHTML={{ __html: bodyClassScript }} />}

      <div dangerouslySetInnerHTML={{ __html: page.content }} />
    </>
  )
}

/**
 * `params` is request-time data, so under cacheComponents the work has to sit
 * behind a Suspense boundary — otherwise it blocks the whole route from
 * prerendering and the build fails.
 */
export default function WpContentPage(props: Props) {
  return (
    <Suspense fallback={<div className="min-h-screen animate-pulse bg-gray-100" />}>
      <WpContent {...props} />
    </Suspense>
  )
}
