import { CONTACT_NUMBER, telHref } from '@/lib/helpers'
import { ROUTES } from '@/config/routes'
import { CDN, p, type LandingFaq } from './containerLandingContent'
import type { ProductVideo } from '@/config/productVideos'
import type { DepotFeaturedKey } from '@/services/search.service'

/**
 * /shipping-containers-for-sale, word for word from WordPress (visible
 * sections only; shared parts in containerLandingContent.ts).
 *
 * Left out, hidden on every device on WordPress: "Shipping Containers For Sale
 * Near Me — We Serve All 50 U.S. States And Canada" and its store-locator
 * shortcode. WordPress's per-device duplicates (mobile and desktop copies of
 * the same text) appear once.
 *
 * Kept for the content owner: "to find perfect match"; "Shipping are primarily
 * made from"; "minimum 550 FICA score" (FICO?); "12, 4, 36, and 48-month terms"
 * (24?); "for any reasons".
 */

/** Links to pages WordPress still serves (migration doc §12), and the native ones. */
export const FOR_SALE_LINKS = {
  quote: '/shipping-container-quote',
  dryVan: '/dry-van-shipping-container',
  specialty: '/specialty-shipping-containers',
  reefer: ROUTES.REEFER,
  rental: ROUTES.RENTAL,
  rentToOwn: ROUTES.RENT_TO_OWN,
} as const

export const FOR_SALE_HERO = {
  /** `[[…]]` is the yellow run. */
  heading: 'Get The [[Best Prices]] on Shipping Containers for Sale',
} as const

/** WordPress's row: three used WWT containers to buy. */
export const FOR_SALE_FEATURED_SPECS: readonly DepotFeaturedKey[] = ['used_20s_wwt', 'used_40s_wwt', 'used_40h_wwt']

export const FOR_SALE_INTRO = {
  heading: 'Buy Shipping Containers At The Best Price',
  body: 'We offer a wide range of shipping containers to meet your specific needs. Whether you’re looking for a container for storage, transportation, or a custom modification project, we have the right solution for you. Our containers are durable, reliable, and available in various types and condition to suit your budget.',
  image: { src: `${CDN}/2024/08/22051132/buy-container.webp`, alt: 'buy shipping container', width: 330, height: 171 },
} as const

export const FOR_SALE_STEPS = {
  heading: 'How to Buy Shipping Containers in 4 Easy Steps',
  steps: [
    { icon: 'search', title: 'Browse Our Inventory:', body: 'Explore our online catalog, where you can filter containers by size, condition, and features to find perfect match.' },
    { icon: 'quote', title: 'Request a Quote:', body: 'Use our simple online form to inquire about pricing. Provide details about the container you’re interested in, and we’ll get back to you with a competitive quote.' },
    { icon: 'consult', title: 'Consultation:', body: 'Our knowledgeable sales team is available to discuss your needs and help you finalize your purchase. We offer guidance on the best options for your specific use case.' },
    { icon: 'delivery', title: 'Delivery:', body: 'We provide reliable delivery services across the nation. Our logistics team ensures your container is delivered safely and on time to your specified location.' },
  ],
  image: { src: `${CDN}/2024/10/07052934/How-To-Buy.webp`, alt: 'How to buy shipping container', width: 448, height: 673 },
} as const

export const FOR_SALE_WHY = {
  heading: 'Why Buy from On-Site Storage?',
  points: [
    { title: 'Premium Quality:', body: 'Every Shipping container undergoes a strict inspection process to ensure it meets our high standards of quality and durability.' },
    { title: 'Wide Selection:', body: 'We offer new, used, and refurbished shipping containers in a variety of sizes, including 10ft, 20ft, and 40ft options.' },
    { title: 'Customization:', body: 'Our expert team can modify your container to fit your unique requirements, from adding windows and doors to full office conversions.' },
  ],
  cta: 'Get a FREE Quote',
  video: { id: 'Dblsoyhxar8', title: 'Why Buy from On-site Storage Solutions' } satisfies ProductVideo,
} as const

export const FOR_SALE_TYPES = {
  heading: 'Shipping Container Types',
  /** The intro, with its three links where WordPress has them. */
  intro: [
    'Shipping containers come in various types, with standard 20 and 40-foot ',
    { text: 'dry vans', href: FOR_SALE_LINKS.dryVan },
    ' being the most common. Made from steel or aluminum, they transport general cargo. ',
    { text: 'Reefer containers', href: FOR_SALE_LINKS.reefer },
    ' are insulated and temperature-controlled for sensitive goods like food and chemicals. ',
    { text: 'Specialty containers', href: FOR_SALE_LINKS.specialty },
    ', such as flatracks, open tops, and tank containers, provide unique features for different cargo needs.',
  ],
  cards: [
    { label: 'Dry Van Shipping Containers', href: FOR_SALE_LINKS.dryVan, image: { src: `${CDN}/2024/08/08113924/dry-van-image-66b4ae52c18db.webp`, alt: 'dry van shipping container', width: 530, height: 609 } },
    { label: 'Refrigerated/Reefer Containers', href: FOR_SALE_LINKS.reefer, image: { src: `${CDN}/2024/10/07053012/Reefer.webp`, alt: 'refrigerated shipping container', width: 367, height: 426 } },
    { label: 'Specialty Containers', href: FOR_SALE_LINKS.specialty, image: { src: `${CDN}/2024/10/07053303/Special.webp`, alt: 'Specialized Shipping Containers', width: 367, height: 426 } },
  ],
} as const

