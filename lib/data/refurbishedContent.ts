/**
 * Copy and media for /refurbished-shipping-container, carried over from the
 * WordPress page (2026-11-06): its visible sections, in its order, word for
 * word. Native because the backend never imported the page, so it 404'd here.
 * Edit here; the components only lay it out.
 *
 * Corrected from WordPress: "refursbished", "new containers..", "whether you
 * chose", "month(some areas may require sale tax)", "6, 12 18" and the missing
 * full stop before "Call us now!".
 *
 * Still as WordPress has it, for the content owner: the hero's "rent to-own";
 * "The interior and exterior is repainted"; the Full Refurbishment list ending
 * "good working condition" where Factory says "excellent".
 *
 * Not carried over: the two sections WordPress hides on every device (a second
 * "Refurbished shipping container" heading block, and an empty one). The store
 * locator shortcode, which WordPress prints as raw text, is the app's ZIP finder.
 */

import { ROUTES } from '@/config/routes'

const CDN = 'https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads'

export type RefurbImage = { src: string; alt: string; width: number; height: number }

/** Root-relative paths of pages that are still WordPress's (listed in the migration doc). */
export const REFURB_LINKS = {
  morePhotos: '/shipping-container-pictures-by-conditions/refurbished-shipping-container',
  quote: '/shipping-container-quote',
  buy: '/shipping-containers-for-sale',
  used: '/used-shipping-containers-for-sale',
  newOneTrip: '/new-one-trip-shipping-containers',
  rental: '/shipping-container-rental',
} as const

export const REFURB_HERO = {
  heading: 'Refurbished Shipping Container',
  subheading: 'For sale, rent, rent to-own',
  background: { src: `${CDN}/2022/04/27100500/refurbished-header-bg.webp`, alt: '' },
} as const

export const REFURB_WHAT = {
  heading: 'What is a refurbished Container?',
  items: [
    { label: 'Typical Refurbishment', text: 'Exterior is repainted. Container exterior is prepped and painted. Prep includes wire wheeling to remove loose rust, spot priming exposed metal and painting the exterior including the roof. Typically we paint over locking rods, gaskets and decals.' },
    { label: 'Full Refurbishment', text: 'Similar to Typical Refurbishment but includes painting the interior.' },
    { label: 'Factory Refurbishment', text: 'This is a complete overhaul of the container with new interior and exterior paint, new gaskets and new container markings.' },
  ],
  image: { src: `${CDN}/2023/08/16064053/refurbished-shipping-containers-for-sale.webp`, alt: 'Refurbished Shipping Containers For Sale', width: 501, height: 366 },
} as const

export const REFURB_EXAMPLES = {
  heading: 'Here are a few examples of Refurbished containers (your choice of color)',
  images: [
    { src: `${CDN}/2023/11/21074319/red-655c5dd9381a6.webp`, alt: 'Refurbished container painted red', width: 582, height: 437 },
    { src: `${CDN}/2023/11/21074328/white-655c5ddae9ccc.webp`, alt: 'Refurbished container painted white', width: 572, height: 437 },
    { src: `${CDN}/2023/11/21074314/green-655c5dd6bf6c7.webp`, alt: 'Refurbished container painted green', width: 576, height: 437 },
  ] satisfies readonly RefurbImage[],
  morePhotos: 'MORE PHOTOS',
  quote: 'GET FREE QUOTE',
} as const

export const REFURB_USES = {
  heading: 'What are the uses of a refurbished Units?',
  items: ['Storage space', 'Office pop up', 'Container shed', 'Shipping container urban farm', 'Shipping container bar', 'Container condos', 'And many more'],
  image: { src: `${CDN}/2023/11/21074337/cafe-655c5dd559a41.webp`, alt: 'A refurbished container converted into a café', width: 780, height: 457 },
} as const

