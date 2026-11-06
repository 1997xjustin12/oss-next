/**
 * Copy and media for /special-promotions, carried over from the WordPress page
 * it replaced (2026-11-06): its visible sections, in its order, word for word.
 * Edit here; the components only lay it out.
 *
 * Corrected from WordPress (2026-11-06): "GIVEWAYS" (for "giveaways"); the
 * rentals paragraph showed and dialled (888) 997-9085, and the terms showed
 * (888) 977-9085 but dialled 997: both are the sales line, (888) 977-9085.
 *
 * Still as WordPress has it (content owner to decide):
 * - the first giveaway names no item, only "$89.99 $75.00 17% Discount";
 * - "131.82/month" on the New 20 ft card lacks its "$" (the featured cards are
 *   now the shared ones, so that text is no longer shown);
 * - "Huge inventory of New, Used and" / "Refurbished Containers" is one reason
 *   split over two bullets;
 * - the 40 ft and 45 ft high cube tiles reuse the 10 ft and 20 ft photos.
 *
 * Not carried over: the "SHIPPING CONTAINERS" section, hidden on every device.
 */

const CDN = 'https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads'

export type PromoImage = { src: string; alt: string }
export type PromoLinkCard = { title: string; href: string; image: PromoImage }

/** Root-relative paths of pages that are still WordPress's (listed in the migration doc). */
export const PROMO_LINKS = {
  rental: '/shipping-container-rental',
  dryVan: '/dry-van-shipping-container',
  dryVanSingle: '/dry-van-shipping-container-single-door',
  dryVanDouble: '/dry-van-double-door-shipping-container',
  standard: '/standard-shipping-containers',
  highCube: '/high-cube-shipping-containers',
  specialty: '/specialty-shipping-containers',
  resources: '/shipping-containers-blogs',
  buy: '/shipping-containers-for-sale',
  moneyBack: '/money-back-guarantee',
} as const

/** The phone number the copy shows: the sales line. */
export const PROMO_PHONES = {
  main: '(888) 977-9085',
} as const

export const PROMO_HEADING = 'STORAGE CONTAINERS ON SALE'

export type Giveaway = { was?: string; amount: string; note: string; tone: 'red' | 'white' }

export const PROMO_GIVEAWAYS = {
  heading: 'EXCLUSIVE GIVEAWAYS - LIMITED TIME OFFER!',
  items: [
    { was: '$89.99', amount: '$75.00', note: '17% Discount', tone: 'red' },
    { amount: '$100 OFF', note: 'Container Upgrade. Upgrade from a Wind and Water Tight Container to Cargo worthy for $100', tone: 'white' },
    { amount: '50% OFF', note: 'Interior Led Light Kit with Switch', tone: 'red' },
    { amount: '$100 OFF', note: 'Exterior Paint Job', tone: 'white' },
  ] satisfies readonly Giveaway[],
  call: 'Call for more details (888)977-9085',
} as const

export const PROMO_RENTAL_DEALS = {
  images: [
    { src: `${CDN}/2023/08/18053906/sale-storage-containers.webp`, alt: 'Sale Storage Containers', width: 352, height: 507 },
    { src: `${CDN}/2023/08/18054017/storage-containers-sale.webp`, alt: 'Storage Containers Sale', width: 348, height: 507 },
    { src: `${CDN}/2023/08/18054230/refrigerated-storage-containers-for-sale.webp`, alt: 'Refrigerated Storage Containers For Sale', width: 348, height: 507 },
  ],
  /** Each deal: the bold part, then the rest of the line. */
  deals: [
    { strong: 'Free First Month', rest: ' – w/ 1 year rental' },
    { strong: '$50 off delivery', rest: ' w/ 6 months plus rental • Free Rental Upgrade' },
    { strong: 'Rent-To-Own for as low as $99 a month.', rest: ' No Sales Tax' },
  ],
  question: 'Want to Learn more?',
  cta: 'CLICK HERE',
} as const

export const PROMO_INTRO = [
  'There are many different types of shipping containers. Standard 20 and 40-foot containers, known as dry vans, are the most commonly used. They can be made from steel or aluminum and are designed to transport general cargo that does not require specialized handling.',
  'Reefer or refrigerated containers are insulated and feature temperature control systems. These containers are perfect for transporting and storing temperature-sensitive goods, such as food and chemicals. Specialty containers include flat racks, open-top containers, tank containers, and many more. These offer unique features and benefits that accommodate different types of cargo, such as extra height or insulation.',
] as const

