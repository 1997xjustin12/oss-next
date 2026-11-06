/**
 * Copy and media for /types-of-shipping-containers, carried over from the
 * WordPress page it replaced (2026-11-06): its visible sections, in its order,
 * word for word. Edit here; the components only lay it out.
 *
 * Kept as WordPress has it, though it looks wrong: the rental card shows
 * (888) 997-9085 but dials (888) 977-9085, and the reefer FAQ answer gives
 * "-15°F to -60°F" where the reefer copy elsewhere says -15°F to 60°F. One
 * reason WordPress split over two bullets ("Huge inventory of New, Used and" /
 * "Refurbished Containers") is shown as the one bullet it reads as.
 *
 * WordPress's row of four product cards is replaced by the shared featured
 * cards (FeaturedContainerCards), as the migration doc asks.
 */

import { ROUTES } from '@/config/routes'

const CDN = 'https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads'

export type ContainerTypesImage = { src: string; alt: string; width: number; height: number }

export type ContainerTypeItem = { title: string; href: string; body: string; image: ContainerTypesImage }

export type ContainerTypeCategory = ContainerTypeItem & { id: string; items: readonly ContainerTypeItem[] }

/** Root-relative paths of pages that are still WordPress's (listed in the migration doc). */
export const CONTAINER_TYPES_LINKS = {
  dryVan: '/dry-van-shipping-container',
  dryVanSingleDoor: '/dry-van-shipping-container-single-door',
  dryVanDoubleDoor: '/dry-van-double-door-shipping-container',
  highCube: '/high-cube-shipping-containers',
  specialty: '/specialty-shipping-containers',
  flatRack: '/flat-rack-container',
  openSide: '/open-side-container',
  openTop: '/open-top-container',
  duoCon: '/duo-con-shipping-containers',
  tank: '/shipping-container-tanks-for-sale',
  chassis: '/shipping-container-chassis',
  buy: '/shipping-containers-for-sale',
  rental: '/shipping-container-rental',
  reviews: '/review-of-shipping-containers',
} as const

export const CONTAINER_TYPES_HERO = {
  heading: { first: 'DIFFERENT TYPES OF', second: 'SHIPPING CONTAINERS' },
  background: { src: `${CDN}/2023/04/06154330/Types-Banner.png`, alt: '' },
} as const

export const CONTAINER_TYPES_INTRO = {
  before: 'Shipping containers which were invented by Malcom McLean in 1956 have revolutionized the global shipping industry. The standardization of container sizes by the',
  isoLabel: 'International Standards Organization (ISO)',
  isoHref: 'https://www.iso.org/home.html',
  after: ' in 1968 further accelerated their role as the primary means of dry freight shipping by enabling ships, chassis, and handling equipment to be designed to accommodate all containers. This interchangeability drastically reduced shipping times and costs. And according to the Economist magazine, “the shipping container has been more of a driver of globalization than all trade agreements in the past 50 years together.”',
  image: { src: `${CDN}/2023/08/17055329/who-invented-the-shipping-container.webp`, alt: 'Who Invented The Shipping Container', width: 800, height: 455 },
  closing: 'Today there are many types of standard shipping containers but the original 20’ shipping container and the 40’ shipping container still remain the most used container types. In fact, global shipping by sea accounts for more than 80% of all traded goods, and most of this is moved in shipping containers. Find out more about each type of container so that you can choose the best container type for your requirements.',
} as const

export const CONTAINER_TYPES_BAND = 'SHIPPING CONTAINER TYPES'

