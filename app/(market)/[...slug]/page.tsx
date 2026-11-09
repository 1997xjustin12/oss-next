import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { WordPressPage } from '@/components/wp/WordPressPage'
import { isNativePath } from '@/config/routes'
import { wordPressPageMetadata } from '@/lib/wpPageMetadata'

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
 * TopBar/Navbar/Footer from (market)/layout.tsx. The rendering itself is
 * components/wp/WordPressPage.tsx, shared with the location route.
 */

type Props = {
  params: Promise<{ slug: string[] }>
}

// A link prefetch loads this route's App Shell (shared by every page of the
// route) rather than one page's whole payload; the content follows on click.
export const prefetch = 'partial'

/**
 * High-traffic WordPress pages built at deploy time. Every other path gets the
 * App Shell on its first request and is then served whole from the cache
 * ('days', busted by the `pages` tag) rather than rendered per view.
 */
const PRERENDERED_WP_PATHS = [
  // The other four that were here are native pages now (2026-11-06); this
  // route would only have answered Not Found for them.
  'complete-shipping-container-delivery-guide',
]

export function generateStaticParams() {
  return PRERENDERED_WP_PATHS.map((path) => ({ slug: path.split('/') }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  if (isNativePath(slug[0])) return { title: 'Not Found' }
  return wordPressPageMetadata(slug)
}

async function WpContent({ params }: Props) {
  const { slug } = await params
  if (isNativePath(slug[0])) notFound()
  return <WordPressPage slug={slug} />
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
