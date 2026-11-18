import { FEATURED_CONTAINERS } from '@/config/featuredContainers'
import { ROUTES } from '@/config/routes'
import { OFFER_TABS } from './homeOfferTabs'
import { HOW_IT_WORKS_EYEBROW, HOW_IT_WORKS_STEPS } from './howItWorksSteps'
import { CDN } from './containerLandingContent'
import type { AllCitySections, AllCityTemplate, AllCityTemplateText } from '@/types/allCity'

/**
 * The /all-city/ pages' template as WordPress had it (read 2026-11-13): the
 * code default, which the admin's All City Pages → Template edits.
 *
 * WordPress had one Elementor template per depot, all with these words (the
 * `city` variant), and one for the depot cities (`depotCity`). The block beside
 * the banner is the template's text, not the post body: WordPress ignored the
 * body (a post reading "demand" still showed "demands").
 *
 * Phone: WordPress showed (888) 667-4834 in the rental paragraph and the "$50
 * off" band; the owner's 2026-11-06 rule (every number is the sales line)
 * applies, so both are `{phone}`.
 *
 * Left out: the step icons and the two financing photos, which never loaded on
 * WordPress; the store locator's map, which failed there (its ZIP box is
 * `LocationSearch`, as on the other migrated pages).
 *
 * Kept for the content owner: "Minimum 550 FICA" (FICO?); the lease paragraph
 * ends without a full stop; the "On-Site Storage Solutions" links go to
 * onsitestoragesolutions.com, another site.
 */

/** The ZIP box the steps' "Enter zip/postal code" link scrolls to. */
export const ALL_CITY_ZIP_ANCHOR = 'find-prices'

const SHARED = {
  quoteButton: 'GET A QUOTE',
  whyHeading: 'WHY CHOOSE ON-SITE STORAGE SOLUTIONS?',
  popularHeading: 'Popular Cities in {state}',
  viewAllLabel: 'View all cities in {state}',
  stepsHeading: 'BUY A SHIPPING CONTAINER IN {CITY}',
  steps: [
    { title: 'STEP 1', text: `[Enter zip/postal code](#${ALL_CITY_ZIP_ANCHOR}) for container prices near you` },
    { title: 'STEP 2', text: 'Affordable pricing options based on your type, size and condition' },
    { title: 'STEP 3', text: 'Wait for your delivery! Delivery takes 3-7 days after checkout.' },
  ],
  locatorHeading: 'Find prices near you.',
  financingHeading: 'FINANCING AND RENTAL OPTIONS AVAILABLE',
  rentalTitle: 'RENTAL',
  rentalBody:
    '[On-Site Storage Solutions](https://onsitestoragesolutions.com/) is the leader of storage rentals whether you need Dry Van Containers and Refrigerated Containers. With over 60 locations around America and Canada, we can get your container anytime or anywhere! Call us today at {phone} to know the rental terms near you.',
  leaseTitle: 'LEASE-TO-PURCHASE',
  leaseBody:
    '[On-Site Storage Solutions](https://onsitestoragesolutions.com/) has partnered with TimePayment to offer affordable lease-to-purchase options for qualified applicants (Minimum 550 FICA). If you need a shipping container for your business or personal use this option allows you to purchase your shipping container over time. Payments are usually less than the cost to rent an off-site storage unit with the added benefits of owning the container at the end of the term and having the storage on-site for easy access',
  leaseButton: 'APPLY FOR FINANCING',
  reviewsHeading: "WE'VE GOT A LOT OF HAPPY CUSTOMERS",
} satisfies Partial<AllCityTemplateText>

const CITY: AllCityTemplateText = {
  ...SHARED,
  introHeading: 'Shipping Storage Containers in {city}',
  introBody:
    'On-Site Storage Solutions is a leading provider of new and used shipping containers for sale in {city}. We sell a variety of container types, including one-trip containers, refurbished containers, cargo-worthy containers, and [wind and watertight shipping containers](/wwt-containers-wind-and-watertight-shipping-containers). We also have insulated and refrigerated shipping containers for sale.\n\n' +
    'Whether you’re shipping a big shipment overseas or a tiny job, we’ve got the container for you. Our shipping containers come in sizes ranging from 10 to 40 feet and have various door arrangements. This range allows us to fulfill a [wide range of shipping container](/shipping-container-conditions) demands.',
  whyBody:
    'You can rely on On-Site Storage to get you the best shipping container prices in {city} and the neighboring area, regardless of market conditions. We have direct access to shipping containers from major shipping and container lease companies all around the world, giving us a significant price advantage. This allows us to give the best prices guaranteed.\n\n' +
    'For more information and pricing, check below our product catalog. Give us a call if you need assistance selecting the correct shipping container. Our container experts are available to answer your questions and assist you in [selecting the best option for your needs](/a-quick-easy-guide-for-choosing-the-right-shipping-container).',
  offerBand: '',
}

const DEPOT_CITY: AllCityTemplateText = {
  ...SHARED,
  introHeading: 'BUY A SHIPPING CONTAINER {CITY}, {ST}',
  introBody:
    'If you’re seeking reliable and quality shipping cargo containers for sale in {city}, choose [On-Site Storage Solutions](/why-onsite-storage). We offer a large range of shipping containers in many sizes and conditions. We have containers from brand-new “one-trip” to “as-is.” containers.\n\n' +
    'We can provide the shipping container you need, whether it’s a small 10-footer, a 40-foot high-cube container, or anything in between. We also have refrigerated shipping containers for sale, [refurbished containers](/refurbished-shipping-container), wind and watertight, and cargo-worthy that are certified for shipment.',
  whyBody:
    'We have been selling and renting new and used shipping containers throughout {city} since 2002. We buy thousands of containers from major shipping and container lease companies, giving us a significant price advantage. This allows us to give the [best prices guaranteed](/money-back-guarantee).\n\n' +
    'You can buy or rent from us with confidence, knowing that we have the experience to deliver the storage container you want, at a price you can afford.',
  // WordPress wrote the number with hyphens (888-667-4834); `{phone}` is the sales line.
  offerBand: 'GET $50 OFF YOUR CONTAINER TODAY. CALL US! {phone}',
}

/**
 * The redesigned sections (the 2026-11-18 designs), shared by both variants.
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
}

export const ALL_CITY_TEMPLATE_DEFAULT: AllCityTemplate = {
  sections: SECTIONS,
  city: CITY,
  depotCity: DEPOT_CITY,
  media: {
    heroBackground: `${CDN}/2022/05/27100440/new-location-template-header-bg.webp`,
    youtubeId: 'X_ZqX0SW0Go',
    videoTitle: 'On-Site Storage Solutions shipping containers',
  },
  links: {
    quote: '/shipping-container-quote',
    financing:
      'https://apply.timepayment.com/about-financing/?module=easyapply&version=1.0.0&dealercode=06DJF&id=&apptype=C%2CB&ref=&pv=&officecode=&applicationurl=https%3A%2F%2Fapply.timepayment.com%2Fldaweb%2Fdefault.aspx&x=266&y=76',
  },
}
