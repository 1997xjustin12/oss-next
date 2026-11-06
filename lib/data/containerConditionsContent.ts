/**
 * Copy and media for /shipping-container-conditions, carried over from the
 * WordPress page it replaced (2026-11-06): its visible sections, in its order,
 * word for word. Edit here; the components only lay it out.
 *
 * Corrected from WordPress (2026-11-06): the rental card showed (888) 997-9085
 * while dialling (888) 977-9085; "extend its lifespan of the container",
 * "guaranteed not to leak condition" and "6, 12 18" read as typos.
 *
 * Still as WordPress has it, for the content owner: the intro's "click here"
 * links to this same page.
 */

import { ROUTES } from '@/config/routes'

const CDN = 'https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads'

export type ConditionsImage = { src: string; alt: string; width: number; height: number }

/** A run of text, or a link inside it. Paragraphs are lists of these, so their links stay inline. */
export type ConditionsSegment = string | { text: string; href: string }

/** Root-relative paths of pages that are still WordPress's (listed in the migration doc). */
export const CONDITIONS_LINKS = {
  forSale: '/shipping-containers-for-sale',
  oneTrip: '/new-one-trip-shipping-containers',
  used: '/used-shipping-containers-for-sale',
  refurbished: '/refurbished-shipping-container',
  iicl: '/iicl-container',
  wwt: '/wwt-containers-wind-and-watertight-shipping-containers',
  cargoWorthy: '/cargo-worthy-shipping-container',
  asIs: '/as-is-shipping-containers-for-sale',
  rental: '/shipping-container-rental',
} as const

export const CONDITIONS_HERO = {
  heading: 'SHIPPING CONTAINER',
  subheading: 'CONDITIONS, GRADES & SELECTION OPTIONS',
  background: { src: `${CDN}/2023/04/06161422/Conditions-Banner.png`, alt: '' },
} as const

export const CONDITIONS_INTRO: readonly (readonly ConditionsSegment[])[] = [
  [
    'When choosing to ',
    { text: 'buy a shipping container', href: CONDITIONS_LINKS.forSale },
    ', it’s important to understand the difference between container conditions and grades so that you can be sure you select the right container for your requirements.',
  ],
  [
    'We have three container conditions: Used, One Trip, and Refurbished. These conditions are further broken down into grading which gives an indication of the state and structural soundness of the container. The condition and grade of the container will directly influence the price. Plus, the distance of the ',
    { text: 'shipping container near your location', href: ROUTES.WHERE_TO_BUY },
    '.',
  ],
  ['For more detailed information about shipping container conditions and grades ', { text: 'click here', href: ROUTES.CONTAINER_CONDITIONS }, '.'],
]

export type ConditionsCard = {
  title: string
  href: string
  image: ConditionsImage
  paragraphs: readonly (readonly ConditionsSegment[])[]
  list?: readonly { label: string; body: string }[]
}

export const CONDITIONS_BAND = 'SHIPPING CONTAINER CONDITIONS'

export const CONDITIONS_CARDS: readonly ConditionsCard[] = [
  {
    title: 'New ONE TRIP',
    href: CONDITIONS_LINKS.oneTrip,
    image: { src: `${CDN}/2023/08/23063201/one-trip-shipping-containers-for-sale-1-e1708320972146.webp`, alt: 'One Trip Shipping Containers For Sale', width: 800, height: 635 },
    paragraphs: [
      [{ text: 'New One Trip', href: CONDITIONS_LINKS.oneTrip }, ' shipping containers may have minor dents, dings, and scrapes which are a result of regular shipping and handling during their long ocean journey.'],
      ['These new shipping containers are manufactured in Asia and then shipped to our various depots around the world. In order to reduce the cost of shipping and provide our customers with the best prices we load these new containers with cargo 1 time. This helps us offset the re-positioning costs and pass on the savings to our customers.'],
    ],
  },
  {
    title: 'USED',
    href: CONDITIONS_LINKS.used,
    image: { src: `${CDN}/2023/08/23063131/used-shipping-container-for-sale-e1708321204904.webp`, alt: 'Used Shipping Container For Sale', width: 800, height: 656 },
    paragraphs: [
      ['Our most popular container, used general purpose containers have been in heavy-duty shipping service for 5 to 15 years before being “retired.”'],
      ['Most used shipping containers will have the original paint and shipping line markings. The equipment will also show signs of wear and tear, such as surface rust, dents, and scratches.'],
      ['Used shipping containers might not look good on the outside and inside, but depending on their grade, they will be structurally sound and some may still be suitable for cargo transportation, storage solution, and more.'],
    ],
  },
  {
    title: 'REFURBISHED',
    href: CONDITIONS_LINKS.refurbished,
    image: { src: `${CDN}/2023/08/23063225/refurbished-shipping-containers.webp`, alt: 'Refurbished Shipping Containers', width: 800, height: 671 },
    paragraphs: [
      [
        { text: 'Refurbished containers', href: CONDITIONS_LINKS.refurbished },
        ' are used Wind and Water Tight (WWT) containers that have been prepped, primed, and repainted. Refurbishing gives a shipping container a new lease on life and can extend the lifespan of the container. We offer three levels of refurbishment on a Used Wind and Water Tight container:',
      ],
    ],
    list: [
      { label: 'Typical refurbishment', body: 'The exterior is repainted. The container exterior is prepped and painted. Prep includes wire wheeling to remove loose rust, spot priming exposed metal, and painting the exterior including the roof. Typically we paint over locking rods, gaskets, and decals.' },
      { label: 'Full refurbishment', body: 'Similar to Typical Refurbishment but includes painting the interior.' },
      { label: 'Factory refurbishment', body: 'This is a complete overhaul of the container with new interior and exterior paint, new gaskets, and new container markings.' },
    ],
  },
]

