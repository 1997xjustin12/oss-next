/**
 * Copy and media for /why-onsite-storage, carried over from the WordPress page
 * it replaced (2026-11-06): its visible sections, in its order, word for word.
 * Edit here; the components only lay it out.
 *
 * Corrected from WordPress (2026-11-06): "Experienced Staff" ended its last
 * sentence with "guarantee it!", a word missing.
 *
 * Not carried over: the "Container FAQs" section, which WordPress hides on
 * every device. See docs/reference/wordpress-to-next-pages.md.
 */

import { ROUTES } from '@/config/routes'

const CDN = 'https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads'

export type WhyImage = { src: string; alt: string; width: number; height: number }

/** A link inside a sentence. */
export type WhyLink = { text: string; href: string }

/** A sentence with links in it: plain strings and links, in order. */
export type WhyRich = readonly (string | WhyLink)[]

/** Root-relative paths of pages that are still WordPress's (listed in the migration doc). */
export const WHY_LINKS = {
  buy: '/shipping-containers-for-sale',
  rent: '/shipping-container-rental',
  moneyBack: '/money-back-guarantee',
  reviews: '/review-of-shipping-containers',
  quote: '/shipping-container-quote',
  wwt: '/wwt-containers-wind-and-watertight-shipping-containers',
  delivery: '/complete-shipping-container-delivery-guide',
} as const

export const WHY_HERO = {
  heading: 'Best Shipping Container Company',
  subheading: 'On-Site Storage SOLUTIONS',
  tagline: "We are one of the World's Largest Container Wholesalers",
  background: { src: `${CDN}/2023/04/20121307/Banner.png`, alt: '' },
} as const

export const WHY_INTRO = {
  paragraphs: [
    ['We have been selling and renting high-quality new and used shipping containers throughout America and Canada since 2002. As an industry leader, we buy thousands of containers from major shipping and container leasing companies.'],
    ['Our volume purchasing enables us to negotiate the best container prices which allows us to offer the best price guarantee to our customers.'],
    [
      { text: 'Buy', href: WHY_LINKS.buy },
      ' or ',
      { text: 'rent', href: WHY_LINKS.rent },
      ' your next container with confidence from On-Site Storage Solutions knowing we have the experience to deliver the shipping container you want, at a price you can afford. We take care of problems our competitors are not even aware of and things that you will never need to lose sleep about.',
    ],
  ] satisfies readonly WhyRich[],
  image: { src: `${CDN}/2023/08/18050108/buy-shipping-container.webp`, alt: 'Buy Shipping Container', width: 666, height: 722 },
} as const

export const WHY_REASONS_BAND = 'Here are the reasons why you’ll not be disappointed:'

export const WHY_STAFF = {
  heading: 'Experienced Staff',
  body: 'On-Site Storage Solutions was founded in 2002. Our experienced senior staff many of whom started with the company have over 75 years of combined industry experience. This experience and commitment to customer service have enabled the company to grow into a leader in the industry. You can rest assured that when working with On-Site Storage Solutions you will have a superior customer experience. We take care of all aspects related to ordering containers, from helping you choose the right type and condition to ensuring successful delivery. Our goal is to make your container-buying or renting experience simple and stress-free. We guarantee it!',
} as const

export const WHY_SATISFACTION = {
  heading: { text: 'Satisfaction Guaranteed', href: WHY_LINKS.moneyBack },
  body: 'Our satisfaction guarantee makes buying or renting a container easy and worry-free. Call to order from our friendly experienced sales associates or just order online using our website. Our website is a great place to start learning more about container prices, types, conditions, and grades. Order today you will be glad you did.',
  cta: { text: 'CHECK OUT OUR REVIEWS', href: WHY_LINKS.reviews },
  images: [
    { src: `${CDN}/2023/08/18050249/best-storage-container.webp`, alt: 'Best Storage Container', width: 371, height: 503 },
    { src: `${CDN}/2023/08/18050432/shipping-container-reviews.webp`, alt: 'Shipping Container Reviews', width: 381, height: 520 },
  ] satisfies readonly WhyImage[],
} as const

export const WHY_NEAR_ME = {
  heading: { text: 'Shipping Containers Near Me? Yes!', href: ROUTES.WHERE_TO_BUY },
  lead: 'With 60+ Depot Locations to serve you.',
  body: 'With 60+ locations in US and Canada, we are able to service most customers. This expansive network means that you can get a quality shipping container delivered straight to your door – quickly and at the lowest possible delivery rate. Our nationwide coverage allows us to provide 3-7 days of service in many areas, meaning quicker delivery times and lower delivery costs. Long distance is also available if required so no matter where you are located we can help.',
  image: { src: `${CDN}/2023/08/16063506/shipping-container-location.webp`, alt: 'Shipping Container Location', width: 800, height: 833 },
} as const

