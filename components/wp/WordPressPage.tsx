import { notFound } from 'next/navigation'
import { JsonLd } from '@/components/shared/JsonLd'
import { findDepotByPath, toLocalBusinessInput } from '@/lib/locations'
import { EXTERNAL_HTML_ATTR } from '@/lib/linkEnrich'
import { breadcrumbFromPath, graph, localBusinessNode, siteNodes, webPageNode } from '@/lib/schema'
import { ASSET_CDN, fetchWpPage, hasSchemaType } from '@/services/wp-pages.service'

type Props = {
  /** The page's path segments, e.g. `['where-to-buy-shipping-containers', 'calgary-ab']`. */
  slug: string[]
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

/**
 * A converted WordPress page from the Django pages API, rendered inside the
 * app's own chrome. 404s when the backend has no such page.
 *
 * Shared by the catch-all (app/(market)/[...slug]) and the location route
 * (app/(market)/where-to-buy-shipping-containers/[location]), which serves the
 * location pages that are not native yet. The caller decides the path is
 * WordPress's; this only renders it.
 */
export async function WordPressPage({ slug }: Props) {
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
      <div
        {...{ [EXTERNAL_HTML_ATTR]: '' }}
        className={page.wrapperClass}
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </>
  )
}
