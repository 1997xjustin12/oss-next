/**
 * Google Business Profile (GBP) location pages: one page per GBP listing,
 * e.g. /shipping-containers-for-sale-in-san-diego-ca/. Every page renders the
 * same template; this is what differs between them.
 *
 * Reference: docs/reference/gbp-subdomain-pages.md
 * Data: lib/data/gbpPages.ts
 */

export type GbpPostalAddress = {
  streetAddress: string
  addressLocality: string
  /** State or province code, e.g. `CA`. */
  addressRegion: string
  postalCode: string
  addressCountry: 'US' | 'CA'
}

/** A card in the "{City} Container Resources" section, linking to a blog post. */
export type GbpBlogCard = {
  title: string
  excerpt: string
  /** The post. Null where the live page links nothing that matches (see the reference doc). */
  url: string | null
  image: string
  imageAlt: string
}

export type GbpFaq = { question: string; answer: string }

export type GbpPage = {
  /** The page's path segment, also its route folder: `shipping-containers-for-sale-in-san-diego-ca`. */
  slug: string
  /** Serves the same page; the canonical is always the path on onsitestorage.com. */
  subdomain: string
  location: {
    city: string
    stateCode: string
    stateName: string
  }
  contact: {
    /** As shown, e.g. `(619) 839-0222`. Each page has its own number (call tracking per GBP listing). */
    phone: string
    /** For `tel:` and structured data, e.g. `+16198390222`. */
    phoneE164: string
    email: string
    /** As shown in the footer. */
    addressLine: string
    address: GbpPostalAddress
    /** As shown in the footer, e.g. `M-F 5am-5pm`. */
    hours: string
  }
  /** The listing's pin. Null where the live page has no coordinates in its structured data. */
  geo: { lat: number; lng: number } | null
  /** Cities the listing serves, for structured data. */
  areaServed: string[]
  /** Headings the pages word differently. Verbatim from the live pages. */
  headings: {
    /** h1. The city and state at the end are the red accent. */
    hero: string
    /** "Trusted By" is the red accent. */
    trustedBy: string
    products: string
    types: string
    resources: string
  }
  /** "About Us" paragraphs: the local copy (neighbourhoods, county). */
  about: string[]
  blogCards: GbpBlogCard[]
  faqs: GbpFaq[]
  /** Google Maps embed of the GBP listing, beside the quote form. */
  mapEmbedUrl: string
  /** The video beside the FAQ. */
  youtubeId: string
  seo: {
    title: string
    description: string
    canonical: string
    ogType: 'article' | 'website'
    ogImage: { url: string; width?: number; height?: number } | null
    /** `article:modified_time` on the live page. */
    modifiedTime: string | null
  }
  /**
   * The page's own structured data, verbatim: the `SelfStorage` blocks. The
   * site-wide WebPage / BreadcrumbList / WebSite / Organization graph is
   * generated, not stored.
   */
  jsonLd: Record<string, unknown>[]
}
