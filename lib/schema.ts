import { SITE, SCHEMA_ID, absoluteUrl } from '@/config/site'
import { ROUTES } from '@/config/routes'
import { getCustomFieldValue, getPriceBasis, isContainerHit } from '@/lib/pricing'
import { DEFAULT_LOCATION } from '@/lib/constants'
import { normaliseRating } from '@/lib/ratings'
import { getQuickSpecs } from '@/lib/data/pdpShippingContainers'
import type { ProductHit } from '@/types/product'
import type { FaqItem } from '@/lib/data/pdpShippingContainers'

/**
 * Every piece of JSON-LD this app emits.
 *
 * Lives here rather than inside the route files for three reasons: `app/` is
 * meant to hold route files only (see AGENTS.md), schema built inline is
 * untestable, and — the reason that actually bites — an Organization restated
 * from scratch on four different pages becomes four unrelated organizations to
 * anything reading it.
 *
 * ## The graph convention
 *
 * Every page emits ONE `@graph`. Inside it:
 *
 *   - Shared entities (Organization, WebSite) appear as full nodes with a
 *     stable `@id` from config/site.ts, identical on every page. A consumer
 *     merges nodes that share an `@id`, so repeating them is how you say
 *     "the same company", not a duplication problem.
 *   - Page-specific entities (Product, BlogPosting, ItemList) reference the
 *     shared ones by `{ '@id': ... }` instead of restating them.
 *
 * That is what lets an agent resolve "the seller of this container" to "the
 * company whose phone number and address I read on the homepage".
 *
 * Build a page's script with `graph([...])`, which stamps the `@context`.
 */

export type SchemaNode = Record<string, unknown>

/** Wrap nodes in a single @graph with the context stamped once. */
export function graph(nodes: (SchemaNode | null | undefined)[]): SchemaNode {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes.filter((n): n is SchemaNode => Boolean(n)),
  }
}

/** Reference a node defined elsewhere in the graph (or on another page). */
export function ref(id: string): SchemaNode {
  return { '@id': id }
}

// ─── Shared entities ─────────────────────────────────────────────────────────

/**
 * The company. Emitted on every page with the same `@id` so all page-level
 * entities resolve back to one organization.
 */
export function organizationNode(): SchemaNode {
  return {
    '@type': 'Organization',
    '@id': SCHEMA_ID.organization,
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    logo: {
      '@type': 'ImageObject',
      url: SITE.logo,
    },
    image: SITE.logo,
    telephone: SITE.telephone,
    email: SITE.email,
    foundingDate: SITE.foundingYear,
    address: {
      '@type': 'PostalAddress',
      ...SITE.address,
    },
    areaServed: [
      { '@type': 'Country', name: 'United States' },
      { '@type': 'Country', name: 'Canada' },
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: SITE.telephone,
      contactType: 'sales',
      areaServed: ['US', 'CA'],
      availableLanguage: 'English',
    },
  }
}

/**
 * The site itself.
 *
 * The `SearchAction` target is verified, not aspirational. The previous one
 * pointed at `/products?q={search_term_string}` — a route that has never
 * existed, with a parameter the listing page did not read — so it was removed
 * rather than left 404ing, and restored here only once the PLP actually
 * honoured `?q=` on the server and the client (T3.9).
 *
 * If site search ever stops reading `?q=`, delete this again. A sitelinks
 * searchbox that leads nowhere is worse than no searchbox: search engines and
 * assistants follow it.
 */
export function webSiteNode(): SchemaNode {
  const searchTarget = `${absoluteUrl(ROUTES.PLP)}?q={search_term_string}`
  return {
    '@type': 'WebSite',
    '@id': SCHEMA_ID.website,
    url: SITE.url,
    name: SITE.name,
    description: SITE.tagline,
    publisher: ref(SCHEMA_ID.organization),
    inLanguage: 'en-US',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: searchTarget,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

// ─── Navigation ──────────────────────────────────────────────────────────────

export type Crumb = {
  name: string
  /** Site-relative path, or absolute URL. Omit on the current page's own crumb. */
  path?: string
}

/**
 * BreadcrumbList from an ordered trail. The final crumb is the current page
 * and carries no `item` — schema.org's guidance, and it stops a self-link from
 * being read as a separate destination.
 */
export function breadcrumbNode(crumbs: Crumb[]): SchemaNode | null {
  if (crumbs.length < 2) return null
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      ...(crumb.path && i < crumbs.length - 1 ? { item: absoluteUrl(crumb.path) } : {}),
    })),
  }
}

/**
 * Title-case a URL segment for use as a breadcrumb label.
 * `shipping-container-floor` -> `Shipping Container Floor`
 */
export function labelFromSegment(segment: string): string {
  return decodeURIComponent(segment)
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()
}

/**
 * Breadcrumb trail for an arbitrary URL path — the only option for the ~1,700
 * WordPress-converted pages, which have no navigation metadata of their own.
 * Intermediate labels come from the segments; the leaf uses the real page
 * title, which is the one label we can trust.
 */
