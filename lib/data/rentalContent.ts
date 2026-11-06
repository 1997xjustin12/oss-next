import { CONTACT_NUMBER, telHref } from '@/lib/helpers'
import { ROUTES } from '@/config/routes'
import { CDN, p, type LandingFaq } from './containerLandingContent'
import type { ProductVideo } from '@/config/productVideos'
import type { DepotFeaturedKey } from '@/services/search.service'

/**
 * /shipping-container-rental, word for word from WordPress (visible sections
 * only; shared parts in containerLandingContent.ts).
 *
 * Left out, hidden on every device on WordPress: "Shipping Containers For Rent
 * Near Me — We Serve All 50 U.S. States And Canada" and its store-locator
 * shortcode. WordPress's per-device duplicates appear once (the desktop copy:
 * its mobile copies gave (888) 667-4834 and "Rent-To-Own A Containers").
 *
 * Changed: the FAQ's (888) 667-4834 is the sales line, (888) 977-9085, as on
 * every migrated page. "Rent A Shipping Container" under the modifications
 * linked to "#"; it now opens the rental listing.
 *
 * Kept for the content owner: "We have locations near you means quick
 * delivery…"; "Minimum 550 FICA" (FICO?); "Check out our guide…" names a
 * guide without linking one.
 */

/** Its "Rent A Shipping Container" button: the rental listing. */
export const RENTAL_LISTING = `${ROUTES.PLP}?ptype=rental`

/** TimePayment's application, as WordPress links it. */
export const TIME_PAYMENT_APPLICATION =
  'https://secure.financ.ing/?apptype=b&dealercode=06DJF&productname=&id=&cost=&salesperson=&office=&qs=&website=&cid=362b94ed-5558-4e68-962e-9c3ecbcc631d'

export const RENTAL_HERO = {
  /** `[[…]]` is the yellow run. */
  heading: 'Get The [[Best Prices]] on Shipping Containers [[For Rent]]',
} as const

/** WordPress's row: the same three used WWT containers, to rent. */
export const RENTAL_FEATURED_SPECS: readonly DepotFeaturedKey[] = ['used_20s_wwt', 'used_40s_wwt', 'used_40h_wwt']

/** The structured data's product name, as WordPress declared it. */
export const RENTAL_PRODUCT_NAME = 'Rental Used 20 ft Standard Shipping Container - Wind & Water Tight (WWT)'

export const RENTAL_INTRO = {
  heading: 'Rent Temporary Storage - We make it easy.',
  body: 'On-Site Storage Solutions is a leader in shipping container rentals, with thousands of satisfied clients relying on our best-in-class storage container rental service for temporary or long-term storage containers. On-Site Storage Solutions specializes in offering a wide range of secure, sturdy, and weather-tight storage containers for rent. On-Site Storage Solutions provides nationwide direct delivery and pick-up for shipping container rentals near you.',
  points: [
    'Affordable month-to-month rental rates and long-term rental rate discounts',
    'We have locations near you means quick delivery and lower cost',
    'Huge inventory offering a wide variety of sizes',
    'Quick delivery and pick up',
    'Superior service',
  ],
  image: { src: `${CDN}/2024/06/18075725/rent-1-66713d3fbcdb2.webp`, alt: 'Shipping container for rent', width: 416, height: 235 },
} as const

export const RENTAL_WHY = {
  heading: 'Why Should I Rent A Shipping Container?',
  lead: 'Storage containers for rent: Construction sites, pop-up stores, portable storage, and more.',
  benefitsHeading: 'Benefits of Renting A Shipping Container:',
  benefits: ['Convenient and easy to use', 'Budget-friendly affordable secure storage', 'Ideal for short or one-time use', 'No maintenance'],
  body: 'Renting a shipping container is an ideal choice when you’re moving out of your home, transporting goods on land or overseas, storing equipment, or setting up a remote office. With the container’s versatility, it provides a cost-effective, secure, and convenient way to address your temporary or seasonal needs for a portable and sturdy structure. And if you’re planning to purchase one in the future, you can still consider renting to better understand the ideal size and customization you need before investing so much money.',
  image: { src: `${CDN}/2024/10/25081823/rent-page-2024-10-img-1.webp`, alt: 'Rented shipping container on a job site', width: 800, height: 670 },
} as const

export const RENTAL_VIDEO: ProductVideo = { id: 'eLkV26Yh320', title: 'Top 5 Shipping Container Rental Questions' }

export const RENTAL_PRODUCTS = {
  products: {
    heading: 'Our Products',
    body: [
      'We offer the lowest rates on the dry van (standard and high cubes) and refrigerated storage container rentals. Our containers are available for long-term or short-term rental or even lease-to-own. Rental rates start as low as $95 a month (some areas may require sales tax), just give us a call at ',
      { text: CONTACT_NUMBER, href: telHref(CONTACT_NUMBER) },
      ', and we’ll walk you through the container rental process.',
    ],
    images: [
      { src: `${CDN}/2024/10/25084938/rent-page-2024-10-img-2.webp`, alt: 'Used shipping container for rent', width: 768, height: 1024 },
      { src: `${CDN}/2024/10/25085013/rent-page-2024-10-img-3-768x1024.webp`, alt: 'Shipping container on a delivery trailer', width: 768, height: 1024 },
    ],
  },
  modifications: {
    heading: 'We Provide Modifications',
    paragraphs: [
      ['Other services include custom container modifications. If you can think of it, we can build it. Whether you are building a container home or just need a roll-up door installed we can make it happen.'],
      [
        'We believe in providing straightforward and upfront pricing to our clients. Send your details using our web form to receive a quote for your shipping container modification or simply give us a call at ',
        { text: CONTACT_NUMBER, href: telHref(CONTACT_NUMBER) },
        '.',
      ],
    ],
    images: [
      { src: `${CDN}/2024/10/25085401/rent-page-2024-10-img-4.webp`, alt: 'Modified container with a door and a light', width: 480, height: 640 },
      { src: `${CDN}/2024/10/25085423/rent-page-2024-10-img-5.webp`, alt: 'Modified container with an air conditioning unit', width: 480, height: 640 },
    ],
  },
  cta: 'Rent A Shipping Container',
} as const