export const FOR_SALE_OPTIONS = {
  heading: 'We Also Have Shipping Container Rental And Financing Options',
  intro: 'Optimize your storage needs with our easy financing options and enjoy the convenience and cost savings owning your storage container.',
  rental: {
    heading: 'Rent A Shipping Container',
    lead: 'Seeking an affordable and convenient storage solution? Rent a shipping container',
    body: [
      'You can access the storage options you need, precisely when and where you need them. From Dry Van Containers to Refrigerated Containers, we have a wide selection. With over 60 locations across the US and Canada, we provide convenient access to our services, ensuring that no matter where you are, you can benefit from our expertise and quality offerings. Call us today at ',
      { text: CONTACT_NUMBER, href: telHref(CONTACT_NUMBER) },
      ' to learn more about our rental terms and conditions.',
    ],
    cta: 'Rent a Container',
    image: { src: `${CDN}/2024/09/12095608/shipping-container-rental-66e2baa616062.webp`, alt: 'shipping container for rent', width: 541, height: 362 },
  },
  lease: {
    heading: 'Lease-To-Purchase',
    paragraphs: [
      ['Now you can own the shipping container you need with our lease-to-purchase programs!'],
      ['We offer two programs to meet your needs:'],
      ['The ', { strong: 'TimePayment' }, ' financing options offers the best terms for those with a minimum 550 FICA score. Qualified applicants can easily purchase their chosen storage container with affordable monthly payments, enjoying the benefits of ownership. This plan is often more cost-effective than renting an off-site storage unit, providing a budget-friendly storage solution for everyone.'],
      ['No credit card check? No Problem! Our second financing option is open to all, with flexible 12, 4, 36, and 48-month terms. For more information on how to secure your storage solution, please call us today.'],
    ],
    cta: 'Lease-To-Purchase A Container',
    image: { src: `${CDN}/2024/09/12100436/shipping-container-rent-to-own-66e2bc2d01f93.webp`, alt: 'shipping container rent to own', width: 557, height: 365 },
  },
} as const

export const FOR_SALE_GUARANTEE = {
  heading: 'Customer Satisfaction & Money Back Guarantee',
  body: 'We are proud to be one of the top container companies in America. Each of our containers is carefully checked before shipping to ensure our customers receive only high quality products. We also guarantee satisfaction with every order — if you’re not happy for any reasons, we’ll give you back full refund minus delivery and pick-up fees. Get affordable and secure storage solutions today!',
} as const

export const FOR_SALE_FAQS: readonly LandingFaq[] = [
  { question: 'What is a shipping container?', answer: [p('A shipping container is a standardized metal box used to transport goods internationally. It comes in various sizes, typically 20 or 40 feet long, and is designed to be easily loaded onto ships, trucks, and trains. Containers revolutionized global trade by simplifying handling and logistics, ensuring goods’ safety and enabling efficient intermodal transportation.')] },
  { question: 'What is cost of shipping container?', answer: [p('On average, used shipping containers can range from $1,200 to $8,000, while new or one-trip containers can cost between $2,850 and $7,800. Prices may also be influenced by additional features and specific requirements.')] },
  { question: 'What is a conex box?', answer: [p('Conex box also known as a shipping container, is a metal container designed to transport goods overseas. These boxes are made of steel and come in various sizes, with the most common being 20 or 40 feet in length.')] },
  { question: 'What material are shipping containers made from?', answer: [p('Shipping are primarily made from a special type of steel called corten steel or weathering steel. Corten steel is known for its durability and resistance to corrosion, making it suitable for withstanding harsh weather conditions during shipping and storage')] },
  { question: 'What is the size of a shipping container?', answer: [p('Shipping containers are available in various sizes, with the most common being 20 feet and 40 feet long. The width and height of a standard container are around 8 feet and 8 feet 6 inches, respectively. High cube containers have an added foot of height, measuring approximately 9 feet 6 inches tall.')] },
  { question: 'What is the floor of a shipping container made of?', answer: [p('The floor of a shipping container is commonly a 1-1/8 inch thick marine plywood. This particular type of plywood is specially designed to withstand the harsh conditions of marine environments, ensuring durability and strength. However, it is worth noting that certain containers may feature alternative flooring materials like bamboo, vinyl, or even steel.')] },
]