export const REFURB_WHY = {
  heading: 'Why get refurbished containers?',
  items: [
    { title: 'A great alternative to a new container', body: 'Refurbished Containers are usually a more logical alternative than purchasing a new container. However, you should first choose which container would be better suited to your needs, depending on how you intend to use it. We can assist you with this decision.' },
    { title: 'Cheaper than a new container', body: 'Considering these containers have been used, they are cheaper than new containers. The cost of refurbishing a used container could be as little as $500 (plus the cost of the container). Cost also depends on the size of the container and whether you choose a lighter pigmented paint color. For example, white paint requires more paint to cover adequately so it costs more than darker colors like beige or gray. Even after the refurbishment, the cost will still be cheaper than a new container. However, many customers opt for a new one trip container because the cost difference is not as great as you might think and the customer gets a new container with a new factory paint job.' },
    { title: 'Eco friendly', body: 'Refurbished containers look good but they still do not look as nice as a new one trip container. By selecting a used refurbished shipping container versus a new container you are recycling the used container and helping protect the environment. The refurbishment process also helps extend the life of the container by minimizing rust and corrosion.' },
    { title: 'It’s guaranteed to last', body: 'Shipping containers are designed to protect cargo even in the harshest conditions. They can handle everything from ocean waves to severe weather. Though refurbished used containers have already been through it all, they are still in wind and watertight condition and can still protect your valuables from the elements.' },
  ],
  image: { src: `${CDN}/2023/11/21074334/brown-655c5dd32927d.webp`, alt: 'Refurbished container painted brown', width: 800, height: 684 },
} as const

export const REFURB_BUY_BAND = {
  heading: 'Are you interested in buying a refurbished container?',
  cta: 'BUY NOW',
} as const

export const REFURB_STEPS = {
  heading: 'BUY A REFURBISHED CONTAINER IN 3 EASY STEPS',
  steps: [
    { label: 'STEP 1', link: { text: 'Enter zip/postal code', href: ROUTES.WHERE_TO_BUY }, text: ' for container prices near you', icon: { src: `${CDN}/2023/08/15034509/step-1-buy-shipping-container.webp`, alt: 'Step 1 for Buying a Shipping Container', width: 77, height: 72 } },
    { label: 'STEP 2', text: 'Affordable pricing options based on your type, size and condition', icon: { src: `${CDN}/2023/08/15034645/step-2-buy-shipping-container.webp`, alt: 'Step 2 for Buying a Shipping Container', width: 95, height: 73 } },
    { label: 'STEP 3', text: 'Wait for your delivery! Delivery takes 3-7 days after checkout.', icon: { src: `${CDN}/2023/08/15034718/step-3-buy-shipping-container.webp`, alt: 'Step 3 for Buying a Shipping Container', width: 87, height: 80 } },
  ],
} as const

export const REFURB_LOCATOR_HEADING = 'FIND A REFURBISHED SHIPPING CONTAINER NEAR YOU'

export const REFURB_LEVELS = {
  intro: 'We offer three levels of refurbishment on a Used Wind and Water Tight container:',
  levels: [
    {
      title: 'Typical refurbishment',
      items: ['Loose surface rust and dirt is removed using a wire brush.', 'We then spot-prime any bare metal with DTM primer (direct to metal primer).'],
    },
    {
      title: 'Full Refurbishment',
      items: [
        'Loose rust and dirt is removed using a wire brush on the exterior.',
        'We then spot prime any bare metal with DTM primer (direct to metal primer).',
        'After the primer dries, we spray paint the container with exterior latex paint in a color of your choice.',
        'The process is then repeated on the interior.',
        'In addition, the door gaskets or seals are cleaned up.',
        'Minor repairs or patches are done where needed.',
        'The container is delivered in good working condition.',
      ],
    },
    {
      title: 'Factory Refurbishment',
      lead: 'This is a complete overhaul of the shipping container.',
      items: [
        'Rust is removed and patches are done.',
        'Minor repairs to walls, roof, and floor are done.',
        'The interior and exterior is repainted.',
        'New door seals are installed.',
        'The container is delivered in excellent working condition.',
      ],
    },
  ],
} as const

export const REFURB_COST = {
  availabilityHeading: 'Availability and location',
  availability: [
    'Standard sizes are easily available in most locations.',
    'If you choose a refurbished shipping container, you can select the paint color for the exterior and interior.',
  ],
  costHeading: 'Cost',
  costIntro: 'The cost for a fully refurbished shipping container includes the following:',
  costItems: [
    { text: 'The cost of a used Wind and Water Tight shipping container – will vary with size and location.' },
    { label: 'Exterior paint', text: ' – 20-ft is usually around $750. A 40-ft is about $900 and 40-ft HC is $950. (HC is a High Cube container that is about 1 foot higher than the standard container.)' },
    { label: 'Interior paint', text: ' – 20-ft is usually around $650. A 40-ft is about $800 and 40-ft HC about $850.' },
  ],
  after: [
    'The cost of a factory refurbishment will depend on the number of repairs and parts replaced.',
    'On-site Storage Solutions offers refurbished containers in most locations across North America. Give us a call today and we’ll help you find the best container for your needs and budget.',
  ],
  cta: 'CALL US NOW (888)977-9085',
  image: { src: `${CDN}/2023/11/21074312/call-us-now-655c5dd6dcbf6.webp`, alt: 'Call us now about a refurbished container', width: 800, height: 892 },
} as const

