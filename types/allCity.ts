import type { OfferTab } from '@/lib/data/homeOfferTabs'
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
  quoteButton: string
  introHeading: string
  introBody: string
  whyHeading: string
  whyBody: string
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

/** "Home / Texas / Abilene" above the hero. Each crumb is template text. */
export type AllCityBreadcrumbsText = {
  home: string
  /** Links to the state's list on /all-city. */
  state: string
  city: string
}

/** One figure under the hero ("$1,250" / "Used containers, starting price in …"). */
export type AllCityHeroStat = { value: string; label: string }

/** The hero's free-quote card. Its sending is not wired yet (a later step). */
export type AllCityQuoteCardText = {
  heading: string
  subheading: string
  buyLabel: string
  rentLabel: string
  rtoLabel: string
  zipLabel: string
  sizeLabel: string
  contactLabel: string
  button: string
  note: string
}

/**
 * The hero. Besides the page placeholders, it fills `{h1}` (the page's own
 * h1, its city part accented), `{depot}` (its depot, "Houston, TX"),
 * `{price}` (the depot's lowest used container price; a figure that needs it
 * is left out when there is none) and `{depotCount}` ("1 Depot").
 */
export type AllCityHeroText = {
  /** The red label above the heading. Blank: none. */
  badge: string
  /** The page's h1. `{h1}` keeps each page's own (its SEO heading). */
  heading: string
  body: string
  stats: AllCityHeroStat[]
  quote: AllCityQuoteCardText
}

/**
 * The redesigned sections (2026-11-18), top to bottom, each with its own
 * wording. Shared by both variants; a section not yet redesigned still reads
 * its variant's text above.
 */
/** One container card: which listing it stands for, and its words. */
export type AllCityProductCard = {
  /** The depot listing whose photo and price the card shows; the card is left out where the depot has none. */
  spec: DepotFeaturedKey
  title: string
  description: string
  button: string
}

/**
 * "Find The Right Shipping Container In <city>": the container cards, priced
 * at the page's depot. Besides the page placeholders, it fills `{depotPage}`
 * (the depot's location page) and `{keyword}` (a depot-city page's keyword
 * heading).
 */
export type AllCityProductsText = {
  heading: string
  /** The depot-city pages' heading (23 pages). `{keyword}` keeps each one's keyword heading; blank: `heading`. */
  depotCityHeading: string
  body: string
  cards: AllCityProductCard[]
  button: string
  buttonHref: string
  /** The line under the button. Blank: none. */
  note: string
}

/** The "Trusted By" logo carousel (the homepage's logos). */
export type AllCityTrustedByText = {
  show: boolean
  /** A heading over the logos. Blank: none (the design); the carousel is still named for screen readers. */
  heading: string
}

/**
 * The Buy / Rent / Rent-To-Own tabs (the homepage's section), priced at the
 * page's depot: `{buy}`, `{rent}`, `{rto}` are its lowest prices of each kind.
 */
export type AllCityOffersText = {
  show: boolean
  /** One each of Buy, Rent and Rent-To-Own, in this order (at most three). */
  tabs: OfferTab[]
}

/**
 * "How It Works" (the homepage's section). `{depotPage}` is the page's depot's
 * location page (the subtitle's city), `{depotPlp}` the listing at that depot
 * (the button).
 */
export type AllCityHowItWorksText = {
  show: boolean
  /** The small red line over the heading. Blank: none. */
  eyebrow: string
  heading: string
  subtitle: string
  steps: { title: string; desc: string }[]
  /** Blank: no button. */
  button: string
  /** `{depotPlp}` (the default: the listing at the page's depot), `{depotPage}`, or a link. */
  buttonHref: string
}

/**
 * "The On-Site Storage Difference" (the homepage's section), its words about
 * the page's city and depot: `[[…]]` is red, `[{depot}]({depotPage})` links
 * the depot.
 */
export type AllCityDifferenceText = {
  show: boolean
  heading: string
  body: string
  points: { title: string; desc: string }[]
  /** The call button. Blank: none. */
  button: string
  /** The photo. Blank: the page's depot's banner (Depots screen). */
  image: string
}

/**
 * "Recently Delivered Containers Near <city>": the newest deliveries from the
 * page's depot (and the virtual depots it serves), photo only. Hidden when
 * the depot has none.
 */
export type AllCityDeliveriesText = {
  show: boolean
  heading: string
  body: string
  /** Under each card's title; `{place}` is where it was delivered (city only). */
  placeLabel: string
  /** How many cards in the carousel, newest first (1 to 20). */
  limit: number
}

/**
 * "Popular Cities in <city>": links to other city pages of the same state
 * (its "Popular Cities" list, without this page).
 */
export type AllCityPopularText = {
  show: boolean
  heading: string
  body: string
  /** How many cities (1 to 20). */
  limit: number
  /** The call button. Blank: none. */
  button: string
}

export type AllCitySections = {
  breadcrumbs: AllCityBreadcrumbsText
  hero: AllCityHeroText
  products: AllCityProductsText
  trustedBy: AllCityTrustedByText
  offers: AllCityOffersText
  howItWorks: AllCityHowItWorksText
  difference: AllCityDifferenceText
  deliveries: AllCityDeliveriesText
  popular: AllCityPopularText
}

export type AllCityTemplate = {
  city: AllCityTemplateText
  depotCity: AllCityTemplateText
  sections: AllCitySections
  media: {
    heroBackground: string
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
  /** The depot-city variant's photo, where it differs. */
  depotCityBanner?: AllCityImage
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