export const RENTAL_FINANCING = {
  heading: 'Shipping Container Financing Options',
  rentToOwn: {
    heading: 'Rent-To-Own Shipping Containers',
    body: 'Everyone qualifies for rent-to-own shipping container financing through My Container Rental. No credit check is required. We offer 12, 24, 36, and 48-month programs on almost all containers except As Is condition containers and working refrigerated containers.',
    cta: 'Rent-To-Own Shipping Containers',
    href: ROUTES.RENT_TO_OWN,
    image: { src: `${CDN}/2024/08/29120559/Find-Shipping-Containers-for-Sale-Near-Me-Online-1024x576.webp`, alt: 'Find Shipping Containers for Sale Near Me Online', width: 1024, height: 576 },
  },
  lease: {
    heading: 'Lease-to-Purchase',
    body: 'On-Site Storage Solutions has partnered with TimePayment to offer affordable lease-to-purchase options for qualified applicants (Minimum 550 FICA). Lease financing offers the best rates but there is an approval process. For those that qualify you get immediate ground-level storage at an affordable rate that you will own at the end of your lease.',
    cta: 'Lease-To-Purchase A Container',
    href: TIME_PAYMENT_APPLICATION,
    image: { src: `${CDN}/2024/11/26055223/time-payment.webp`, alt: 'TimePayment on a laptop screen', width: 800, height: 586 },
  },
} as const

const PHONE = { text: CONTACT_NUMBER, href: telHref(CONTACT_NUMBER) }

export const RENTAL_FAQS: readonly LandingFaq[] = [
  { question: 'Can I rent a shipping container?', answer: [p('Yes. If you’re searching for a great value, On-site Storage Solutions provides container rental services for portable shipping containers in various sizes to meet your storage needs.')] },
  { question: 'How much does it cost to rent a shipping container?', answer: [p('A shipping container rental typically costs between $95 and $175 a month. The price varies depending on the location, term of the rental, size of the container, and any other services or modifications needed.')] },
  { question: 'Where can I find a shipping container rental near me?', answer: [p('We have over 60+ locations across the country and provide quick delivery and low rates, so you can get all the storage you need in no time. Give us a call at ', PHONE, ' and we’ll take care of everything from there')] },
  {
    question: 'What size of shipping container should I rent?',
    answer: [
      p('Depending on your purpose for renting a shipping container, you must select the size of the container that best suits your needs. Whether you need extra area for :'),
      {
        ul: [
          ['Temporary storage space while remodeling your home. – A 20′ storage container provides close to 1,360 cubic feet of storage space – enough room to store the furniture and household items from a 3-to-4 bedroom house. If you need more room, our 40′ storage containers offer double the space; however, remember that items you load first will be difficult to reach since there’s only one set of double doors at one end. Check out our guide for help with deciding which size is best for you.'],
          ['Creating a temporary office space for your job site – Usually, a 20-foot container will suit your office space needs.'],
          ['Storing building supplies or heavy equipment -we recommend renting a 40ft container so you’ll be able to move about freely as you load and unload the container.'],
        ],
      },
      p('Cold storage needs – we recommend a ', { text: 'refrigerated container', href: ROUTES.REEFER }, ' which is typically available in a 40-foot size. You will very rarely get cost savings when renting a 20-foot refrigerated container because they are not commonly available.'),
    ],
  },
  { question: 'How do I rent a shipping container?', answer: [p('Our rental process is simple and affordable: just shop for a rental near you, select the container that works best for you, and pay the first month’s rent, last month’s rent, and delivery & pick-up fee in advance. Once your lease agreement is complete, we’ll coordinate delivery – just give us a call at ', PHONE, ' if you have any questions! Our experts are here to help.')] },
  { question: 'Should I buy or rent a shipping container?', answer: [p('Renting a shipping container is an affordable security option if you need it for temporary moving and storage. If you need long-term or permanent storage then purchasing is a better option. We also offer container financing to make purchasing easier and we also have consignment and buyback options.')] },
  { question: 'Is it better to rent vs rent-to-own?', answer: [p('When renting a container none of the payments work towards owning the container whereas you can own the container at the end of your rental term – and there’s no need for a credit check! Plus, we offer four easy-term options to choose from.')] },
  { question: 'Shipping Containers vs Pods?', answer: [p('Shipping containers are frequently compared to pods. The similarities are that they are both self-contained containers suitable for storage. Pods are generally smaller storage units, typically 10-foot boxes and they are not considered to be wind and watertight or rodent-proof. Most consumers use pods for short-term storage needs or for cross-country moves because they are easily transportable. Shipping containers are much larger. They are constructed of heavy-duty 14 gauge corrugated corten steel. They are wind and watertight and offer a better long-term storage solution because they can keep your items secure, dry, and free from pests.')] },
]