export const GRADES_BAND = 'SHIPPING CONTAINER GRADES'

export const GRADES_INTRO = 'Used shipping containers are inspected and graded according to age, structural soundness, exterior and interior condition, number of miles traveled, damage and repair history, as well as the weather conditions that it was stored and shipped. When looking for a container, you’ll find the following grades.'

export const GRADE_CARDS: readonly ConditionsCard[] = [
  {
    title: 'IICL (IICL-6)',
    href: CONDITIONS_LINKS.iicl,
    image: { src: `${CDN}/2023/08/18031118/iicl-shipping-container.webp`, alt: 'IICL Shipping Container', width: 980, height: 725 },
    paragraphs: [
      [
        'An ',
        { text: 'IICL container', href: CONDITIONS_LINKS.iicl },
        ' meets the stringent inspection requirements set by the ',
        { text: 'Institute of International Container Lessors (IICL)', href: 'https://www.iicl.org/about-the-industry/laws-regulations-conventions-and-standards/' },
        ' and is deemed suitable for export.',
      ],
      ['IICL containers will have a higher book value because of their excellent condition. Their external appearance will look much better than a WWT container.'],
    ],
  },
  {
    title: 'WIND AND WATER TIGHT',
    href: CONDITIONS_LINKS.wwt,
    image: { src: `${CDN}/2023/08/23063311/wind-and-water-tight-container-e1708321886646.webp`, alt: 'Wind and Water Tight Container', width: 800, height: 605 },
    paragraphs: [
      ['Our most popular grade, ', { text: 'Wind and Water Tight containers', href: CONDITIONS_LINKS.wwt }, ' are used shipping containers that are guaranteed not to leak.'],
      ['Although they won’t leak, you can expect WWT shipping containers to have original paint, surface rust, dents, and abrasions from heavy-duty shipping services. The external appearance might even be ugly for these containers.'],
    ],
  },
  {
    title: 'CARGO WORTHY (CW)',
    href: CONDITIONS_LINKS.cargoWorthy,
    image: { src: `${CDN}/2023/08/23062853/cargo-worthy-shipping-containers-e1708322031387.webp`, alt: 'Cargo Worthy Shipping Containers', width: 800, height: 562 },
    paragraphs: [
      [{ text: 'Cargo Worthy', href: CONDITIONS_LINKS.cargoWorthy }, ' shipping containers have been inspected and deemed to be structurally sound and safe for international transport by sea, rail, and road.'],
      ['Externally, it will have original paint (color may vary), old shipping markings, surface rust, abrasions, and dents. If you need a container for export, it will need to have a container survey and a valid CSC inspection sticker.'],
    ],
  },
  {
    title: 'AS IS',
    href: CONDITIONS_LINKS.asIs,
    image: { src: `${CDN}/2023/08/23063537/as-is-storage-cargo-containers-for-sale.webp`, alt: 'As Is Storage Cargo Container for sale', width: 800, height: 658 },
    paragraphs: [
      ['An ', { text: 'As Is container', href: CONDITIONS_LINKS.asIs }, ' is a shipping container that has been inspected and found to be damaged so severely that it will cost too much to repair to make it Wind and Watertight.'],
      ['There will be external and internal issues with the container such as holes, broken flooring, and other structural issues. Generally, we do not recommend that customers buy an As Is container unless it will be used for some purpose where structural soundness and exterior are not required.'],
    ],
  },
]

export const SELECTION_BAND = 'SHIPPING CONTAINER SELECTION'

export const SELECTION_INTRO = 'We have three selection options:'

