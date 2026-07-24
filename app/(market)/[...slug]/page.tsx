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
  'blogs',
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
    // seo_title is the title WordPress already serves for this page, brand
    // suffix included ("Privacy Policy | On-Site Storage Solutions"). The root
    // layout's "%s | On-Site Storage Solutions" template would append a second
    // one, so it's marked absolute to reproduce the live page exactly. The bare
    // `title` fallback is unbranded, so that one does want the template.
    title: page.seo_title ? { absolute: page.seo_title } : page.title,
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

  return (
    <>
      <link rel="preconnect" href={ASSET_CDN} />
      {page.preloads.map((href) => (
        <link key={href} rel="preload" as="image" href={href} fetchPriority="high" />
      ))}

      {/* Theme + per-page CSS, rewritten to apply only inside the wrapper
          below. The WordPress stylesheet styles bare `a`/`span`/`div` with
          !important, so injecting it unscoped restyles the app's own
          TopBar/Navbar/Footer — hence the scoping in the service.

          global_css_url is deliberately NOT used as a fallback: a plain
          <link> can't be scoped and would leak over the chrome. */}
      {page.scopedCss && <style dangerouslySetInnerHTML={{ __html: page.scopedCss }} />}

      {/* Carries the original WP body classes, which scopeCss() rewrote
          `body.foo` selectors to depend on. */}
      <div className={page.wrapperClass} dangerouslySetInnerHTML={{ __html: page.content }} />
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
