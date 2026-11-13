import { ROUTES } from '@/config/routes'
import { CONTACT_NUMBER, telHref } from '@/lib/helpers'
import { CDN, type LandingInline } from './containerLandingContent'
import type { ProductVideo } from '@/config/productVideos'

/**
 * The words of the native /all-city/ pages, word for word from WordPress's city
 * template (read 2026-11-13). WordPress had one Elementor template per depot,
 * all with these words; `{city}` is the post's title ("Cocoa Beach").
 *
 * The block beside the banner is the template's text, not the post body:
 * WordPress ignored the body (a post reading "demand" still showed "demands").
 *
 * Phone: WordPress showed (888) 667-4834 in the rental paragraph; the owner's
 * 2026-11-06 correction (every number is the sales line) applies.
 *
 * Left out: the step icons and the two financing photos, which never loaded on
 * WordPress (wp-content URLs on the old host); the store locator's map, which
 * failed there ("This page didn't load Google Maps correctly"); its ZIP box is
 * `LocationSearch`, as on the other migrated pages.
 *
 * Kept for the content owner: "Minimum 550 FICA" (FICO?); the lease paragraph
 * ends without a full stop; the "On-Site Storage Solutions" links go to
 * onsitestoragesolutions.com, another site.
 */

/** Pages WordPress still serves (migration doc §12), and the native ones. */
export const ALL_CITY_LINKS = {
  quote: '/shipping-container-quote',
  wwt: '/wwt-containers-wind-and-watertight-shipping-containers',
  conditions: ROUTES.CONTAINER_CONDITIONS,
  choosingGuide: '/a-quick-easy-guide-for-choosing-the-right-shipping-container',
  /** WordPress's /buy-shipping-containers, which it 301s here (config/wpHiddenPages.ts). */
  buyOnline: '/buy-shipping-containers-online',
  whereToBuy: ROUTES.WHERE_TO_BUY,
  /** Off-site, as WordPress linked it. */
  solutionsSite: 'https://onsitestoragesolutions.com/',
  financing:
    'https://apply.timepayment.com/about-financing/?module=easyapply&version=1.0.0&dealercode=06DJF&id=&apptype=C%2CB&ref=&pv=&officecode=&applicationurl=https%3A%2F%2Fapply.timepayment.com%2Fldaweb%2Fdefault.aspx&x=266&y=76',
} as const

export const ALL_CITY_MEDIA = {
  /** The hero: navy on the left, the port photo on the right. */
  heroBackground: `${CDN}/2022/05/27100440/new-location-template-header-bg.webp`,
  pinIcon: `${CDN}/2022/05/27100440/new-location-template-location-icon.webp`,
} as const

export const ALL_CITY_VIDEO: ProductVideo = { id: 'X_ZqX0SW0Go', title: 'On-Site Storage Solutions shipping containers' }

export const ALL_CITY_TEXT = {
  hero: {
    body: 'The cost of a shipping container depends on the transportation from the depot to you. We have a large network of depots across the United States and Canada. This allows us to find you the nearest shipping container so that we can keep the cost as affordable as possible.',
    depotButton: 'See all location prices',
    otherButton: 'See other location prices',
  },
  quoteButton: 'GET A QUOTE',
  intro: {
    heading: (city: string) => `Shipping Storage Containers in ${city}`,
    paragraphs: (city: string): LandingInline[][] => [
      [
        `On-Site Storage Solutions is a leading provider of new and used shipping containers for sale in ${city}. We sell a variety of container types, including one-trip containers, refurbished containers, cargo-worthy containers, and `,
        { text: 'wind and watertight shipping containers', href: ALL_CITY_LINKS.wwt },
        '. We also have insulated and refrigerated shipping containers for sale.',
      ],
      [
        'Whether you’re shipping a big shipment overseas or a tiny job, we’ve got the container for you. Our shipping containers come in sizes ranging from 10 to 40 feet and have various door arrangements. This range allows us to fulfill a ',
        { text: 'wide range of shipping container', href: ALL_CITY_LINKS.conditions },
        ' demands.',
      ],
    ],
  },
  why: {
    heading: 'WHY CHOOSE ON-SITE STORAGE SOLUTIONS?',
    paragraphs: (city: string): LandingInline[][] => [
      [
        `You can rely on On-Site Storage to get you the best shipping container prices in ${city} and the neighboring area, regardless of market conditions. We have direct access to shipping containers from major shipping and container lease companies all around the world, giving us a significant price advantage. This allows us to give the best prices guaranteed.`,
      ],
      [
        'For more information and pricing, check below our product catalog. Give us a call if you need assistance selecting the correct shipping container. Our container experts are available to answer your questions and assist you in ',
        { text: 'selecting the best option for your needs', href: ALL_CITY_LINKS.choosingGuide },
        '.',
      ],
    ],
  },
  seeMore: 'SEE MORE',
  popularHeading: (stateName: string) => `Popular Cities in ${stateName}`,
  viewAllLabel: (stateName: string) => `View all cities in ${stateName}`,
  steps: {
    heading: (city: string) => `BUY A SHIPPING CONTAINER IN ${city.toUpperCase()}`,
    items: [
      { title: 'STEP 1', link: 'Enter zip/postal code', text: ' for container prices near you' },
      { title: 'STEP 2', text: 'Affordable pricing options based on your type, size and condition' },
      { title: 'STEP 3', text: 'Wait for your delivery! Delivery takes 3-7 days after checkout.' },
    ],
  },
  locatorHeading: 'Find prices near you.',
  financing: {
    heading: 'FINANCING AND RENTAL OPTIONS AVAILABLE',
    rental: {
      title: 'RENTAL',
      body: [
        { text: 'On-Site Storage Solutions', href: ALL_CITY_LINKS.solutionsSite },
        ' is the leader of storage rentals whether you need Dry Van Containers and Refrigerated Containers. With over 60 locations around America and Canada, we can get your container anytime or anywhere! Call us today at ',
        { text: CONTACT_NUMBER, href: telHref(CONTACT_NUMBER) },
        ' to know the rental terms near you.',
      ] satisfies LandingInline[],
    },
    lease: {
      title: 'LEASE-TO-PURCHASE',
      body: [
        { text: 'On-Site Storage Solutions', href: ALL_CITY_LINKS.solutionsSite },
        ' has partnered with TimePayment to offer affordable lease-to-purchase options for qualified applicants (Minimum 550 FICA). If you need a shipping container for your business or personal use this option allows you to purchase your shipping container over time. Payments are usually less than the cost to rent an off-site storage unit with the added benefits of owning the container at the end of the term and having the storage on-site for easy access',
      ] satisfies LandingInline[],
      button: 'APPLY FOR FINANCING',
    },
  },
  reviewsHeading: "WE'VE GOT A LOT OF HAPPY CUSTOMERS",
} as const
