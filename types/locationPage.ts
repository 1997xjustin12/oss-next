/**
 * The /where-to-buy-shipping-containers/[location] pages: one template shared
 * by every location, and one record per location for what differs.
 *
 * Template text may carry placeholders, filled per page (lib/locationPage.ts):
 * `{city}`, `{region}` (GA), `{regionName}` (Georgia), `{cityRegion}`
 * (Atlanta, GA), `{phone}`, `{lowestRent}` (the depot's cheapest rental from
 * the catalogue, e.g. $95.00). `[[…]]` marks the red accent run; in body text,
 * `[label](/path)` is a link and `{phone}` a call link.
 *
 * Reference: docs/reference/location-pages.md ("Plan: native location pages")
 * Seeds: lib/data/locationTemplate.ts, lib/data/locationPages.ts
 */

import type { LandingFaq } from '@/lib/data/containerLandingContent'
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
  // Off in the template; a location turns them on in its own `sections`
  // (Los Angeles: its resources, the pricing form, the newsletter, the FAQ).
  | 'resources'
  | 'pricingForm'
  | 'newsletter'
  | 'faq'

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
  /** `body` may hold several paragraphs, separated by a blank line. `citiesHeading` is shown over the city list when set. */
  buy: { heading: string; body: string; cta: string; citiesHeading: string }
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
  resources: { heading: string }
  pricingForm: { heading: string }
  newsletter: { heading: string; body: string; note: string }
  faq: { heading: string }
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
  /** The FAQ section's questions, for a location that shows it. */
  faqs: LandingFaq[]
}

export type LocationStory = { title: string; paragraphs: string[]; image: LocationImage }

/** A card in the "{City} Container Resources" section: an article on this site. */
export type LocationResource = { title: string; paragraphs: string[]; image: LocationImage; href: string }

/** The buttons whose target a location may change (default: the depot's listing, buy / rental / rent-to-own). */
export type LocationLinkKey = 'products' | 'buy' | 'purchase' | 'rental' | 'rto'

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
  /**
   * The depot's id in the backend's list (config/depotCoordinates.ts,
   * /api/depots). The page's "Recently Delivered Containers" are this depot's
   * deliveries and those of the virtual depots it serves.
   */
  depotId: number
  place: {
    city: string
    /** State or province code: `GA`, `AB`. */
    region: string
    /** In full: `Georgia`, `Alberta`. */
    regionName: string
    /** The place as the page names it in full, `{cityRegion}`: `Atlanta, GA`, `New York, NY / Newark, NJ`, `Salt Lake City`. */
    label: string
  }
  /** The number this page shows and dials (`{phone}`), when the location has its own. Default: the sales line. */
  phone?: string
  /** This page's sections and their order, when it differs from the template's. */
  sections?: { id: LocationSectionId; enabled: boolean }[]
  /** This page's product row, when it differs from the template's. */
  productSpecs?: DepotFeaturedKey[]
  /** Button targets that differ from the depot's listing; `tel:` dials the page's phone. */
  links?: Partial<Record<LocationLinkKey, string>>
  /** The "Buy" section's city links, in WordPress's order. */
  nearbyCities: { name: string; href: string }[]
  /** The picture beside the Buy section. Null: the section takes the full width. */
  mapImage: LocationImage | null
  /** Null: the section is left out (some pages have no stories). */
  featured: LocationStory | null
  news: LocationStory | null
  /** This place's own delivery photos, shown before the template's. */
  deliveredLead: LocationImage[]
  text?: LocationTextOverrides
  /** The resources section's cards, for a location that shows it. */
  resources?: LocationResource[]
  /** The video beside the FAQ, for a location that shows one. */
  faqYoutubeId?: string
  /** Defaults for the Page Configurator, carried over from WordPress. */
  seo: { title: string; description: string; ogImage: string }
}