export const CONTAINER_TYPE_CATEGORIES: readonly ContainerTypeCategory[] = [
  {
    id: 'dry-van',
    title: 'DRY VAN CONTAINERS',
    href: CONTAINER_TYPES_LINKS.dryVan,
    body: 'The most common shipping containers you see on ships, in ports, or being carried by trucks are known as dry van shipping containers. They come in different lengths and heights and they may have different door options such as double doors at one end, double doors at both ends, and open side containers with doors on the side.',
    image: { src: `${CDN}/2023/08/17055907/container-dry-van.webp`, alt: 'Container Dry Van', width: 799, height: 698 },
    items: [
      {
        title: 'DRY VAN SHIPPING CONTAINER WITH ONE SET OF DOUBLE DOORS ON ONE END',
        href: CONTAINER_TYPES_LINKS.dryVanSingleDoor,
        body: 'This is the standard shipping container with one set of double doors that seal shut. These containers are the most commonly used shipping container for transporting goods by sea, land, or rail. They also make great storage containers.',
        image: { src: `${CDN}/2023/08/17060447/dry-van-container.webp`, alt: 'Dry Van Container', width: 535, height: 357 },
      },
      {
        title: 'DRY VAN SHIPPING CONTAINER WITH DOORS ON BOTH ENDS / TUNNEL CONTAINER',
        href: CONTAINER_TYPES_LINKS.dryVanDoubleDoor,
        body: 'A dry van shipping container with double doors on both ends is like a standard shipping container except for having double doors on both ends. This makes it extremely useful for the quick loading and unloading of contents because one can enter on one side and exit on the other. It is also known as a tunnel container.',
        image: { src: `${CDN}/2023/08/17060648/shipping-container-tunnel.webp`, alt: 'Shipping Container Tunnel', width: 532, height: 379 },
      },
      {
        title: 'DRY VAN SHIPPING CONTAINER - HIGH CUBES',
        href: CONTAINER_TYPES_LINKS.highCube,
        body: 'Most standard dry van shipping containers can also be High cubes. A High cube shipping container is 1 foot higher ( 9 feet 6 inches high) higher than a standard dry van (8 feet 6 inches). The extra foot higher provides more vertical space and also makes the container feel less “boxy.” This makes it ideal for modifications and builds.',
        image: { src: `${CDN}/2023/08/17060828/dry-van-high-cube-container.webp`, alt: 'Dry van high cube Container', width: 534, height: 395 },
      },
    ],
  },
  {
    id: 'refrigerated',
    title: 'REFRIGERATED CONTAINERS',
    href: ROUTES.REEFER,
    body: 'Refrigerated ISO shipping containers, also known as Reefers, are insulated shipping containers that are used to transport temperature-sensitive cargo. The refrigeration equipment is part of the bulkhead wall and comes with controls allowing you to manage the interior temperature.',
    image: { src: `${CDN}/2023/08/17061117/buy-refrigerated-shipping-container.webp`, alt: 'Buy Refrigerated Shipping Container', width: 800, height: 613 },
    items: [
      {
        title: 'WORKING REFRIGERATED SHIPPING CONTAINER',
        href: ROUTES.REEFER,
        body: 'Working refrigerated shipping containers are insulated containers used to transport products that are already chilled, frozen, or deep-frozen and need to be maintained at a constant temperature between -15°F to 60°F. They can be installed on-premise as extra cold storage or kept on a chassis for easy transport.',
        image: { src: `${CDN}/2023/08/17061742/insulated-shipping-container.webp`, alt: 'Insulated Shipping Container', width: 748, height: 514 },
      },
      {
        title: 'INSULATED NON-WORKING REFRIGERATED SHIPPING CONTAINER',
        // The reefer page's non-working section; WordPress linked #non-working-refrigerated.
        href: `${ROUTES.REEFER}#reefer-non-working`,
        body: 'Insulated non-working refrigerated shipping containers are refrigerated containers that no longer have a working refrigeration unit. They usually have one set of double doors on the end. Non-working refrigerated shipping containers are also known as insulated containers or non-operating reefer containers (NOR).',
        image: { src: `${CDN}/2023/08/17062041/shipping-container-insulated.webp`, alt: 'Insulated Shipping Container', width: 765, height: 506 },
      },
    ],
  },
  {
    id: 'specialty',
    title: 'SPECIALTY SHIPPING CONTAINERS',
    href: CONTAINER_TYPES_LINKS.specialty,
    body: 'Specialty shipping containers are containers that have been adapted to transport unusual cargo that won’t fit inside the typical big metal shipping containers. From transporting oversized machinery to liquids, there’s a special-purpose container for every need.',
    image: { src: `${CDN}/2023/08/17062350/specialty-storage-containers.webp`, alt: 'Specialty Storage Containers', width: 799, height: 733 },
    items: [
      {
        title: 'FLAT RACK CONTAINERS',
        href: CONTAINER_TYPES_LINKS.flatRack,
        body: 'Flat Rack shipping containers (collapsible and non-collapsible) are special containers that are used to transport bulky or heavy loads of cargo. They usually only have a wall at the front and the back of the container but are also available without walls.',
        image: { src: `${CDN}/2023/08/17063229/flat-rack-shipping-containers.webp`, alt: 'flat rack shipping containers', width: 540, height: 408 },
      },
      {
        title: 'OPEN-SIDE SHIPPING CONTAINER',
        href: CONTAINER_TYPES_LINKS.openSide,
        body: 'An open side shipping container with double doors on one end is like the fully-enclosed standard metal shipping containers except that one of its sides has bi-fold doors instead of a wall. The additional bi-fold doors can be opened on one side or completely opened and removed. It’s also known as a side access container, full-side access container, or a side-opening storage container.',
        image: { src: `${CDN}/2023/08/17063400/side-opening-shipping-container.webp`, alt: 'Side Opening Shipping Container', width: 541, height: 371 },
      },
      {
        title: 'OPEN TOP SHIPPING CONTAINER',
        href: CONTAINER_TYPES_LINKS.openTop,
        body: 'An open-top shipping container is like a standard container except that it has no metal roof. Instead, it has a weatherproof tarpaulin roof and removable roof bows. These shipping containers are helpful for the easy loading and unloading of bulky or tall cargo that’s usually lifted on a crane. They have a greater capacity than standard dry vans because of the removable roof.',
        image: { src: `${CDN}/2023/08/17063553/open-top-shipping-containers.webp`, alt: 'Open Top Shipping Containers', width: 562, height: 403 },
      },
      {
        title: 'DUO-CON SHIPPING CONTAINERS',
        href: CONTAINER_TYPES_LINKS.duoCon,
        body: 'Duo-Con shipping containers are specially constructed 20-foot containers that are designed to be cut in half into two 10-foot containers. Once the Duo-Con arrives, it is cut in half along the special panel to form the two 10-foot containers. Duo-Cons are supplied with the front walls which need to be welded onto the containers to form the metal box so that it’s a standard 10-foot shipping container.',
        image: { src: `${CDN}/2023/08/17063721/duo-con-container.webp`, alt: 'Duo Con Container', width: 538, height: 375 },
      },
      {
        title: 'TANK SHIPPING CONTAINER',
        href: CONTAINER_TYPES_LINKS.tank,
        body: 'Tank containers, also called intermodal ISO tanks, are special stainless steel shipping containers that are used for the transportation of liquids materials, gas, and powders. They can also be used for hazardous and non-hazardous products and even anti-corrosive materials. The tank is usually fitted into an ISO frame that is manufactured according to internationally recognized standards.',
        image: { src: `${CDN}/2023/08/17063947/shipping-container-tanks-for-sale.webp`, alt: 'Shipping Container Tanks For Sale', width: 582, height: 415 },
      },
      {
        title: 'SHIPPING CONTAINER CHASSIS',
        href: CONTAINER_TYPES_LINKS.chassis,
        body: 'Shipping container chassis are special trailers that are designed to transport shipping containers. The most common chassis transport 20, 40, 45-foot, and 53-foot High Cube containers.',
        image: { src: `${CDN}/2023/08/17064117/shipping-container-chassis-for-sale.webp`, alt: 'Shipping Container Chassis For Sale', width: 549, height: 394 },
      },
    ],
  },
]

