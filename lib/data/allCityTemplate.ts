import { FEATURED_CONTAINERS } from '@/config/featuredContainers'
import { HOME_HEADING_DEFAULTS } from '@/config/homeContent'
import { ROUTES } from '@/config/routes'
import { OFFER_TABS } from './homeOfferTabs'
import { HOW_IT_WORKS_EYEBROW, HOW_IT_WORKS_STEPS } from './howItWorksSteps'
import { ONSITE_DIFFERENCE_BODY, ONSITE_DIFFERENCE_BUTTON, ONSITE_DIFFERENCE_POINTS } from './onsiteDifference'
import { QUOTE_FORM_BODY, QUOTE_FORM_POINTS } from './quoteForm'
import { CDN } from './containerLandingContent'
import type { AllCitySections, AllCityTemplate } from '@/types/allCity'

/**
 * The /all-city/ pages' template: the code default, which the admin's All City
 * Pages → Template edits. Since the 2026-11-18/19 redesign every word is a
 * section's (SECTIONS, top to bottom); WordPress's own sections (intro, lists,
 * video, steps, ZIP box, financing, reviews, the "$50 off" band) were removed
 * with their settings on 2026-11-19. Its full state list lives on in Popular
 * Cities ("View all cities in {state}").
 */

/**
 * The page's sections (the 2026-11-18/19 designs), shared by both variants.
 * `[[…]]` is the amber accent. The hero's heading is each page's own h1
 * (`{h1}`), kept for SEO: it matches the page's title and keyword.
 */
const SECTIONS: AllCitySections = {
  breadcrumbs: { home: 'Home', state: '{state}', city: '{city}' },
  hero: {
    badge: 'America’s #1 Container Wholesaler · Since 2002',
    heading: '{h1}',
    body: 'Buy, rent, or rent-to-own shipping containers in [[{city}]] and across [[{state}]]. Ships from our [[{depot}]] depot. Delivery typically takes 3–7 days after checkout.',
    stats: [
      { value: '{price}', label: 'Used containers, starting price in [[{city}, {ST}]]' },
      { value: '3–7 Days', label: 'Typical delivery after checkout' },
      { value: '{depotCount}', label: 'Ships from {depot}' },
    ],
    quote: {
      heading: 'Get your free quote',
      subheading: 'Same day reply. The quote is the final price.',
      buyLabel: 'Buy',
      rentLabel: 'Rent',
      rtoLabel: 'Rent-to-own',
      zipLabel: 'Delivery Zip',
      sizeLabel: 'Size',
      contactLabel: 'Phone or email',
      button: 'Get My Free Quote',
      note: 'No obligation. We reply within 2 business hours.',
    },
  },
  // The homepage's four cards and their words (config/featuredContainers.ts), priced at the page's depot.
  products: {
    heading: 'Find The Right Shipping Container In [{city}, {ST}]({depotPage})',
    depotCityHeading: '{keyword}',
    body: 'We ship from the nearest depot in our network, which keeps your delivery cost as low as possible. Choose a size and condition, then [[buy]], [[rent]], or [[rent-to-own]].',
    cards: FEATURED_CONTAINERS.map((item) => ({
      spec: item.depotSpec,
      title: item.type,
      description: item.home?.desc ?? item.desc,
      button: item.home?.ctaLabel ?? item.ctaLabel,
    })),
    button: 'View All Shipping Containers & Pricing',
    buttonHref: `${ROUTES.PLP}?ptype=buy`,
    note: 'Final price depends on your delivery address',
  },
  // The homepage's logo carousel, without its heading (the design).
  trustedBy: { show: true, heading: '' },
  // The homepage's Buy / Rent / Rent-To-Own section and its words, priced at the page's depot.
  offers: { show: true, tabs: structuredClone([...OFFER_TABS]) },
  // The homepage's "How It Works": its city linked to the depot's page, its button to the listing at that depot.
  howItWorks: {
    show: true,
    eyebrow: HOW_IT_WORKS_EYEBROW,
    heading: 'How It Works',
    subtitle: 'How To Buy Or Rent A Shipping Container [{city}, {ST}]({depotPage}) In Four Steps',
    steps: HOW_IT_WORKS_STEPS.map(({ title, desc }) => ({ title, desc })),
    button: 'View All Containers & Pricing',
    buttonHref: '{depotPlp}',
  },
  // The homepage's "On-Site Storage Difference", about the page's city and depot (the 2026-11-18 design).
  difference: {
    show: true,
    heading: 'The On-Site Storage Difference in [[{city}, {ST}]]',
    body: ONSITE_DIFFERENCE_BODY,
    points: [
      ONSITE_DIFFERENCE_POINTS[0],
      { title: 'Nearby Depots Serving [[{city}, {ST}]]', desc: 'Shipping from [{depot}]({depotPage}) keeps mileage and delivery costs down.' },
      ONSITE_DIFFERENCE_POINTS[2],
      ONSITE_DIFFERENCE_POINTS[3],
    ].map(({ title, desc }) => ({ title, desc })),
    button: ONSITE_DIFFERENCE_BUTTON,
    image: '',
  },
  // The depot's newest deliveries (the homepage's commented-out "Recently Delivered Containers", per depot).
  deliveries: {
    show: true,
    heading: 'Recently Delivered Containers Near [[{city}, {ST}]]',
    body: 'A look at recent orders we delivered near {city}. Each one comes from our delivery records, shown by city only.',
    placeLabel: 'Delivered to {place}',
    limit: 12,
  },
  // Other city pages of the state (its Popular Cities list): the 2026-11-19 design. No region data, so the depot's area.
  popular: {
    show: true,
    heading: 'Popular Cities in [[{city}, {ST}]]',
    body: `We deliver shipping containers throughout the {depot} area and across {state}. Find your area below, or [see all shipping container locations](${ROUTES.ALL_CITY_INDEX}).`,
    limit: 8,
    viewAllLabel: 'View all cities in {state}',
    button: 'Call For Expert Assistance',
  },
  // The homepage's "Get a free quote" section and its form (the Zoho pricing form).
  quote: {
    show: true,
    heading: HOME_HEADING_DEFAULTS['quoteForm.h2'],
    body: QUOTE_FORM_BODY,
    points: [...QUOTE_FORM_POINTS],
  },
}

export const ALL_CITY_TEMPLATE_DEFAULT: AllCityTemplate = {
  sections: SECTIONS,
  media: {
    heroBackground: `${CDN}/2022/05/27100440/new-location-template-header-bg.webp`,
  },
}
