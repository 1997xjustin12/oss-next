import { SCHEMA_ID, SITE } from '@/config/site'
import { getGbpPage } from '@/lib/data/gbpPages'
import { GBP_HEAD } from '@/lib/data/gbpShared'
import { breadcrumbNode, faqNode, graph, ref, siteNodes, webPageNode, type SchemaNode } from '@/lib/schema'
import type { PageSeoDefaults } from '@/types/seo'
import type { GbpOpeningHours, GbpPage } from '@/types/gbp'

/**
 * Helpers for the GBP location pages (app/(gbp)). Reference:
 * docs/reference/gbp-subdomain-pages.md
 */

/** A page's data by slug; throws for a slug with no entry (a route without data is a build error). */
export function requireGbpPage(slug: string): GbpPage {
  const page = getGbpPage(slug)
  if (!page) throw new Error(`[gbp] no entry for "${slug}" in lib/data/gbpPages.ts`)
  return page
}

/** The page's path: its key in the SEO registry and its route folder. */
export function gbpPath(page: GbpPage): string {
  return `/${page.slug}`
}

/** A phone number for `tel:` from its display form. */
export function gbpTelHref(page: GbpPage): string {
  return `tel:${page.contact.phoneE164}`
}

/**
 * The page's SEO as registry defaults, so the admin Page Configurator can
 * still override any of it (lib/seo.ts resolvePageMetadata).
 *
 * The canonical is the live page's, trailing slash included: WordPress
 * declares `…-ca/`, and so does the catch-all that serves it today.
 */
export function gbpSeoDefaults(page: GbpPage): PageSeoDefaults {
  const { seo } = page
  return {
    title: seo.title,
    description: seo.description,
    canonical: seo.canonical,
    openGraph: {
      type: seo.ogType,
      url: seo.canonical,
      ...(seo.ogImage ? { images: [seo.ogImage] } : {}),
    },
    twitter: { card: 'summary_large_image', site: GBP_HEAD.twitterSite },
  }
}

/** The listing's name when the GBP SEO screen sets none. */
export const GBP_LISTING_NAME = `${SITE.name}, Inc.`

/** Hours when the GBP SEO screen sets none: every page shows "M-F 5am-5pm". */
export const GBP_OPENING_HOURS: GbpOpeningHours[] = [
  { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '05:00', closes: '17:00' },
]

/**
 * The GBP listing as one `SelfStorage` node, generated from the page's fields.
 *
 * Replaces the live page's blocks (kept verbatim in `page.jsonLd`): their logo
 * was the WordPress optimiser's cache URL, and the second block's "Store
 * Hours: 9am–6pm, Sat 10am–4pm" contradicted the 5am–5pm the page shows. The
 * `@id` is the live one, so the entity keeps its identity across the move.
 */
export function gbpLocalBusinessNode(page: GbpPage): SchemaNode {
  const url = page.seo.canonical
  const { contact, geo, areaServed } = page
  return {
    '@type': 'SelfStorage',
    '@id': `${url}#identity`,
    name: page.listing?.name ?? GBP_LISTING_NAME,
    url,
    image: SITE.logo,
    parentOrganization: ref(SCHEMA_ID.organization),
    telephone: contact.phoneE164,
    email: contact.email,
    address: { '@type': 'PostalAddress', ...contact.address },
    ...(geo ? { geo: { '@type': 'GeoCoordinates', latitude: geo.lat, longitude: geo.lng } } : {}),
    openingHoursSpecification: (page.listing?.openingHours?.length ? page.listing.openingHours : GBP_OPENING_HOURS).map((hours) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: hours.days,
      opens: hours.opens,
      closes: hours.closes,
    })),
    areaServed: areaServed.map((name) => ({ '@type': 'City', name })),
  }
}

/**
 * The page's whole JSON-LD graph: the site's Organization and WebSite, the
 * WebPage and breadcrumb (Yoast's graph on WordPress, generated here), the GBP
 * listing, and an FAQPage from the FAQ the page shows (WordPress had none).
 */
export function gbpJsonLd(page: GbpPage): SchemaNode {
  const path = gbpPath(page)
  return graph([
    ...siteNodes(),
    webPageNode({ path, name: page.seo.title, description: page.seo.description }),
    breadcrumbNode([{ name: 'Home', path: '/' }, { name: `${page.location.city}, ${page.location.stateCode}` }]),
    gbpLocalBusinessNode(page),
    faqNode(page.faqs),
    // Extra nodes written in the GBP SEO screen, as entered (validated as JSON objects).
    ...(page.listing?.extraJsonLd ?? []),
  ])
}