export const PROMO_DRY_VAN = {
  heading: 'Dry Van',
  doorsHeading: 'Dry Van Container Door Configurations:',
  doors: [
    { title: 'DRY VAN SHIPPING CONTAINER WITH ONE SET OF DOUBLE DOORS ON ONE END', href: PROMO_LINKS.dryVanSingle, image: { src: `${CDN}/2023/08/17060447/dry-van-container.webp`, alt: 'Dry Van Container' } },
    { title: 'DRY VAN SHIPPING CONTAINER WITH DOORS ON BOTH ENDS / TUNNEL CONTAINER', href: PROMO_LINKS.dryVanDouble, image: { src: `${CDN}/2023/08/17060648/shipping-container-tunnel.webp`, alt: 'Shipping Container Tunnel' } },
  ] satisfies readonly PromoLinkCard[],
  sizesHeading: 'Dry Van Container Sizes:',
  sizeGroups: [
    {
      title: 'STANDARD SHIPPING CONTAINERS',
      href: PROMO_LINKS.standard,
      items: [
        { title: '10 FOOT CONTAINERS', href: '/10-foot-shipping-container', image: { src: `${CDN}/2023/08/18054935/10-ft-shipping-containers.webp`, alt: '10 ft Shipping Containers' } },
        { title: '20 FOOT CONTAINERS', href: '/20-foot-shipping-containers', image: { src: `${CDN}/2023/08/18055209/20ft-shipping-container.webp`, alt: '20ft Shipping Container' } },
        { title: '40 FOOT CONTAINERS', href: '/40-foot-shipping-containers', image: { src: `${CDN}/2023/08/18055357/40ft-shipping-container.webp`, alt: '40ft Shipping Container' } },
      ],
    },
    {
      title: 'HIGH CUBE SHIPPING CONTAINERS',
      href: PROMO_LINKS.highCube,
      items: [
        { title: '40 FOOT HIGH CUBE CONTAINERS', href: '/40-high-cube-shipping-containers', image: { src: `${CDN}/2023/08/18054935/10-ft-shipping-containers.webp`, alt: '10 ft Shipping Containers' } },
        { title: '45 FOOT HIGH CUBE CONTAINERS', href: '/45-foot-shipping-container-for-sale', image: { src: `${CDN}/2023/08/18055209/20ft-shipping-container.webp`, alt: '20ft Shipping Container' } },
      ],
    },
  ] satisfies readonly { title: string; href: string; items: readonly PromoLinkCard[] }[],
} as const

export const PROMO_REEFER = {
  heading: 'Refrigerated Containers',
  items: [
    { title: 'WORKING REFRIGERATED CONTAINER', image: { src: `${CDN}/2023/08/17061742/insulated-shipping-container.webp`, alt: 'Insulated Shipping Container' } },
    { title: 'NON-WORKING INSULATED REFRIGERATED CONTAINER', image: { src: `${CDN}/2023/08/17062041/shipping-container-insulated.webp`, alt: 'Insulated Shipping Container' } },
  ],
  cta: 'LEARN MORE',
} as const

export const PROMO_SPECIALTY = {
  heading: 'Specialty Containers',
  items: [
    { title: 'OPEN TOP SHIPPING CONTAINER', href: '/open-top-container', image: { src: `${CDN}/2023/08/17063553/open-top-shipping-containers.webp`, alt: 'Open Top Shipping Containers' } },
    { title: 'OPEN-SIDE SHIPPING CONTAINER', href: '/open-side-container', image: { src: `${CDN}/2023/08/17063400/side-opening-shipping-container.webp`, alt: 'Side Opening Shipping Container' } },
    { title: 'FLAT RACK SHIPPING CONTAINER', href: '/flat-rack-container', image: { src: `${CDN}/2023/08/17063229/flat-rack-shipping-containers.webp`, alt: 'flat rack shipping containers' } },
    { title: 'DUO-CON SHIPPING CONTAINERS', href: '/duo-con-shipping-containers', image: { src: `${CDN}/2023/08/17063721/duo-con-container.webp`, alt: 'Duo Con Container' } },
    { title: 'TANK SHIPPING CONTAINER', href: '/shipping-container-tanks-for-sale', image: { src: `${CDN}/2023/08/17063947/shipping-container-tanks-for-sale.webp`, alt: 'Shipping Container Tanks For Sale' } },
    { title: 'SHIPPING CONTAINER CHASSIS', href: '/shipping-container-chassis', image: { src: `${CDN}/2023/08/17064117/shipping-container-chassis-for-sale.webp`, alt: 'Shipping Container Chassis For Sale' } },
  ] satisfies readonly PromoLinkCard[],
} as const