export const REFURB_OTHER_CONDITIONS = {
  band: 'OTHER CONDITIONS',
  cards: [
    {
      title: 'USED',
      href: REFURB_LINKS.used,
      paragraphs: ['Our most popular container, used general purpose containers, have been in heavy-duty shipping service for 5 to 15 years before being “retired.” Most used shipping containers will have the original paint and shipping line markings. They will also have surface rust, dents, and abrasions. Used shipping containers might not look good on the outside and inside, but depending on their grade, they will be structurally sound and some may still be suitable for export.'],
      image: { src: `${CDN}/2022/10/21081641/used-high-cube-shipping-container-for-sale-1024x1024.webp`, alt: 'Used High Cube Shipping Container for Sale', width: 1024, height: 1024 },
    },
    {
      title: 'NEW ONE TRIP',
      href: REFURB_LINKS.newOneTrip,
      paragraphs: [
        'New One Trip shipping containers may have minor dents, dings, and scrapes which are a result of regular shipping and handling during their long ocean journey.',
        'These new shipping containers are manufactured in Asia and then shipped to our various depots around the world. In order to reduce the cost of shipping and provide our customers with the best prices we load these new containers with cargo 1 time. This helps us offset the re-positioning costs and pass on the savings to our customers.',
      ],
      image: { src: `${CDN}/2023/11/21050425/new-40-high-cube-655c38e5ebee3.webp`, alt: 'New 40 ft high cube one trip container', width: 626, height: 483 },
    },
  ],
  cta: 'LEARN MORE',
} as const

export const REFURB_BUY = {
  band: 'BUY FROM US',
  body: 'We offer a wide selection of shipping containers for all your needs. From refurbished, and used to new containers, we have the right option for you – no matter the size or purpose. Our purchasing power ensures that you’re always getting the best price available.',
  cta: 'LEARN MORE',
} as const

export const REFURB_OPTIONS = {
  heading: 'LOW-COST ON-SITE STORAGE SOLUTIONS',
  rental: {
    title: 'RENTAL',
    before: 'On-Site Storage Solutions is a leader in providing rental shipping containers for temporary or long-term needs at the lowest rates available. Rental rates start as low as $99 a month (some areas may require sales tax), just give us a call at',
    phoneText: '(888) 977-9085',
    after: ', and we’ll walk you through the container rental process',
  },
  rentToOwn: {
    title: 'RENT-TO-OWN',
    before: 'On-Site Storage Solutions proudly presents a Rent-To-Own Option in partnership with My Container Rental. Call us at',
    phoneText: '(888) 977-9085',
    after: ' or select from our website the payment plans that suit you best – including 6, 12, 18, and 24 Months, as well as long-term programs.',
  },
  cta: 'LEARN MORE',
} as const

export const REFURB_HELP = {
  before: 'If You Need Help In Choosing Your Container, Our Team Is Standing By.',
  link: 'Call us now! (888)977-9085',
} as const

export const REFURB_REVIEWS_HEADING = 'WE’VE GOT A LOT OF [[HAPPY CUSTOMERS]]'

export const REFURB_NEWSLETTER_HEADING = 'SUBSCRIBE TO OUR NEWSLETTER TO RECEIVE THE LATEST NEWS AND EXCLUSIVE OFFERS'

export const REFURB_FAQ_HEADING = 'FREQUENTLY ASKED QUESTIONS'

export const REFURB_FAQS = [
  { question: 'What are refurbished shipping containers?', answer: 'Refurbished shipping containers are used containers that have been repaired, restored, and improved to extend their lifespan and enhance their functionality.' },
  { question: 'Why choose refurbished shipping containers over new ones?', answer: 'Choosing refurbished containers can be more cost-effective compared to buying new ones while still providing a reliable and structurally sound option for various purposes.' },
  { question: 'What repairs are typically done during the refurbishment process?', answer: 'The refurbishment process may involve repairing damaged panels, fixing dents, replacing worn-out flooring, restoring doors, addressing rust issues, and repainting.' },
  { question: 'Can refurbished shipping containers be customized?', answer: 'Yes, refurbished containers can be customized according to specific needs and requirements, including modifications such as adding windows, doors, insulation, electrical systems, and more.' },
] as const