export const SELECTION_OPTIONS: readonly { title: string; body: string; image: ConditionsImage }[] = [
  {
    title: 'FIRST OFF THE STACK',
    body: 'Shipping containers are stacked in depots. First Off The Stack refers to the container at the top or first off. When you choose this option, we cannot guarantee the color or the external appearance of the container. However, if you choose a WWT or CW container, it’s guaranteed not to leak.',
    image: { src: `${CDN}/2023/08/18035344/shipping-container-availability.webp`, alt: 'Shipping Container Availability', width: 561, height: 280 },
  },
  {
    title: 'EXCLUSIVE GROUP',
    body: 'Choose a container from an exclusive group we have handpicked and are guaranteed WWT. Know the color, grade, and external appearance of your shipping container before it arrives.',
    image: { src: `${CDN}/2023/08/18035633/shipping-container-group.webp`, alt: 'Shipping Container Group', width: 557, height: 279 },
  },
  {
    title: 'YOU PICK',
    body: 'These containers will have been surveyed and photographed at the depot. When you choose a “You Pick” container you will get the photographs and the inspection details so that you know what to expect.',
    image: { src: `${CDN}/2023/08/18040128/for-sale-shipping-container.webp`, alt: 'For Sale Shipping Container', width: 561, height: 280 },
  },
]

/** The three cards under the selection options. A phone number in a body is a link, as on WordPress. */
export const CONDITIONS_OPTIONS: readonly { title: string; href: string; before: string; phoneText?: string; after?: string }[] = [
  {
    title: 'BUY FROM US',
    href: CONDITIONS_LINKS.forSale,
    before: 'We offer a wide selection of containers for all your needs. From dry vans and refrigerated to specialized containers, we have the right option for you – no matter the size or purpose. Our purchasing power ensures that you’re always getting the best price available. So, whether you need it for long-distance transportation of cargo or need a container for storage, or another project, our selection is sure to have what you’re looking for!',
  },
  {
    title: 'RENTAL',
    href: CONDITIONS_LINKS.rental,
    before: 'On-Site Storage Solutions is a leader in providing rental shipping containers for temporary or long-term needs, at the lowest rates available. Rental rates start as low as $99 a month (some areas may require sales tax), just give us a call at',
    phoneText: '(888) 977-9085',
    after: ', and we’ll walk you through the container rental process.',
  },
  {
    title: 'RENT-TO-OWN',
    href: ROUTES.RENT_TO_OWN,
    before: 'On-Site Storage Solutions is proud to present a Rent-To-Own Option in partnership with My Container Rental. Call us at',
    phoneText: '(888) 977-9085',
    after: ' or select from our website the payment plans that suit you best – including 6, 12, 18, and 24 Months, as well as long-term programs.',
  },
]

export const CONDITIONS_FAQ_HEADING = 'FREQUENTLY ASKED QUESTIONS'

export const CONDITIONS_FAQS = [
  { question: 'What are the grades of shipping containers?', answer: 'Shipping containers have various conditions, including new, used, and refurbished. Each condition has different grades that cater to specific needs. The grades include IICL, Cargo Worthy (meets shipping standards), Wind and Watertight (secure for storage), and As-Is (functional but aged). These options provide choices based on purpose and budget.' },
  { question: 'How are used shipping containers graded?', answer: 'Used shipping containers are inspected and graded according to age, structural soundness, exterior and interior condition, number of miles traveled, damage and repair history, as well as the weather conditions that it was stored and shipped.' },
  { question: 'How long do shipping containers last?', answer: 'Shipping containers typically have a lifespan of approximately 25 years, but with careful maintenance and attention, their usability can be extended beyond this period. Regular inspections, rust prevention measures, and repairs all play a vital role in prolonging their durability and functionality.' },
  { question: 'How much are old shipping containers?', answer: 'The cost of old shipping container typically falls within the range of $1,350 to $3,000 and can be influenced by factors such as condition, age, size, and location. Additionally, the price may fluctuate based on any modifications made to the container.' },
  { question: 'How much is a new shipping container?', answer: 'A new shipping container typically costs around $2,850 to $7,800. However, it’s important to note that prices differ based on factors such as container size and location. Fluctuations in supply and demand also impact stock availability and costs.' },
  { question: 'What is WWT shipping container?', answer: 'A WWT shipping container, which stands for wind and watertight container, is a type of container that is guaranteed not to leak. It refers to containers that are devoid of any holes or cracks, ensuring effective protection against wind and water infiltration when used correctly. These containers offer reliability and are ideal for storage needs.' },
  { question: 'What is a cargo worthy container?', answer: 'A CW container, also recognized as a cargo-worthy container, is a shipping container that meets specific standards set by international organizations to ensure its structural integrity and appropriateness for the safe transportation of goods.' },
] as const

export const CONDITIONS_HELP = {
  before: 'If You Need Help In Choosing Your Container,',
  link: 'Give Us A Call (888)977-9085',
  after: '. Our Team Is Standing By.',
} as const

export const CONDITIONS_TESTIMONIALS_HEADING = 'We’ve Got A lot of Happy Customers'

export const CONDITIONS_NEWSLETTER_HEADING = 'SUBSCRIBE TO OUR NEWSLETTER TO RECEIVE THE LATEST NEWS AND EXCLUSIVE OFFERS'
