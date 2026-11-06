/**
 * Copy and media for /cargo-worthy-shipping-container, carried over from the
 * WordPress page it replaced (2026-11-06): its visible sections, in its order,
 * word for word. Edit here; the components only lay it out.
 *
 * The page was never imported into the backend, so it 404'd in this app until
 * it became native.
 *
 * Corrected from WordPress: "look similar to similar to Used" (doubled words),
 * "a month(some areas may require sale tax)" (a missing space, "sales tax"),
 * and "6, 12 18" (a missing comma). Every phone number is (888) 977-9085.
 *
 * Still as WordPress has it, for the content owner: "9′ 6’’" mixes quote marks.
 *
 * Replaced: WordPress's "AVAILABILITY AND LOCATION" shows a broken store-locator
 * shortcode (the literal text "[onsite_agile_store_locator]"); here it is the
 * ZIP finder (`LocationSearch`). The review slider is the shared
 * `ReviewsSection`, fed by `getReviews()`.
 */

import { ROUTES } from '@/config/routes'

const CDN = 'https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2023/11'

export type CargoImage = { src: string; alt: string; width: number; height: number }

/** A run of text, or a link inside the sentence. `bold` as WordPress set it. */
export type CargoSegment = string | { text: string; href: string; bold?: boolean }

/** Root-relative paths of pages that are still WordPress's (listed in the migration doc). */
export const CARGO_LINKS = {
  wwt: '/wwt-containers-wind-and-watertight-shipping-containers',
  morePhotos: '/shipping-container-pictures-by-grades/cargo-worthy-shipping-container',
  twentyFoot: '/20-foot-shipping-containers',
  fortyFoot: '/40-foot-shipping-containers',
  fortyHighCube: '/40-high-cube-shipping-containers',
  forSale: '/shipping-containers-for-sale',
  rental: '/shipping-container-rental',
  reviews: '/review-of-shipping-containers',
} as const

export const CARGO_HERO = {
  heading: 'CARGO WORTHY SHIPPING CONTAINER FOR SALE',
  subheading: '(CW/CWO)',
  background: { src: `${CDN}/28071527/banner-65658e5797aef.webp`, alt: '' },
} as const

export const CARGO_INTRO = {
  heading: 'What are cargo worthy containers?',
  body: [
    'A shipping container in Cargo Worthy condition means the container has been inspected to ensure it is structurally sound and will keep cargo dry and safe from the elements. Cargo worthy grade containers include both new and used containers. Note IICL grade containers are higher grade cargo worthy containers that have passed more stringent inspection guidelines. Most used Cargo Worthy containers will look similar to Used ',
    { text: 'Wind and Water Tight containers', href: CARGO_LINKS.wwt },
    '.',
  ] satisfies readonly CargoSegment[],
  examplesHeading: 'Here are a few examples of cargo worthy containers (colors may vary)',
  examples: [
    { src: `${CDN}/28071532/cw-sample-1-65658e58ae5ed.webp`, alt: 'Used cargo worthy shipping container, example 1', width: 571, height: 416 },
    { src: `${CDN}/28071535/cw-sample-2-65658e59b9062.webp`, alt: 'Used cargo worthy shipping container, example 2', width: 566, height: 422 },
    { src: `${CDN}/28071538/cw-sample-3-65658e5a24ee5.webp`, alt: 'Used cargo worthy shipping container, example 3', width: 572, height: 415 },
  ] satisfies readonly CargoImage[],
  morePhotosCta: 'SEE MORE PHOTOS',
  survey: 'If you are planning to ship your container internationally your shipping company or freight forwarder will require that you provide an independent survey inspection report. The container survey inspection is an additional cost and On-site Storage Solutions can coordinate if needed. The certified inspector will provide a 1 page survey inspection report stating the container is in “Cargo Worthy” condition. As part of the inspection an updated sticker will be applied to the CSC plate verifying the container was inspected and extending the cargo worthy designation for a minimum of 6 months before requiring the container to be reinspected.',
  gradeHeading: 'CONDITION / GRADE',
  grade: 'All our Used Cargo Worthy containers are guaranteed to be structurally sound and won’t leak. If you are planning to use a fork lift we recommend purchasing a Cargo Worthy container since the floor has been inspected to ensure it is capable of supporting the weight of a forklift. On the outside, most used cargo worthy containers will look similar to Used Wind and Water Tight containers. Customers should expect dents, dings, rust and repairs as a result of normal usage. If external appearances are important, then we recommend that you consider a Used or New One Trip Shipping Container.',
} as const

export const CARGO_EXPECT = {
  intro: 'You can expect Used Cargo Worthy containers to have any or all of the following:',
  items: [
    'Guaranteed Wind and Watertight',
    'Original paint with old container markings and shipping logos.',
    'Dents and abrasions from being stacked and moved.',
    'External rust from life at sea.',
    'Repairs that are consistent with normal wear and tear. Including welded cutouts, gaskets, and paint',
    'Floors will show signs of use including scratches and delamination but they will be certified as safe to use for shipping and they will support the weight of a forklift.',
  ],
  images: [
    { src: `${CDN}/28071540/cw-wall-65658e5ac0135.webp`, alt: 'Wall of a used cargo worthy container', width: 441, height: 537 },
    { src: `${CDN}/28071530/cw-floor-65658e578ca7b.webp`, alt: 'Floor of a used cargo worthy container', width: 446, height: 537 },
  ] satisfies readonly CargoImage[],
} as const

export const CARGO_AVAILABILITY = {
  heading: 'AVAILABILITY AND LOCATION',
  body: 'Most standard sizes are easily available in all our locations.',
} as const

