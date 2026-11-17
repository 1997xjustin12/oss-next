import type { DepotFeaturedKey } from '@/services/search.service'

/**
 * The /all-city/[slug] pages: WordPress's "Cities" post type (8,541 city
 * landing pages), native at the same URLs. Three layers, each blank = inherit:
 * the template (every word), the depot (banner, product cards, a link) and the
 * page (its own row). docs/reference/all-city-pages.md.
 */

/** Two-letter code of a state with city pages. */
export type AllCityState = 'CO' | 'FL' | 'GA' | 'IL' | 'IN' | 'KS' | 'MD' | 'MI' | 'NC' | 'OH' | 'SC' | 'TX'

/**
 * Which of WordPress's two designs a page uses.
 * - `city`: every ordinary city page.
 * - `depotCity`: the depot cities themselves (Houston, Miami…, 23 pages): own
 *   hero and intro wording, the keyword as an h2 under the city's h1, and the
 *   "$50 off" band.
 */
export type AllCityVariant = 'city' | 'depotCity'

/**
 * One variant's wording. Template text syntax (TemplateRichText): `[label](/path)`
 * links, `[[…]]` accents, `{phone}` the call link, a blank line between
 * paragraphs. Placeholders: `{city}`, `{CITY}` (upper case), `{state}` (name),
 * `{ST}` (code).
 */
export type AllCityTemplateText = {
  heroBody: string
  depotButton: string
  otherButton: string
  /**
   * Where "See other location prices" goes for this variant. Blank: the depot's
   * own choice (WordPress's city templates differed by depot).
   */
  otherHref: string
  quoteButton: string
  introHeading: string
  introBody: string
  whyHeading: string
  whyBody: string
  seeMore: string
  popularHeading: string
  viewAllLabel: string
  stepsHeading: string
  steps: { title: string; text: string }[]
  locatorHeading: string
  financingHeading: string
  rentalTitle: string
  rentalBody: string
  leaseTitle: string
  leaseBody: string
  leaseButton: string
  reviewsHeading: string
  /** The closing band. Blank: no band. */
  offerBand: string
}

export type AllCityTemplate = {
  city: AllCityTemplateText
  depotCity: AllCityTemplateText
  media: {
    heroBackground: string
    pinIcon: string
    youtubeId: string
    videoTitle: string
  }
  links: {
    quote: string
    financing: string
  }
}

export type AllCityImage = { src: string; width: number; height: number }

/** A depot the city pages hang off. */
export type AllCityDepot = {
  /** WordPress's tag, normalised ("houston-tx", "baltimore-md"): the key pages refer to. */
  key: string
  /** The depot as the catalogue names it ("Houston, TX"): the featured row's lookup. */
  depot: string
  /** Its native location page, /where-to-buy-shipping-containers/<slug>. */
  locationSlug: string
  state: AllCityState
  /** The photo beside the intro. */
  banner: AllCityImage
  /** Where "See other location prices" goes on the city variant. */
  otherPricesHref: string
  /** WordPress's four product cards, in its order. */
  specs: readonly DepotFeaturedKey[]
  /** The depot-city variant's photo, where it differs. */
  depotCityBanner?: AllCityImage
  /** The depot-city variant's cards, where they differ. */
  depotCitySpecs?: readonly DepotFeaturedKey[]
}

export type AllCitySeo = {
  /** Used whole (WordPress's titles carry their own ending). */
  title: string
  description: string
  focusKeyphrase?: string
  keywords?: string[]
  noindex?: boolean
  /** Another URL this page names as canonical. Blank: its own. */
  canonical?: string
}

/** One city page. */
export type AllCityPage = {
  slug: string
  /** The place, as WordPress titled the post ("Cocoa Beach"). */
  city: string
  /** Whose lists the page sits in and shows. */
  state: AllCityState
  depotKey: string
  variant: AllCityVariant
  /** The page's main heading, word for word from WordPress. */
  h1: string
  /** The depot-city variant's keyword heading (an h2). */
  keywordHeading?: string
  seo: AllCitySeo
  /** Listed under "Popular Cities in <state>" / "View all cities in <state>". */
  lists: { popular: boolean; viewAll: boolean }
  /** Answers 404 and leaves both lists. */
  hidden?: boolean
  /** A 301 to another /all-city/ page (by slug); the page leaves both lists. */
  redirectTo?: string
  /** This page's own wording where it differs from the template's (blank = the template's). */
  text?: Partial<AllCityTemplateText>
}

/** A link in one of the two city lists. */
export type AllCityLink = { slug: string; city: string }
