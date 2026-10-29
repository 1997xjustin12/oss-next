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

/**
 * A card in the "{City} Container Resources" section: written by hand, or a
 * published post from the blogs API, picked by slug and rendered from the post.
 */
export type GbpBlogCard = GbpManualBlogCard | GbpPostBlogCard

/** A post from the blogs API. Its title, excerpt and image come from the post; unpublished, it drops out. */
export type GbpPostBlogCard = { post: string }

/** A card typed in by hand (the WordPress posts, which are not in the blogs API). */
export type GbpManualBlogCard = {
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
  /** Headings the pages word differently. The red run is marked `[[…]]` (AccentText). */
  headings: {
    /** h1. */
    hero: string
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
   * The live page's `SelfStorage` blocks, as WordPress emits them. A record,
   * not what renders: the page generates one `SelfStorage` node from the
   * fields above (lib/gbp.ts), which fixes the live blocks' Airlift-cache
   * logo and the second block's contradicting hours.
   */
  jsonLd: Record<string, unknown>[]
  /**
   * The listing's structured-data extras, edited on the GBP SEO screen.
   * Optional: absent means the defaults (name "On-Site Storage Solutions,
   * Inc.", Mon–Fri 05:00–17:00, no extra nodes).
   */
  listing?: GbpListing
}

export type GbpOpeningHours = {
  days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday')[]
  /** 24-hour `HH:MM`. */
  opens: string
  closes: string
}

export type GbpListing = {
  /** The business name on the listing. */
  name?: string
  openingHours?: GbpOpeningHours[]
  /** Raw JSON-LD nodes added to the page's graph, as written in the admin. */
  extraJsonLd?: Record<string, unknown>[]
}

// ─── Shared content (one record for every GBP page) ─────────────────────────

export type GbpImage = { src: string; alt: string; width: number; height: number }

export type GbpWhyIcon = 'user-shield' | 'medal' | 'money-bill' | 'retweet'

/**
 * Content every GBP page shows, identical across locations. The seed is
 * lib/data/gbpShared.ts; the admin edits one record. The Zoho forms' CRM
 * wiring (hidden values, field names) is not here: it is not content.
 */
export type GbpSharedContent = {
  header: {
    /** `{phone}` is replaced by the page's number. */
    announcement: string
    logo: GbpImage
    nav: { label: string; href: string }[]
  }
  hero: {
    tagline: string
    bullets: string[]
    quoteCtaLabel: string
    background: string
    badges: GbpImage[]
  }
  trustedLogos: { src: string; alt: string }[]
  productCards: { title: string; features: string[]; image: GbpImage }[]
  reviewsHeading: string
  containerTypes: { accent: string; rest: string; body: string; image: GbpImage }[]
  whyChoose: { heading: string; items: { icon: GbpWhyIcon; title: string; body: string }[] }
  about: { image: GbpImage; cta: string }
  quote: { heading: string }
  newsletter: { heading: string; body: string; note: string; background: string }
  faqHeading: string
  footer: { tagline: string; logoHref: string }
}

// ─── Template (one record for every GBP page) ───────────────────────────────

/** The eleven built-in sections, in the WordPress order by default. */
export type GbpCoreSectionType =
  | 'hero'
  | 'trustedBy'
  | 'products'
  | 'reviews'
  | 'types'
  | 'resources'
  | 'whyChoose'
  | 'about'
  | 'quote'
  | 'newsletter'
  | 'faq'

/** Pre-coded sections an admin can add; each carries its own content. */
export type GbpLibrarySectionType = 'textImage' | 'ctaBand' | 'video' | 'spacer'

export type GbpSectionType = GbpCoreSectionType | GbpLibrarySectionType

/**
 * A section's look, as validated values (never raw CSS). Applied as CSS
 * custom properties on the section, so admin-chosen values work without
 * Tailwind classes (which only exist for values in the source).
 */
export type GbpSectionStyle = {
  /** `#rrggbb`. */
  background?: string
  backgroundDark?: string
  heading?: string
  headingDark?: string
  /** The `[[…]]` accent run. */
  accent?: string
  paddingY?: 'none' | 'sm' | 'md' | 'lg'
}

/** Library sections' content. `{city}`, `{state}` and `{phone}` are filled per page. */
export type GbpLibraryProps = {
  textImage: { heading: string; body: string; image: GbpImage | null; imageSide: 'left' | 'right'; showCall: boolean }
  ctaBand: { heading: string; body: string }
  video: { heading: string; youtubeId: string }
  spacer: { size: 'sm' | 'md' | 'lg' }
}

export type GbpSectionInstance = {
  /** Stable across reorders (drag and drop keys on it). */
  id: string
  type: GbpSectionType
  enabled: boolean
  style?: GbpSectionStyle
  /** Only for library sections. */
  props?: GbpLibraryProps[GbpLibrarySectionType]
}

export type GbpFontFamily = 'poppins' | 'roboto'

export type GbpTemplate = {
  sections: GbpSectionInstance[]
  theme: {
    /** Buttons, bands, blog titles. */
    brand: string
    /** Heading accent runs. */
    accent: string
    font: GbpFontFamily
  }
  header: { showCallButton: boolean; background: string; backgroundDark: string }
  footer: { showEmail: boolean; showAddress: boolean; showHours: boolean }
}