export const CARGO_COST = {
  heading: 'COST',
  body: 'The cost of a Used Cargo Worthy container will depend on the size, condition, and location.',
} as const

export const CARGO_SIZES_BAND = 'CARGO WORTHY CONTAINER AVAILABLE SIZES'

export type CargoSize = { title: string; href: string; lead: string; rest: string; image: CargoImage }

export const CARGO_SIZES: readonly CargoSize[] = [
  {
    title: '20 FT STANDARD SHIPPING CONTAINER',
    href: CARGO_LINKS.twentyFoot,
    lead: '20-foot standard shipping containers',
    rest: ' are made of 14-gauge corrugated steel and marine-grade plywood flooring with a secure set of cargo doors on one end. These versatile heavy duty steel shipping containers provide a durable and safe storage solution. They are rated for 60,000 pounds of cargo which far exceeds what most trucks can carry on the highway.',
    image: { src: `${CDN}/28071543/20-ft-65658e55db4db.webp`, alt: '20 ft standard cargo worthy shipping container', width: 519, height: 389 },
  },
  {
    title: '40 FT STANDARD SHIPPING CONTAINER',
    href: CARGO_LINKS.fortyFoot,
    lead: '40ft Storage Containers',
    rest: ' are the most popular container choice. They are a better value since they are twice the size of a 20’ container but they don’t cost twice as much. Hence you pay less per square foot of storage',
    image: { src: `${CDN}/28071545/40-ft-65658e551715c.webp`, alt: '40 ft standard cargo worthy shipping container', width: 510, height: 383 },
  },
  {
    title: '40 FT HIGH CUBE SHIPPING CONTAINER',
    href: CARGO_LINKS.fortyHighCube,
    lead: '40 ft High Cube Containers',
    rest: ' have an exterior height that is 9′ 6’’ tall which is 1 foot taller than standard height containers at 8’ 6” High. The additional 12 inches on the interior makes the container interior feel more like a traditional room. Hence 40’ and 45’ high cubes are a great choice if you plan to use the container for a shop or living space.',
    image: { src: `${CDN}/28071548/40-hc-65658e564d365.webp`, alt: '40 ft high cube cargo worthy shipping container', width: 519, height: 389 },
  },
]

export const CARGO_BUY = {
  heading: 'BUY FROM US',
  body: 'We offer a wide selection of specialty storage containers for all your needs. From reefer, and flat rack to tank containers, we have the right option for you – no matter the size or purpose. Our purchasing power ensures that you’re always getting the best price available.',
  cta: 'LEARN MORE',
} as const

export type CargoOption = { title: string; href: string; before: string; phoneText: string; after: string }

export const CARGO_OPTIONS = {
  heading: 'LOW-COST ON-SITE STORAGE SOLUTIONS',
  cta: 'LEARN MORE',
  items: [
    {
      title: 'RENTAL',
      href: CARGO_LINKS.rental,
      before: 'On-Site Storage Solutions is a leader in providing rental shipping containers for temporary or long-term needs at the lowest rates available. Rental rates start as low as $99 a month (some areas may require sales tax), just give us a call at',
      phoneText: '(888) 977-9085',
      after: ', and we’ll walk you through the container rental process',
    },
    {
      title: 'RENT-TO-OWN',
      href: ROUTES.RENT_TO_OWN,
      before: 'On-Site Storage Solutions proudly presents a Rent-To-Own Option in partnership with My Container Rental. Call us at',
      phoneText: '(888) 977-9085',
      after: ' or select from our website the payment plans that suit you best – including 6, 12, 18, and 24 Months, as well as long-term programs.',
    },
  ] satisfies readonly CargoOption[],
} as const

export const CARGO_HELP = {
  before: 'If You Need Help In Choosing Your Container, Our Team Is Standing By',
  link: 'Call us now! (888)977-9085',
} as const

export const CARGO_REVIEWS_HEADING = "WE'VE GOT A LOT OF [[HAPPY CUSTOMERS]]"
export const CARGO_REVIEWS_CTA = 'VIEW ALL REVIEWS'

export const CARGO_NEWSLETTER_HEADING = 'SUBSCRIBE TO OUR NEWSLETTER TO RECEIVE THE LATEST NEWS AND EXCLUSIVE OFFERS'

export const CARGO_FAQ_HEADING = 'FREQUENTLY ASKED QUESTIONS'

/** From WordPress's accordion, answers included (collapsed there until opened). */
export const CARGO_FAQS = [
  {
    question: 'What are cargo-worthy containers?',
    answer: 'Cargo-worthy containers are shipping containers that have been deemed suitable for international transportation after passing an inspection to ensure they meet certain standards of structural integrity and condition.',
  },
  {
    question: 'Who determines whether a container is cargo-worthy?',
    answer: 'The determination of whether a container is cargo-worthy is usually made by a qualified inspector or surveyor who follows international guidelines and industry standards.',
  },
  {
    question: 'What criteria does a container need to meet to be considered cargo-worthy?',
    answer: 'Cargo-worthy containers must meet specific standards regarding structural integrity, framework, flooring, doors, and overall condition to ensure safe and secure transportation of goods.',
  },
  {
    question: 'Can cargo-worthy containers be stacked or loaded on top of each other?',
    answer: 'Yes, cargo-worthy containers are designed to be structurally sound and capable of being stacked or loaded on top of each other to maximize space during transportation and storage.',
  },
  {
    question: 'What advantages do cargo-worthy containers offer over regular shipping containers?',
    answer: 'Cargo-worthy containers provide assurance that they meet international standards for safe and secure transportation of goods. They undergo thorough inspections and maintenance to ensure their suitability for international shipping.',
  },
] as const
