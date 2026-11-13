import type { DepotFeaturedKey } from '@/services/search.service'

/**
 * The native /all-city/ pages: four of WordPress's "Cities" landing pages,
 * native since 2026-11-13 (lib/data/allCityPages.ts).
 */

/** Two-letter code of a state with a native city page. */
export type AllCityState = 'FL' | 'GA' | 'MI' | 'TX'

/** The depot a city page hangs off: its products, banner and links come from it. */
export type AllCityDepot = {
  /** The depot as the catalogue names it ("Houston, TX"): the featured row's lookup. */
  depot: string
  /** Its native location page, /where-to-buy-shipping-containers/<slug>. */
  locationSlug: string
  state: AllCityState
  stateName: string
  /** The photo beside the intro. */
  banner: { src: string; width: number; height: number }
  /** Where "See other location prices" goes: it differs by depot on WordPress. */
  otherPricesHref: string
  /** WordPress's four product cards, in its order. */
  specs: readonly DepotFeaturedKey[]
}

export type AllCityPage = {
  slug: string
  /** The place, as WordPress titled the post ("Cocoa Beach"). */
  city: string
  /** The page's main heading, word for word from the live page. */
  h1: string
  /** WordPress's (Yoast) title and description, word for word. */
  seoTitle: string
  seoDescription: string
  depot: AllCityDepot
}

/** A link in one of the two city lists. */
export type AllCityLink = { slug: string; city: string }