export const PROMO_RESOURCES = {
  heading: 'Additional Container Resources',
  cta: 'Learn more...',
  items: [
    { title: 'CHOOSING THE RIGHT CONTAINER', href: '/a-quick-easy-guide-for-choosing-the-right-shipping-container', image: { src: `${CDN}/2023/08/16045551/how-to-choose-a-shipping-container.webp`, alt: 'How To Choose A Shipping Container' } },
    { title: 'SHIPPING CONTAINER DIMENSIONS & SPECIFICATIONS', href: '/shipping-container-dimensions', image: { src: `${CDN}/2023/08/18055903/dimensions-of-a-shipping-container.webp`, alt: 'Dimensions of a Shipping Container' } },
    { title: 'MISTAKES TO AVOID WHEN BUYING A SHIPPING CONTAINER', href: '/mistakes-to-avoid-when-buying-shipping-containers', image: { src: `${CDN}/2023/08/18061502/shipping-container-guide.webp`, alt: 'Shipping Container Guide' } },
    { title: 'HIGH CUBE VS STANDARD CONTAINERS', href: '/the-difference-between-high-cube-and-standard-dry-van-containers', image: { src: `${CDN}/2023/08/16045443/shipping-container-rental.webp`, alt: 'Shipping Container Rental' } },
    { title: 'HOW MUCH DOES A USED CONTAINER COST?', href: '/used-shipping-container-cost', image: { src: `${CDN}/2023/08/18061916/how-much-is-a-used-shipping-container.webp`, alt: 'How Much is a Used Shipping Container' } },
    { title: 'TOP 10 INNOVATIVE USES OF SHIPPING CONTAINERS', href: '/shipping-container-uses', image: { src: `${CDN}/2023/08/16045658/shipping-container-innovation.webp`, alt: 'Shipping Container Innovation' } },
  ] satisfies readonly PromoLinkCard[],
} as const

export const PROMO_OPTIONS = {
  band: 'LOW-COST SHIPPING CONTAINER - BUY, RENT, OR RENT-TO-OWN',
  buy: {
    heading: 'BUY SHIPPING CONTAINERS AT THE BEST PRICE',
    body: [
      'On-Site Storage Solutions is proud to be one of the world’s top container wholesalers! We specialize in new and used shipping containers and can deliver them anywhere across the globe at unbeatable prices.',
      'We have a vast network of more than 60 locations throughout the United States and Canada. This ensures your order will arrive quickly with the lowest shipping costs. Get your storage container today!',
    ],
    image: { src: `${CDN}/2023/08/18062046/buy-a-shipping-container.webp`, alt: 'Buy a Shipping Container' },
  },
  rentals: {
    heading: 'CONTAINER RENTALS',
    before: 'Need an affordable and convenient storage solution? Rent a storage container with On-Site Storage Solutions! We offer Dry Van Containers, Refrigerated Containers, and more — serving you from over 60 locations in the US and Canada. Get the rental terms you need when and where you want them. Call',
    after: ' to find out more today!',
    image: { src: `${CDN}/2023/08/18062201/shipping-containers-for-rent.webp`, alt: 'Shipping Containers For Rent' },
  },
  rentToOwn: {
    heading: 'RENT-TO-OWN',
    body: 'If you’re looking for an affordable solution for your shipping container needs, On-Site Storage has partnered with My Container Rental and offers rent-to-own financing with no credit check needed. You can choose between 12, 24, 36, and 48-month programs on almost all containers, excluding As-Is condition and working refrigerated containers. With our rent-to-own program, you can save money while still having access to top-quality shipping containers.',
  },
  lease: {
    heading: 'LEASE-TO-PURCHASE CONTAINER FINANCING WITH',
    href: 'https://apply.timepayment.com/about-financing/?module=easyapply&version=1.0.0&dealercode=06DJF&id=&apptype=C%2CB&ref=&pv=&officecode=&applicationurl=https%3A%2F%2Fapply.timepayment.com%2Fldaweb%2Fdefault.aspx&x=266&y=76',
    logo: { src: `${CDN}/2023/04/26041117/timepayment_owler_20190409_180929_original.png`, alt: 'Timepayment' },
    body: 'On-Site Storage Solutions has partnered with TimePayment to offer a lease-to-purchase option for qualified applicants (Minimum 550 FICA). Get access to an immediate, ground-level storage solution at an affordable rate — and have the option of owning it at the end of your lease. With great rates and an approval process, this is an excellent way to save money and still achieve what you need.',
  },
} as const