export const CONTAINER_TYPES_OPTIONS = [
  {
    title: 'BUY FROM US',
    href: CONTAINER_TYPES_LINKS.buy,
    image: `${CDN}/2023/04/06154122/Buy-From-Us-Image.png`,
    before: 'We offer a wide selection of containers for all your needs. From dry vans and refrigerated to specialized containers, we have the right option for you – no matter the size or purpose. Our purchasing power ensures that you’re always getting the best price available. So, whether you need it for long-distance transportation of cargo or need a container for storage, or another project, our selection is sure to have what you’re looking for!',
  },
  {
    title: 'RENTAL',
    href: CONTAINER_TYPES_LINKS.rental,
    image: `${CDN}/2023/04/06154246/Rental-Image.png`,
    before: 'On-Site Storage Solutions is a leader in providing rental shipping containers for temporary or long-term needs, at the lowest rates available. Rental rates start as low as $99 a month (some areas may require sales tax), just give us a call at',
    phoneText: '(888) 997-9085',
    after: ', and we’ll walk you through the container rental process.',
  },
  {
    title: 'RENT-TO-OWN',
    href: ROUTES.RENT_TO_OWN,
    image: `${CDN}/2023/04/06154254/RTO-Image.png`,
    before: 'On-Site Storage Solutions is proud to present a Rent-To-Own Option in partnership with My Container Rental. Call us at',
    phoneText: '(888) 977-9085',
    after: ' or select from our website the payment plans that suit you best – including 6, 12 18, and 24 Months, as well as long-term programs.',
  },
] as const satisfies readonly { title: string; href: string; image: string; before: string; phoneText?: string; after?: string }[]

