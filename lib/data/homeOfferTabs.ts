import { ROUTES } from '@/config/routes'

/**
 * The homepage's Buy / Rent / Rent-To-Own section (OfferTabs), under the hero
 * on every version of the homepage. Buy (2026-11-18) and Rent (2026-11-24) are
 * word for word from the design; Rent-To-Own follows its pattern with the facts the
 * rent-to-own page already states, for the content owner to review.
 *
 * Body text uses the template syntax (TemplateRichText): `[[bold]]` is bold, `[label](/path)` is
 * a link, and a blank line starts a new paragraph.
 *
 * Prices are placeholders, `{buy}`, `{rent}` and `{rto}` ("$1,350"): the
 * lowest prices at the visitor's depot, or nationally when they have none
 * (useDepotStartingPrices, the same rule as the hero's list), else
 * OFFER_DEFAULT_PRICES, the design's figures.
 */

export type OfferPrices = { buy: string; rent: string; rto: string }

/** The design's starting prices: shown until the real ones load, and if they cannot. */
export const OFFER_DEFAULT_PRICES: OfferPrices = { buy: '$1,350', rent: '$95', rto: '$79.99' }

export type OfferFeatureIcon = 'price' | 'sizes' | 'conditions' | 'guides' | 'terms' | 'delivery' | 'ownership' | 'approval' | 'convert'

export type OfferTab = {
  id: 'buy' | 'rent' | 'rto'
  /** The tab's name ("BUY"). */
  label: string
  /** The tab's price, coloured ("From $1,350"). */
  price: string
  /** After the price, in grey ("New & Used"). */
  note: string
  heading: string
  body: string
  card: {
    lead: string
    /** The amount, large ("{buy}"). */
    price: string
    /** After it, smaller ("/mo"), so a monthly price fits the card. */
    suffix: string
    caption: string
    button: string
    href: string
  }
  features: { icon: OfferFeatureIcon; title: string; text: string }[]
}

/** Old WordPress page the guides link to until it is native (migration doc §12). */
const GRADES_GUIDE = '/shipping-container-pictures-by-grades'

export const OFFER_TABS: readonly OfferTab[] = [
  {
    id: 'buy',
    label: 'BUY',
    price: 'From {buy}',
    note: 'New & Used',
    heading: 'Shipping Containers For Sale',
    body:
      'Buy a new or used shipping container directly from On-Site Storage Solutions, a nationwide shipping container wholesaler since 2002. Prices start at {buy} for used units, and the price you are quoted is the price you pay, with no hidden fees.\n\n' +
      'Used shipping containers come in three conditions: wind and watertight (WWT), cargo-worthy, and as is. New containers are one-trip units, shipped once and ready for storage or custom work.\n\n' +
      `Read our guides to [container conditions](${ROUTES.CONTAINER_CONDITIONS}) and [container grades](${GRADES_GUIDE}) to see what each one looks like before you buy. Every container is available in standard 20ft and 40ft sizes, and in 40ft high cube. Browse [types of shipping containers](${ROUTES.CONTAINER_TYPES}) to compare sizes, interior dimensions, and uses.`,
    card: {
      lead: 'Starting at',
      price: '{buy}',
      suffix: '',
      caption: 'Quoted price is the price you pay',
      button: 'Buy A Shipping Container',
      href: `${ROUTES.PLP}?ptype=buy`,
    },
    // Reading order (a phone's list); desktop fills its 2x2 grid column by column.
    features: [
      { icon: 'price', title: 'Transparent Pricing', text: 'From {buy}. The price you are quoted is the price you pay, with no hidden fees.' },
      { icon: 'sizes', title: 'Standard & High Cube Sizes', text: 'Available in 20ft, 40ft, and 40ft High Cube sizes to suit any storage need.' },
      { icon: 'conditions', title: 'Diverse Conditions', text: 'Choose from New, Cargo-Worthy, Wind & Watertight (WWT), or As-is units.' },
      { icon: 'guides', title: 'Expert Guides', text: 'Explore our container & grade guides to understand exactly what you’re buying.' },
    ],
  },
  {
    id: 'rent',
    label: 'RENT',
    price: 'From {rent}/Mo',
    note: 'Short/Long Term',
    heading: 'Shipping Container Rental',
    // Word for word from the design (2026-11-24).
    body:
      'Rent a shipping container for a few months or a few years. Rentals start at {rent} a month, and sales tax may apply in some areas. We rent dry van storage containers in standard and high cube sizes, and refrigerated units for temperature-controlled storage.\n\n' +
      'Short-term rentals suit renovations, seasonal inventory, and job sites. Long-term rentals suit businesses that need extra space without buying. [[Rent now,]] and you can convert to ownership later with our rent-to-own program.',
    card: {
      lead: 'Starting at',
      price: '{rent}',
      suffix: '/mo',
      caption: 'Quoted price is the price you pay',
      button: 'Rent A Shipping Container',
      href: `${ROUTES.PLP}?ptype=rental`,
    },
    // Reading order (a phone's list); desktop fills its 2x2 grid column by column.
    features: [
      { icon: 'price', title: 'Low Monthly Rates', text: 'From {rent} a month. Rent for a few months or a few years.' },
      { icon: 'terms', title: 'Short & Long Term', text: 'Flexible rental terms to fit your project or business.' },
      { icon: 'conditions', title: 'Sizes & Refrigerated Options', text: 'Choose from 20ft, 40ft, and 40ft High Cube dry van containers, or refrigerated units for cold storage.' },
      { icon: 'convert', title: 'Rent Now, Own Later', text: 'Convert to ownership later with our rent-to-own program.' },
    ],
  },
  {
    id: 'rto',
    label: 'RENT-TO-OWN',
    price: 'From {rto}/Mo',
    note: 'Own It At The End',
    heading: 'Rent-To-Own Shipping Containers',
    body:
      'Own a shipping container with easy monthly payments. Rent-to-own starts at {rto} a month, and every payment moves you closer to owning the container at the end of your term.\n\n' +
      'There is no credit check: choose your container and a 12, 24, 36, or 48-month term, apply in minutes, and get approved the same day. It is available on almost every container, except As-is units and working refrigerated containers.\n\n' +
      `See how it works on our [rent-to-own financing](${ROUTES.RENT_TO_OWN}) page, or compare [container conditions](${ROUTES.CONTAINER_CONDITIONS}) to choose the one you will own.`,
    card: {
      lead: 'Starting at',
      price: '{rto}',
      suffix: '/mo',
      caption: 'Own it at the end of your term',
      button: 'Rent-To-Own A Container',
      href: `${ROUTES.PLP}?ptype=rto`,
    },
    features: [
      { icon: 'approval', title: 'No Credit Check', text: 'Apply in minutes and get approved the same day.' },
      { icon: 'terms', title: 'Flexible Terms', text: 'Choose 12, 24, 36, or 48 months to fit your budget.' },
      { icon: 'ownership', title: 'Own It At The End', text: 'Every monthly payment counts toward owning your container.' },
      { icon: 'guides', title: 'Expert Guides', text: 'Explore our container & grade guides to understand exactly what you’re getting.' },
    ],
  },
]