export function breadcrumbFromPath(segments: string[], leafName: string): SchemaNode | null {
  const crumbs: Crumb[] = [{ name: 'Home', path: ROUTES.HOME }]
  segments.forEach((segment, i) => {
    const isLeaf = i === segments.length - 1
    crumbs.push({
      name: isLeaf ? leafName : labelFromSegment(segment),
      path: `/${segments.slice(0, i + 1).join('/')}`,
    })
  })
  return breadcrumbNode(crumbs)
}

// ─── Product ─────────────────────────────────────────────────────────────────

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

/**
 * Full Product node for a PDP.
 *
 * @param description Passed in rather than built here so the page's
 *   `<meta name="description">` and this node are provably the same string.
 * @param now Injected so the rolling `priceValidUntil` is deterministic in
 *   tests. Defaults to the current date.
 */
export function productNode(
  product: ProductHit,
  slug: string,
  description: string,
  now: Date = new Date(),
): SchemaNode {
  const sku = product.variants?.[0]?.sku
  const isContainer = isContainerHit(product)
  const location = getCustomFieldValue(product, 'location')
  const realLocation = location && location !== DEFAULT_LOCATION ? location : undefined
  const condition = getCustomFieldValue(product, 'condition')
  const conditionSchema = CONDITION_SCHEMA[condition]
  const paymentType = getCustomFieldValue(product, 'payment_type')
  const priceBasis = getPriceBasis(product)
  const rating = normaliseRating(product.ratings)

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

  // A rolling window rather than a fixed date so this never goes stale —
  // container pricing is reviewed well within a year.
  const priceValidUntil = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)

  return {
    '@type': 'Product',
    '@id': SCHEMA_ID.product(slug),
    name: product.title,
    ...(sku && { sku, mpn: sku, gtin: sku }), // no real GTIN data exists — reusing the SKU, same as mpn
    description,
    url: absoluteUrl(ROUTES.PRODUCT(slug)),
    image: product.images?.map((img) => img.src).filter(Boolean),
    ...(conditionSchema && { itemCondition: conditionSchema }),
    brand: { '@type': 'Brand', name: SITE.name },
    ...(additionalProperty && additionalProperty.length > 0 && { additionalProperty }),
    ...(tareWeight && { weight: { '@type': 'QuantitativeValue', value: tareWeight, unitCode: 'LBR' } }),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: product.sale_price,
      availability: 'https://schema.org/InStock',
      ...(conditionSchema && { itemCondition: conditionSchema }),
      priceValidUntil,
      // Rental and rent-to-own products carry a MONTHLY figure in sale_price.
      // Emitted bare, that reads as the price of the container — a 40ft unit
      // appears to cost $232 rather than several thousand. UnitPriceSpecification
      // is schema.org's way of saying "per month", and the description repeats it
      // in prose for consumers that only read the text.
      ...(priceBasis.period === 'monthly' && {
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: product.sale_price,
          priceCurrency: 'USD',
          unitCode: 'MON',
          billingDuration: priceBasis.termMonths,
          billingIncrement: 1,
          description: `${priceBasis.label}${priceBasis.termMonths ? ` over a ${priceBasis.termMonths}-month term` : ''}`,
        },
      }),
      url: absoluteUrl(ROUTES.PRODUCT(slug)),
      // The seller is the shared Organization node, not a restatement of it.
      seller: ref(SCHEMA_ID.organization),
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
      // Re-raised 2026-08-10: shopping agents check this field, so the cost of
      // its absence is now higher than it was. See AGENTIC_READINESS.md T3.8.
    },
    // The index now carries { rating, review_count }, so the reviewCount that
    // AggregateRating requires finally exists. Emitted only when there is at
    // least one real review — a 0-count aggregate is invalid structured data
    // and Google treats inflated/empty ratings as a manual-action risk.
    ...(rating.count > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rating.value,
        reviewCount: rating.count,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  }
}

/**
 * Compact Product node for use inside an ItemList — enough for an agent to
 * compare and rank options without fetching every PDP, not so much that the
 * listing page's payload balloons.
 */
export function productListItemNode(product: ProductHit): SchemaNode {
  const handle = product.handle
  const priceBasis = getPriceBasis(product)
  return {
    '@type': 'Product',
    '@id': SCHEMA_ID.product(handle),
    name: product.title,
    url: absoluteUrl(ROUTES.PRODUCT(handle)),
    ...(product.images?.[0]?.src && { image: product.images[0].src }),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: product.sale_price,
      availability: 'https://schema.org/InStock',
      url: absoluteUrl(ROUTES.PRODUCT(handle)),
      seller: ref(SCHEMA_ID.organization),
      // Same monthly-vs-one-time hazard as productNode(). A listing is where it
      // does the most damage: a consumer ranking by price would otherwise put
      // every rental above every purchase.
      ...(priceBasis.period === 'monthly' && {
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: product.sale_price,
          priceCurrency: 'USD',
          unitCode: 'MON',
          billingIncrement: 1,
          ...(priceBasis.termMonths && { billingDuration: priceBasis.termMonths }),
          description: priceBasis.label,
        },
      }),
    },
  }
}