export const WHY_PRICES = {
  heading: 'Best Prices In The Industry',
  body: 'With our Best Price Guarantee, we strive to provide the best prices. If you find a cheaper price elsewhere please give us a chance to earn your business by calling us and giving us the chance to beat that price. When shopping for the best price on shipping containers be sure to visit our unbeatable container specials.',
  moneyBackHeading: 'Money Back Guarantee',
  moneyBack: [
    'We offer a ',
    { text: 'Money Back Guarantee', href: WHY_LINKS.moneyBack },
    '. If you order a container and it arrives and it doesn’t meet your needs you can return the container and we will issue a full refund (minus the shipping costs).',
  ] satisfies WhyRich,
  image: { src: `${CDN}/2023/08/18050658/shipping-container-best-price-guaranteed-300x199.webp`, alt: 'Shipping Container Best Price Guaranteed', width: 300, height: 199 },
} as const

export const WHY_QUOTE_CTA = { text: 'GET A FREE QUOTE NOW', href: WHY_LINKS.quote } as const

export const WHY_QUALITY = {
  heading: 'Quality You Can Trust',
  body: 'When it comes to shipping containers, you can trust that we stand behind what we sell. All of our equipment is inspected so you know in advance the condition and grade of the container you ordered so there are no delivery surprises. If you have any questions our expert salespeople are here to help make the order process easy so you feel confident in your purchase.',
  images: [
    { src: `${CDN}/2023/08/18051158/shipping-container-quality.webp`, alt: 'Shipping Container Quality', width: 607, height: 455 },
    { src: `${CDN}/2023/08/18051228/quality-shipping-containers.webp`, alt: 'Quality Shipping Containers', width: 361, height: 455 },
    { src: `${CDN}/2023/08/18051258/quality-shipping-container.webp`, alt: 'Quality Shipping Container', width: 357, height: 455 },
    { src: `${CDN}/2023/08/18051323/insulated-high-quality-shipping-containers.webp`, alt: 'Insulated High quality shipping containers', width: 339, height: 455 },
  ] satisfies readonly WhyImage[],
} as const

export const WHY_SERVICE = {
  heading: 'Experience The Best Customer Service',
  body: 'On-Site Storage Solutions prides itself on providing the best customer service in the industry. When you order a container from us you can count on our friendly and knowledgeable staff to guide you through the whole process.',
} as const

export const WHY_MODIFICATION = {
  heading: 'We Also Offer Container Modification',
  body: 'If you need custom container modifications our expert fabricators have the experience to create whatever you need. We will do everything in our power to ensure that you have a great experience with us – no matter how many containers you order.',
} as const

export const WHY_TOP_REASONS = {
  heading: 'Top Reasons to Purchase a Container From Us:',
  items: [
    ['Over 20 Years in Business'],
    ['We provide the best prices around.'],
    ['We have ', { text: 'locations near you', href: ROUTES.WHERE_TO_BUY }],
    ['100% Satisfaction Guarantee'],
    ['All WWT Containers are ', { text: 'Guaranteed NO LEAKS', href: WHY_LINKS.wwt }],
    ['Huge inventory of New, Used and Refurbished Containers'],
    ['Quality that you can trust'],
    ['Industry’s best customer service'],
    ['Full ', { text: 'Door-to-Door Delivery', href: WHY_LINKS.delivery }],
    ['We provide Custom Modifications'],
    ['Provides huge discounts for wholesale orders'],
  ] satisfies readonly WhyRich[],
  image: { src: `${CDN}/2023/08/25074719/shipping-container.webp`, alt: 'Shipping Container', width: 800, height: 736 },
} as const

export const WHY_FAQ_HEADING = 'FREQUENTLY ASKED QUESTIONS'

export const WHY_FAQS = [
  {
    question: 'Where is the best place to buy a shipping container?',
    answer: 'On-Site Storage Solutions has over 60 depot locations around the United States and Canada. We provide high-quality and affordable shipping containers that can be delivered to your door quickly and at a low pricing delivery rate.',
  },
  {
    question: 'Is On-Site Storage Solutions legit?',
    answer: 'On-Site Storage Solutions is a legitimate company with over two decades of industry experience. We offer containers at highly competitive rates from 60+ locations across the US and Canada. We provide customers with a 100% Satisfaction Guarantee and maintain an extensive inventory of both new and used containers, renowned for their trusted quality.',
  },
  {
    question: 'Where is On-Site Storage Solutions located?',
    answer: 'On-Site Storage Solutions is conveniently located at 21050 Union St Suite 4, Wildomar, CA 92595, United States. Whether you’re in need of containers, storage services, or expert assistance with your storage needs, you can find us at this accessible location.',
  },
] as const

export const WHY_TESTIMONIALS_HEADING = 'We’ve Got A lot of Happy Customers'

export const WHY_NEWSLETTER_HEADING = 'SUBSCRIBE TO OUR NEWSLETTER TO RECEIVE THE LATEST NEWS AND EXCLUSIVE OFFERS'