export const CONTAINER_TYPES_WHY_BAND = 'WHY CHOOSE ON-SITE STORAGE SOLUTIONS'

export const CONTAINER_TYPES_REASONS = {
  heading: 'Top Reasons to Purchase a Container From Us:',
  items: [
    'Over 20 Years in Business',
    'We provide the best prices around.',
    'We have locations near you',
    '100% Satisfaction Guarantee',
    'All WWT Containers are Guaranteed NO LEAKS',
    'Huge inventory of New, Used and Refurbished Containers',
    'Quality that you can trust',
    'Industry’s best customer service',
    'Full Door-to-Door Delivery',
    'We provide Custom Modifications',
    'Provides huge discounts for wholesale orders',
  ],
  image: { src: `${CDN}/2023/08/25074719/shipping-container.webp`, alt: 'Shipping Container', width: 800, height: 736 },
} as const

export const CONTAINER_TYPES_FAQ_HEADING = 'FREQUENTLY ASKED QUESTIONS'

export const CONTAINER_TYPES_FAQS = [
  {
    question: 'What are the different types of shipping container?',
    answer: 'The different types of shipping containers include standard dry van containers, high cube containers, refrigerated containers (reefers), open-top containers, flat rack containers, and ISO tank containers. These containers are designed to meet specific shipping needs, such as transporting dry goods, oversized cargo, perishable items, or liquids.',
  },
  {
    question: 'What is a dry van container?',
    answer: 'A dry van container is a popular type of shipping container made of steel or aluminum. It’s a fully enclosed rectangular box for transporting or storing dry goods. No temperature control or ventilation systems are present, making it ideal for non-perishable items like electronics, clothing, and furniture. Sizes range from 20 to 40 feet in length.',
  },
  {
    question: 'What is a reefer container?',
    answer: 'A reefer container is a specialized shipping container with an integrated cooling system. It transports perishable goods that need temperature control during transit. The temperature inside can be adjusted for items like fresh produce, frozen food, pharmaceuticals, and chemicals. Reefer containers are available in different sizes and can maintain temperatures from (-15°F to -60°F), depending on the model.',
  },
  {
    question: 'What is an open top container?',
    answer: 'An open-top shipping container has no metal roof, but instead features a weatherproof tarpaulin roof and removable roof bows. They are useful for loading and unloading tall or bulky cargo lifted by a crane. With their removable roof, they offer greater capacity than standard dry vans, making them suitable for oversized items.',
  },
  {
    question: 'What is an ISO Tank container?',
    answer: 'Tank containers, also called intermodal ISO tanks, are special stainless steel shipping containers that are used for the transportation of liquids materials, gas, and powders. They can also be used for hazardous and non-hazardous products and even anti-corrosive materials. The tank is usually fitted into an ISO frame that is manufactured according to internationally recognized standards.',
  },
] as const

export const CONTAINER_TYPES_TESTIMONIALS_HEADING = 'We’ve Got A lot of Happy Customers'

export const CONTAINER_TYPES_NEWSLETTER_HEADING = 'SUBSCRIBE TO OUR NEWSLETTER TO RECEIVE THE LATEST NEWS AND EXCLUSIVE OFFERS'