/**
 * ItemList for a listing page. `numberOfItems` is the size of *this list*, not
 * the total result count — claiming 10,264 items in a list holding 20 is a
 * mismatch a validator will flag.
 */
export function itemListNode(products: ProductHit[], name: string): SchemaNode | null {
  if (products.length === 0) return null
  return {
    '@type': 'ItemList',
    name,
    numberOfItems: products.length,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    itemListElement: products.map((product, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: productListItemNode(product),
    })),
  }
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

/**
 * FAQPage from the same array the visible accordion renders.
 *
 * Takes the data, never a duplicate copy of it — Google treats structured data
 * that isn't present on the page as a policy violation, so the single-source
 * rule here is a correctness requirement, not tidiness.
 */
export function faqNode(faqs: readonly FaqItem[]): SchemaNode | null {
  if (!faqs.length) return null
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }
}

// ─── Blog ────────────────────────────────────────────────────────────────────

export type BlogPostingInput = {
  title: string
  slug: string
  description?: string
  imageUrl?: string
  datePublished?: string
  dateModified?: string
}

export function blogPostingNode(post: BlogPostingInput): SchemaNode {
  const url = absoluteUrl(ROUTES.BLOG(post.slug))
  return {
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: post.title,
    ...(post.imageUrl && { image: [post.imageUrl] }),
    ...(post.datePublished && { datePublished: post.datePublished }),
    ...(post.dateModified && { dateModified: post.dateModified }),
    ...(post.description && { description: post.description }),
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: ref(SCHEMA_ID.organization),
    publisher: ref(SCHEMA_ID.organization),
    isPartOf: ref(SCHEMA_ID.website),
  }
}

// ─── Locations ───────────────────────────────────────────────────────────────

export type LocalBusinessInput = {
  name: string
  path: string
  city: string
  state: string
  postalCode: string
  /** ISO country code. The depot network spans both the US and Canada. */
  country: 'US' | 'CA'
  street?: string
  telephone?: string
  email?: string
  latitude?: string
  longitude?: string
  /**
   * schema.org `openingHours` text form, e.g. `Mo-Su 06:00-17:00`. The plain
   * text property rather than OpeningHoursSpecification objects: the source
   * `open_hours` JSON is a per-day list of display strings, and inventing the
   * structured form from it would mean guessing at ambiguous entries.
   */
  openingHours?: string[]
  /**
   * Every city this depot covers, its own included. Most come from "virtual
   * depot" records — service areas with no yard of their own — which is
   * precisely the coverage question an assistant gets asked.
   */
  citiesServed?: string[]
}

/**
 * A depot as a LocalBusiness.
 *
 * `parentOrganization` rather than a standalone company: these are branches of
 * one business, and modelling them as independent organizations would compete
 * with the main Organization entity in local results.
 */
export function localBusinessNode(location: LocalBusinessInput): SchemaNode {
  const url = absoluteUrl(location.path)
  return {
    '@type': 'LocalBusiness',
    '@id': `${url}#localbusiness`,
    name: location.name,
    url,
    parentOrganization: ref(SCHEMA_ID.organization),
    image: SITE.logo,
    priceRange: '$$',
    ...(location.telephone && { telephone: location.telephone }),
    ...(location.email && { email: location.email }),
    address: {
      '@type': 'PostalAddress',
      ...(location.street && { streetAddress: location.street }),
      addressLocality: location.city,
      addressRegion: location.state,
      postalCode: location.postalCode,
      addressCountry: location.country,
    },
    ...(location.latitude && location.longitude
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: location.latitude,
            longitude: location.longitude,
          },
        }
      : {}),
    ...(location.openingHours?.length ? { openingHours: location.openingHours } : {}),
    areaServed: (location.citiesServed?.length
      ? location.citiesServed
      : [`${location.city}, ${location.state}`]
    ).map((city) => ({ '@type': 'City', name: city })),
  }
}

// ─── Generic pages ───────────────────────────────────────────────────────────

/**
 * WebPage node for content pages that have no richer type of their own — the
 * bulk of the converted WordPress set. Cheap, and it gives the breadcrumb and
 * the site something to hang off.
 */
export function webPageNode(input: {
  path: string
  name: string
  description?: string
}): SchemaNode {
  return {
    '@type': 'WebPage',
    '@id': SCHEMA_ID.webPage(input.path),
    url: absoluteUrl(input.path),
    name: input.name,
    ...(input.description && { description: input.description }),
    isPartOf: ref(SCHEMA_ID.website),
    about: ref(SCHEMA_ID.organization),
    inLanguage: 'en-US',
  }
}

/** The two shared nodes, for pages that want the standard preamble. */
export function siteNodes(): SchemaNode[] {
  return [organizationNode(), webSiteNode()]
}
