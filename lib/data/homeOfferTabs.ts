import { ROUTES } from '@/config/routes'

/**
 * The homepage's Buy / Rent / Rent-To-Own section (OfferTabs), under the hero
 * on every version of the homepage. Buy (2026-11-18), Rent and Rent-To-Own
 * (2026-11-24) are from the design.
 *
 * Body text uses the template syntax (TemplateRichText): `[[bold]]` is bold, `[label](/path)` is
 * a link, and a blank line starts a new paragraph. A paragraph whose every line
 * starts "1. ", "2. "… is a numbered list.
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
    // From the design (2026-11-24); the middle paragraph is a numbered list.
    body:
      'Pay for your container in monthly installments and own it at the end. Rent-to-own shipping containers start at {rto} a month.\n\n' +
      '1. Choose a payment term of 12, 24, 36, or 48 months on our website.\n' +
      '2. No credit check is required. Everyone qualifies based on valid public background information.\n' +
      '3. Pay off early and save 33% of the remaining balance with a one-time early payment discount.\n\n' +
      'Rent-to-own is available on used and new containers in 20ft, 40ft, and 40ft high cube, in wind- and water-tight, cargo-worthy, and IICL conditions.',
    card: {
      lead: 'Starting at',
      price: '{rto}',
      suffix: '/mo',
      caption: 'Quoted price is the price you pay',
      // The design's button reads "Rent A Shipping Container" (the Rent tab's); this one goes to rent-to-own.
      button: 'Rent-To-Own A Container',
      href: `${ROUTES.PLP}?ptype=rto`,
    },
    // Reading order (a phone's list); desktop fills its 2x2 grid column by column.
    features: [
      { icon: 'price', title: 'Low Monthly Rates', text: 'From {rto} a month, with the container yours at the end of the term.' },
      { icon: 'terms', title: 'Choose Your Term', text: 'Pick 12, 24, 36, or 48 months to fit your budget.' },
      // The design repeats the Rent tab's sizes line here; this says what the title promises.
      { icon: 'approval', title: 'No Credit Check', text: 'Everyone qualifies based on valid public background information.' },
      { icon: 'convert', title: 'Save 33% When You Pay Early', text: 'Pay off early and save 33% of the remaining balance.' },
    ],
  },
]
