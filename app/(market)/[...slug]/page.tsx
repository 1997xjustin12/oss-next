import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { fetchWpPage, hasSchemaType, ASSET_CDN } from '@/services/wp-pages.service'
import { findDepotByPath, toLocalBusinessInput } from '@/lib/locations'
import { breadcrumbFromPath, graph, localBusinessNode, siteNodes, webPageNode } from '@/lib/schema'
import { JsonLd } from '@/components/shared/JsonLd'
import { isNativePath } from '@/config/routes'

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

type Props = {
  params: Promise<{ slug: string[] }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  if (isNativePath(slug[0])) return { title: 'Not Found' }

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

/**
 * A depot page gets a LocalBusiness built from the real record in
 * config/locations.ts — address, phone, coordinates and opening hours.
 *
 * These pages are the ones most likely to be surfaced by an assistant answering
 * "who delivers shipping containers near me", and they are exactly the pages
 * where an agent reading Elementor markup learns nothing. Matching is by the
 * record's own `local_specials` URL, so a page with no matching depot simply
 * gets nothing — better than attaching the wrong branch's phone number.
 */
function localBusinessNodes(path: string, recovered: unknown[]) {
  if (hasSchemaType(recovered, 'LocalBusiness')) return []
  const depot = findDepotByPath(path)
  if (!depot) return []
  return [localBusinessNode(toLocalBusinessInput(depot, path))]
}

async function WpContent({ params }: Props) {
  const { slug } = await params
  if (isNativePath(slug[0])) notFound()

  const page = await fetchWpPage(slug)
  if (!page) notFound()

  const path = `/${slug.join('/')}`

  // Structured data for the converted pages, in two parts.
  //
  // 1. Whatever the original WordPress page already had. Its own SEO plugin's
  //    output is more specific than anything derivable here, so it wins — it
  //    used to be destroyed by the script strip in wp-pages.service.ts.
  // 2. What we can derive: the site entities, a WebPage node, a breadcrumb
  //    trail from the URL, and — on depot pages — a LocalBusiness built from
  //    config/locations.ts.
  //
  // Node types the recovered data already covers are skipped rather than
  // emitted twice: two BreadcrumbLists on one page is a validation error, and
  // the page's own is likelier to have correct labels than segment guessing.
  const recovered = page.structuredData
  const derived = graph([
    ...siteNodes(),
    hasSchemaType(recovered, 'WebPage')
      ? null
      : webPageNode({
          path,
          name: page.title,
          description: page.seo_description ?? undefined,
        }),
    hasSchemaType(recovered, 'BreadcrumbList') ? null : breadcrumbFromPath(slug, page.title),
    ...localBusinessNodes(path, recovered),
  ])

  return (
    <>
      {recovered.length > 0 && <JsonLd data={recovered as object[]} />}
      <JsonLd data={derived} />

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