export const PROMO_GUARANTEE = {
  band: 'CUSTOMER SATISFACTION GUARANTEED',
  heading: 'MONEY BACK GUARANTEE',
  body: 'At On-Site Storage Solutions, we pride ourselves on being one of the leading container companies in America. All our containers go through a thorough inspection before they are shipped out. Ensuring that our customers get nothing but high-quality containers. Plus, we guarantee satisfaction with every order. If you’re unhappy with a purchase for any reason whatsoever, we offer a full refund minus delivery and pick-up fees. Get the secure storage solutions you need today at an affordable price with On-Site Storage Solutions!',
  image: { src: `${CDN}/2023/08/18050658/shipping-container-best-price-guaranteed.webp`, alt: 'Shipping Container Best Price Guaranteed' },
} as const

export const PROMO_WHY = {
  heading: 'WHY CHOOSE ON-SITE STORAGE SOLUTIONS',
  subheading: 'Top Reasons to Purchase a Container From Us:',
  reasons: [
    'Over 20 Years in Business',
    'We provide the best prices around.',
    'We have locations near you',
    '100% Satisfaction Guarantee',
    'All WWT Containers are Guaranteed NO LEAKS',
    'Huge inventory of New, Used and',
    'Refurbished Containers',
    'Quality that you can trust',
    'Industry’s best customer service',
    'Full Door-to-Door Delivery',
    'We provide Custom Modifications',
    'Provides huge discounts for wholesale orders',
  ],
  image: { src: `${CDN}/2023/08/25074719/shipping-container.webp`, alt: 'Shipping Container' },
} as const

export const PROMO_TESTIMONIALS_HEADING = 'We’ve Got A lot of Happy Customers'

export const PROMO_TERMS = {
  band: 'PROMOTION TERMS AND CONDITIONS',
  intro: 'The following terms and conditions apply to all promotions offered by our company. By participating in any promotion, you agree to be bound by these terms and conditions.',
  items: [
    { label: 'Availability', body: 'Please note that the availability of promotions may be limited by location. This means that certain promotions may not be available in all areas and are subject to local laws and regulations. Our company reserves the right to modify or withdraw any promotion at any time and for any reason, without notice.' },
    { label: 'Eligibility', body: 'All promotions are open to individuals who meet the eligibility requirements as specified in the promotion details. Employees and immediate family members of our company are not eligible to participate in any promotion.' },
    { label: 'Redemption', body: 'Promotions must be redeemed within the specified timeframe and according to the instructions provided. Failure to redeem a promotion within the specified timeframe will result in forfeiture of the promotion.' },
    { label: 'Limitations', body: 'Only one promotion can be redeemed per person. Promotions cannot be combined with any other offer or promotion unless otherwise specified. Our company reserves the right to limit the number of promotions redeemed per person or per household.' },
    { label: 'Exclusions', body: 'Promotions may be subject to exclusions, such as certain products or services that are not eligible for the promotion. Exclusions will be clearly stated in the promotion details.' },
    { label: 'General', body: 'Our company reserves the right to cancel, modify or suspend any promotion at any time and for any reason without notice. The decision of our company in relation to any aspect of promotion is final and binding.' },
  ],
  release: 'By participating in any promotion, you agree to release and hold our company harmless from any liability for any injuries, loss, or damage of any kind arising from or regarding the promotion or any prize won. You also agree to comply with all applicable laws and regulations.',
  contactBefore: 'If you have any questions or concerns regarding these terms and conditions, please contact us at',
  contactAfter: '.',
} as const

export const PROMO_NEWSLETTER_HEADING = 'SUBSCRIBE TO OUR NEWSLETTER TO RECEIVE THE LATEST NEWS AND EXCLUSIVE OFFERS'
