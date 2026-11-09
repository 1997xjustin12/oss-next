/**
 * The /where-to-buy-shipping-containers/[location] pages: one template shared
 * by every location, and one record per location for what differs.
 *
 * Template text may carry placeholders, filled per page (lib/locationPage.ts):
 * `{city}`, `{region}` (GA), `{regionName}` (Georgia), `{cityRegion}`
 * (Atlanta, GA), `{phone}`. `[[…]]` marks the red accent run; in body text,
 * `[label](/path)` is a link and `{phone}` a call link.
 *
 * Reference: docs/reference/location-pages.md ("Plan: native location pages")
 * Seeds: lib/data/locationTemplate.ts, lib/data/locationPages.ts
 */

import type { DepotFeaturedKey } from '@/services/search.service'

export type LocationImage = { src: string; alt: string; width: number; height: number }

/** The sections, in WordPress's order by default. */
export type LocationSectionId =
  | 'hero'
  | 'budgetBand'
  | 'options'
  | 'products'
  | 'buy'
  | 'delivered'
  | 'satisfaction'
  | 'callBand'
  | 'featured'
  | 'news'
  | 'video'
  | 'overview'
  | 'purchase'
  | 'rental'
  | 'rto'
  | 'closingBand'

export type LocationOptionCard = {
  image: LocationImage
  bullets: string[]
  /** Which listing "See Prices" opens, for the page's depot. */
  ptype: 'buy' | 'rental' | 'rto'
}

/** A heading, a paragraph and a button: the Purchase, Rental and Rent-To-Own blocks. */
export type LocationBlockText = { heading: string; body: string; cta: string }

/** Every piece of wording on the page. A location may replace any of it (`LocationPage.text`). */
export type LocationTemplateText = {
  hero: { heading: string; tagline: string }
  budgetBand: string
  options: { heading: string; cta: string }
  products: { heading: string; intro: string; cta: string }
  buy: { heading: string; body: string; cta: string }
  delivered: { heading: string }
  satisfaction: { heading: string; body: string; cta: string }
  callBand: string
  stories: { featuredLabel: string; newsLabel: string; readMore: string; readLess: string }
  video: { title: string }
  overview: { heading: string; body: string }
  purchase: LocationBlockText
  rental: LocationBlockText
  rto: LocationBlockText
  closingBand: string
}

export type LocationTemplate = {
  sections: { id: LocationSectionId; enabled: boolean }[]
  text: LocationTemplateText
  media: {
    heroBackground: string
    satisfactionSeal: LocationImage
    purchaseImage: LocationImage
    rentalImage: LocationImage
    rtoImage: LocationImage
    youtubeId: string
  }
  options: { buy: LocationOptionCard; rent: LocationOptionCard; rto: LocationOptionCard }
  /** The products row: these specs, as the page's depot stocks them, in this order. */
  productSpecs: DepotFeaturedKey[]
  /** The delivery carousel, after each page's own lead photos. */
  deliveredPhotos: LocationImage[]
}

export type LocationStory = { title: string; paragraphs: string[]; image: LocationImage }

/** Deep-partial template text: what one location words differently. */
export type LocationTextOverrides = {
  [K in keyof LocationTemplateText]?: LocationTemplateText[K] extends string
    ? string
    : Partial<LocationTemplateText[K]>
}

export type LocationPage = {
  /** The path segment: `atlanta-ga`. */
  slug: string
  /** The depot record's title (config/locations.ts): its listings, listing links and LocalBusiness. */
  depot: string
  place: {
    city: string
    /** State or province code: `GA`, `AB`. */
    region: string
    /** In full: `Georgia`, `Alberta`. */
    regionName: string
  }
  /** The "Buy" section's city links, in WordPress's order. */
  nearbyCities: { name: string; href: string }[]
  mapImage: LocationImage
  featured: LocationStory
  news: LocationStory
  /** This place's own delivery photos, shown before the template's. */
  deliveredLead: LocationImage[]
  text?: LocationTextOverrides
  /** Defaults for the Page Configurator, carried over from WordPress. */
  seo: { title: string; description: string; ogImage: string }
}
