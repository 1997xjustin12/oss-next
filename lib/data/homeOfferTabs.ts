import { ROUTES } from '@/config/routes'

/**
 * The homepage's Buy / Rent / Rent-To-Own section (OfferTabs), under the hero
 * on every version of the homepage. Buy is word for word from the design
 * (2026-11-18); Rent and Rent-To-Own follow its pattern with the facts the
 * rental and rent-to-own pages already state, for the content owner to review.
 *
 * Body text uses the template syntax (TemplateRichText): `[label](/path)` is
 * a link, and a blank line starts a new paragraph.
 */

export type OfferFeatureIcon = 'price' | 'sizes' | 'conditions' | 'guides' | 'terms' | 'delivery' | 'ownership' | 'approval'

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
    price: string
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
    price: 'From $1,350',
    note: 'New & Used',
    heading: 'Shipping Containers For Sale',
    body:
      'Buy a new or used shipping container directly from On-Site Storage Solutions, a nationwide shipping container wholesaler since 2002. Prices start at $1,350 for used units, and the price you are quoted is the price you pay, with no hidden fees.\n\n' +
      'Used shipping containers come in three conditions: wind and watertight (WWT), cargo-worthy, and as is. New containers are one-trip units, shipped once and ready for storage or custom work.\n\n' +
      `Read our guides to [container conditions](${ROUTES.CONTAINER_CONDITIONS}) and [container grades](${GRADES_GUIDE}) to see what each one looks like before you buy. Every container is available in standard 20ft and 40ft sizes, and in 40ft high cube. Browse [types of shipping containers](${ROUTES.CONTAINER_TYPES}) to compare sizes, interior dimensions, and uses.`,
    card: {
      lead: 'Starting at',
      price: '$1,350',
      caption: 'Quoted price is the price you pay',
      button: 'Buy A Shipping Container',
      href: `${ROUTES.PLP}?ptype=buy`,
    },
    // Reading order (a phone's list); desktop fills its 2x2 grid column by column.
    features: [
      { icon: 'price', title: 'Transparent Pricing', text: 'From $1,350. The price you are quoted is the price you pay, with no hidden fees.' },
      { icon: 'sizes', title: 'Standard & High Cube Sizes', text: 'Available in 20ft, 40ft, and 40ft High Cube sizes to suit any storage need.' },
      { icon: 'conditions', title: 'Diverse Conditions', text: 'Choose from New, Cargo-Worthy, Wind & Watertight (WWT), or As-is units.' },
      { icon: 'guides', title: 'Expert Guides', text: 'Explore our container & grade guides to understand exactly what you’re buying.' },
    ],
  },
  {
    id: 'rent',
    label: 'RENT',
    price: 'From $95/Mo',
    note: 'Short/Long Term',
    heading: 'Shipping Container Rental',
    body:
      'Rent a shipping container from On-Site Storage Solutions for as long as you need it. Rentals start at $95 a month, for short-term or long-term storage, and are delivered from a local depot across the U.S. and Canada.\n\n' +
      'Rental containers are used 20ft and 40ft units, wind and watertight and ready for storage at a home, a jobsite, or a business. The monthly price depends on the location, the term, and the size of the container.\n\n' +
      `Read our [shipping container rental](${ROUTES.RENTAL}) guide for terms and delivery, or browse [types of shipping containers](${ROUTES.CONTAINER_TYPES}) to choose a size. Need it long term? [Rent-to-own](${ROUTES.RENT_TO_OWN}) puts every payment toward owning it.`,
    card: {
      lead: 'Starting at',
      price: '$95/mo',
      caption: 'Short or long term, delivered locally',
      button: 'Rent A Shipping Container',
      href: `${ROUTES.PLP}?ptype=rental`,
    },
    features: [
      { icon: 'price', title: 'Low Monthly Rates', text: 'From $95 a month, with the price confirmed before you order.' },
      { icon: 'terms', title: 'Short Or Long Term', text: 'Rent for a few months or keep it for as long as your project needs.' },
      { icon: 'sizes', title: '20ft & 40ft Sizes', text: 'Wind & watertight units in 20ft and 40ft, ready for on-site storage.' },
      { icon: 'delivery', title: 'Local Delivery', text: 'Delivered from a depot near you, across the U.S. and Canada.' },
    ],
  },
  {
    id: 'rto',
    label: 'RENT-TO-OWN',
    price: 'From $79.99/Mo',
    note: 'Own It At The End',
    heading: 'Rent-To-Own Shipping Containers',
    body:
      'Own a shipping container with easy monthly payments. Rent-to-own starts at $79.99 a month, and every payment moves you closer to owning the container at the end of your term.\n\n' +
      'There is no credit check: choose your container and a 12, 24, 36, or 48-month term, apply in minutes, and get approved the same day. It is available on almost every container, except As-is units and working refrigerated containers.\n\n' +
      `See how it works on our [rent-to-own financing](${ROUTES.RENT_TO_OWN}) page, or compare [container conditions](${ROUTES.CONTAINER_CONDITIONS}) to choose the one you will own.`,
    card: {
      lead: 'Starting at',
      price: '$79.99/mo',
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
