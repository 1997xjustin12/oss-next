/**
 * Copy and media for /shipping-container-faqs, carried over from the WordPress
 * page it replaced (2026-11-06): its visible sections, in its order, word for
 * word. Edit here; the components only lay it out. The quote form between the
 * intro and the FAQs is the shared ZohoQuoteRequestForm.
 *
 * Corrected from WordPress: "“As Is’ ‘" (stray quote marks), "floors..",
 * "delivery site..", "load the container.." (double full stops), "So, If"
 * (capital mid-sentence), and the high cube height "9.6″" (9′6″, as "one foot
 * taller" than the 8′6″ standard says).
 *
 * Still as WordPress has it, for the content owner:
 * - "Are there different conditions…" lists grades (As-Is, WWT, CW, IICL) and
 *   "Are there different grades…" lists conditions (one-trip, used,
 *   refurbished): the two answers look swapped;
 * - "Shipping containers are graded in the following:" under conditions;
 * - "On-site Storage Solutions North America locations mean we can provide near
 *   you at the best price." (words missing);
 * - "rent-to-own … for as low as $125/month" (the rent-to-own page quotes a
 *   lower figure);
 * - "Container Chassis – Shipping Container Chassis – Container chassis…";
 * - "up to four to five bedroomed houses"; "C Container" in the names list.
 *
 * WordPress had two h1s; the second ("Shipping Container FAQs") is an h2 here.
 */

import { ROUTES } from '@/config/routes'
import { CONTACT_NUMBER, telHref } from '@/lib/helpers'

const CDN = 'https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads'

/** Text, a link inside the sentence, or a bold run. */
export type FaqInline = string | { text: string; href: string } | { strong: string }

/** A paragraph, a list (each item a run of inlines), or a sub-heading inside an answer. */
export type FaqBlock =
  | { kind: 'p'; content: readonly FaqInline[] }
  | { kind: 'list'; items: readonly (readonly FaqInline[])[]; columns?: boolean }
  | { kind: 'subheading'; content: readonly FaqInline[] }

export type FaqEntry = { id: string; question: string; blocks: readonly FaqBlock[] }
export type FaqGroup = { id: string; heading: string; entries: readonly FaqEntry[] }

const p = (...content: FaqInline[]): FaqBlock => ({ kind: 'p', content })
const sub = (...content: FaqInline[]): FaqBlock => ({ kind: 'subheading', content })
const list = (items: FaqInline[][], columns = false): FaqBlock => ({ kind: 'list', items, columns })

export const FAQS_HERO = {
  heading: 'Shipping Container Frequently Asked Questions',
  intro: 'Are you interested in learning more about shipping containers? What are some of the alternative names for it? How much is a shipping container? How do I prepare my container delivery? etc. We’re confident that we have an answer for you. We cover everything from pricing to modifications to delivery, as well as availability.',
} as const

export const FAQS_IMAGE = {
  src: `${CDN}/2022/01/27100828/onsite-container-banner-size-300x212.png`,
  alt: 'how much is a shipping container a sample of frequently asked questions about shipping containers',
  width: 300,
  height: 212,
} as const

const QUOTE = '/shipping-container-quote'

export const FAQ_GROUPS: readonly FaqGroup[] = [
  {
    id: 'shipping-container-faqs',
    heading: 'Shipping Container FAQs',
    entries: [
      {
        id: 'other-names',
        question: 'What other names are shipping containers known by?',
        blocks: [
          p('Here are the most common names for shipping containers:'),
          list(
            [
              'Intermodal Container', 'ISO Container', 'Sea Can', 'Sea Container', 'C Container',
              'Ocean Container', 'Rail Container', 'Portable Storage Unit', 'Container Van', 'Conex Box',
              'Freight Container', 'Shipping Crates', 'Cargo Container', 'Transport Container',
            ].map((name) => [name]),
            true,
          ),
        ],
      },
      {
        id: 'made-of',
        question: 'What are shipping containers made of?',
        blocks: [
          p('Each shipping container begins with a big roll of ', { text: 'COR-TEN Steel (aka weathering steel)', href: 'https://en.wikipedia.org/wiki/Weathering_steel' }, ' and then is processed and assembled using advanced machinery systems in Asia. Every component goes through a technical process, including the corrugated walls, frame, cross members, and cargo doors to ensure the container’s durability. The 1 ⅛ marine-grade plywood is screwed to steel beams on the bottom of the shipping container, supporting the weight of a loaded forklift truck.'),
          p('After the container has been assembled, it is painted to provide adequate protection against saltwater and other extreme conditions of sea transport. Finally, the container is inspected and certified before it can be used to transport cargo to prevent the risk of structural failure and protect human life.'),
        ],
      },
      {
        id: 'used-condition',
        question: 'Are the used shipping containers in good condition?',
        blocks: [
          p('Yes the used ', { text: 'wind and water tight (WWT) shipping containers', href: '/wwt-containers-wind-and-watertight-shipping-containers' }, ' are still in good storage grade or better condition. We purchase used in service shipping containers after they reach about 12 years old and their shipping line leases have expired. At this point, the containers are still structurally sound so your valuables will remain safe and dry stored in them. Customers should expect these used containers to show normal wear and tear (ie., rust, dents, faded paint, patches) from years of use in international shipping.'),
        ],
      },
      {
        id: 'types',
        question: 'Are there different types of shipping containers?',
        blocks: [
          p('Yes, there are different types of shipping containers, and the standards are:'),
          p({ strong: 'Dry Van Shipping Containers: ' }, 'This is the most common shipping container on the market. It’s made from marine-grade materials that include 14 gauge rust-inhibiting steel and 1 ⅛” marine grade plywood flooring. They are wind and water tight and come standard with small pressure vents for minimal air flow but not sufficient to create functional ventilation in the interior of the container.'),
          p({ strong: 'Refrigerated Shipping Containers:' }, ' These are special containers that have been insulated to regulate temperature. They are made from stainless steel and are equipped with a refrigeration system (ranges from -15°F to 65°F) for transporting perishable foods, pharmaceuticals, and chemicals.'),
          p('There are also specialized shipping containers such as tunnel containers, flat racks, open-top containers, etc. For a detailed guide of container types that will help you choose the right container for you, ', { text: 'read this article', href: '/a-quick-easy-guide-for-choosing-the-right-shipping-container' }, '.'),
        ],
      },
      {
        id: 'sizes',
        question: 'What are the available sizes for shipping containers?',
        blocks: [
          p('The most commonly used shipping container sizes are:'),
          sub({ text: '20-Foot Shipping Container', href: '/20-foot-shipping-containers' }),
          p('A ', { text: '20-Foot cargo container', href: '/20-foot-shipping-containers' }, ' has enough room to store furniture and items for a two-bedroom apartment and is roomy enough to double as an office container, an event space, or even a trendy mobile cafe shop.'),
          sub({ text: '40-Foot Shipping Container', href: '/40-foot-shipping-containers' }),
          p('This takes up the same area as two single parking spaces head to tail. It also has twice the capacity of 20-ft, which can hold the content of up to four to five bedroomed houses.'),
          sub('Hi-Cube Container'),
          p('The HC container is 9′6″ tall, which is one foot taller than a standard intermodal container. The extra ceiling height gives enough space to move around comfortably even after installing insulation and wiring. So, if you plan to convert your container into a tiny home or workplace, Hi-Cube Container is a highly recommended choice. They come in various sizes from 20-53 feet, but the most common sizes available for sale are 40-foot and 45-foot containers. Due to extra width a 53’ container requires a special permit to move.'),
        ],
      },
      {
        id: 'conditions',
        question: 'Are there different conditions for shipping containers?',
        blocks: [
          p('Shipping containers are graded in the following:'),
          sub('As-Is'),
          p('Used “As Is” containers are used intermodal shipping containers that are damaged and would need repairs in order to upgrade their condition to at least Wind and Watertight condition. Damage can include large dings, dents, heavy rust and holes and damaged floors.'),
          sub('Wind and Water Tight (WWT)'),
          p('These used containers have been inspected to ensure they are in good storage condition. These units are typically 12 years or older and will still have original paint and ship line-markings. They will have some dings, dents and surface rust but are guaranteed not to leak. The floors are in good condition but may have some soft spots and may not be suitable for driving in and out with a forklift.'),
          sub('Cargo Worthy (CW)'),
          p('These containers have been inspected by a certified IICL inspector and deemed structurally sound and safe for international shipping.'),
          sub('IICL'),
          p('IICL-6 graded containers meet the highest condition set by the Institute of International Container Lessors. These containers typically range in age from 2-10 years old and are priced substantially higher than wind and watertight since their book value has not been fully depreciated.'),
        ],
      },
      {
        id: 'grades',
        question: 'Are there different grades for shipping containers?',
        blocks: [
          p({ strong: 'New ‘One-Trip’ Container:' }, ' A one-trip shipping container is essentially a new shipping container. It has been built in the factory (most likely in China) and has completed one international trip from the factory to the destination country. One-trip shipping containers typically carry cargo to keep the cost of transportation down as the freight will effectively pay for the transport of the shipping container.'),
          p({ strong: 'Used WWT Container:' }, ' Used containers are ideal for those who are less concerned with aesthetics and are looking to bridge the gap between function and cost. The used containers are typically about half the cost of a one-trip container and will be around 12-15 years old. Used containers are sourced from international shipping lines so they will vary in color and often have shipping logos. They will have superficial dents and scratches, and rust from the exposed steel of the container oxidizing from years of overseas shipping. These are dry van containers which means they carried mostly dry goods and equipment and should not have dangerous chemical residue.'),
          p({ strong: 'Refurbished:' }, ' Refurbished shipping containers are used WWT (Wind and Water Tight) containers that have been painted and repaired to extend their lifespan. They can be modified to order in our depots and are a great option when appearance may be a concern but a new container is just outside your budget. At On-Site Storage Solutions, we offer three levels of refurbishments: Typical, Full, and Factory Refurbishment.'),
        ],
      },
      {
        id: 'container-vs-shed',
        question: 'What are the benefits of a shipping container versus building a shed?',
        blocks: [
          p('New and used metal shipping containers are very secure, structurally sound and can be delivered quickly to your location for a fraction of the cost that it would take to build a shed. Also, unlike a shed, a container provides you with a mobile storage option that you can relocate or remove when desired. On-site Storage Solutions North America locations mean we can provide near you at the best price.'),
        ],
      },
    ],
  },
  {
    id: 'purchasing-faqs',
    heading: 'Purchasing FAQs',
    entries: [
      {
        id: 'who-we-sell-to',
        question: 'Do you sell to business owners or to individuals?',
        blocks: [p('We sell directly to both individuals and retailers. So, whether you need one container or 100, we will assist you with the entire buying process and make it as seamless as possible.')],
      },
      {
        id: 'how-to-order',
        question: 'How can I order a Container?',
        blocks: [
          p('You can easily order a container by giving us a call at ', { text: CONTACT_NUMBER, href: telHref(CONTACT_NUMBER) }, ' or ', { text: 'requesting a quote', href: QUOTE }, '. You can also ', { text: 'go here for pricing near your location', href: ROUTES.WHERE_TO_BUY }, '. Either way, one of our highly knowledgeable sales representatives will answer any of your container and delivery questions and assist you with your order to ensure you get the right type of shipping container delivered to you.'),
        ],
      },
      {
        id: 'payment',
        question: 'How do I make payment?',
        blocks: [p('Once your order is confirmed, we will email you an invoice that you can pay with a credit card or bank transfer.')],
      },
      {
        id: 'moving',
        question: 'I’m moving, and I want to load my belongings in a container then have them delivered to my new home. Is it possible?',
        blocks: [p('We can sell you a container and have it delivered to you. Once it is filled, you will have to make arrangements with a flatbed driver to move to a second location. Keep in mind that a loaded container will require a crane to load and offload from a flatbed truck.')],
      },
      {
        id: 'finance',
        question: 'Can I finance my container or rent-to-own?',
        blocks: [
          p('Yes, you can rent-to-own a shipping container for as low as $125/month. Give us a call to discuss your needs and we’ll give you the available options. You may also ', { text: 'check this page to learn more about our financing', href: 'https://apply.timepayment.com/about-financing/?module=easyapply&version=1.0.0&dealercode=06DJF&id=&apptype=C%2CB&ref=&pv=&officecode=&applicationurl=https%3A%2F%2Fapply.timepayment.com%2Fldaweb%2Fdefault.aspx&x=266&y=76' }, '.'),
        ],
      },
      {
        id: 'buy-back',
        question: 'When I’m done with my container, will you buy it back?',
        blocks: [p('Yes, we offer buy-back and consignment options. The Buy-Back option usually results in a lower payoff because we have to move the unit from your location to one of our depots. The best option for you will depend on your timing and location of the container.')],
      },
    ],
  },
  {
    id: 'delivery-faqs',
    heading: 'Delivery FAQs',
    entries: [
      {
        id: 'delivery-included',
        question: 'Is delivery included?',
        blocks: [p('No, the delivery cost is additional and is based on mileage from the shipping container depot to your delivery site. Customers need to make sure a big rig truck weighing over 30,000 pounds can make the delivery. Our experts will work closely with you to make sure the delivery goes well.')],
      },
      {
        id: 'delivery-time',
        question: 'How long will delivery take once I confirm my order?',
        blocks: [p('The delivery of your shipping container normally takes about 3-7 business days, depending on driver availability.')],
      },
      {
        id: 'truck-type',
        question: 'What type of truck is going to deliver my container?',
        blocks: [
          p('On-Site Storage Solutions has a network of independent drivers around the world to deliver the container to almost any location you need to. These drivers have specialized equipment that enables them to pick up the container and deliver it to the ground. The type of truck depends on the driver and the customer’s requirements.'),
          list([
            [{ strong: 'Roll-Off or Flat Bed Tow Truck' }, ' – These trucks are used for 20-foot or smaller containers and typically used for locations where space is limited.'],
            [{ strong: 'One Ton Dually with a Tilt-Bed Trailer' }, ' – These trucks can deliver all sizes of containers and tend to be more maneuverable than others.'],
            [{ strong: 'Semi-Truck & Trailer' }, ' – These trucks are capable of delivering all sizes of containers. They tend to be less maneuverable and need sufficient space for delivery.'],
            [{ strong: 'Step Deck Trailer' }, ' – These trucks are designed to deliver tall loads such as Hi-Cube containers. We usually use this type of truck for long-distance delivery and our customer has the ability to get the container off the truck because it doesn’t tilt.'],
            [{ strong: 'Container Chassis' }, ' – Shipping Container Chassis – Container chassis (aka intermodal chassis or skeletal trailer) is specifically designed to transport intermodal containers. This equipment is a steel frame with tires, axle systems, suspension, brakes, and lighting systems. They can carry all sizes of containers, including Hi-Cube containers.'],
          ]),
          p('Note: Not all trucks are available in some locations. If you have space limitations or any concerns, please advise the sales agent so that when the container is being delivered, we have the right type of truck and equipment to deliver it properly.'),
        ],
      },
      {
        id: 'delivery-cost',
        question: 'How much does it cost to deliver a container?',
        blocks: [
          p('These metal shipping containers are large and heavy and require specialized delivery equipment. Our driving partners have specialized equipment that enables them to pick up and deliver the container to the ground. Tilt-bed delivery typically runs $5-$10 a mile, with all drivers having a minimum delivery of $300-$500 just to load the container. For pricing in your location, you can ', { text: 'request a quote', href: QUOTE }, '.'),
        ],
      },
      {
        id: 'delivery-space',
        question: 'How much space is required for delivery?',
        blocks: [p('For a 20-ft container, you’ll need to have at least 60-80 feet of straight space to accommodate a 40-foot trailer truck. A 40-ft container requires 100-120 feet of straight space to accommodate a 60-foot trailer truck. If your space is limited, we can make special arrangements.')],
      },
      {
        id: 'site-preparation',
        question: 'Do I need to prepare my site for delivery?',
        blocks: [
          p('Yes, the customer is responsible for ensuring their site is ready for delivery. These are the guidelines to ensure you’ll have no trouble in receiving your shipping container:'),
          list([
            ['Delivery requires a straight 120′ for unloading.'],
            ['Height clearance requirement is 14′ high and increases to 21′ when unloading.'],
            ['The truck requires 13′ wide clearance.'],
            ['The trucks weigh more than 30,000 lbs and require dry hard ground capable of supporting this weight.'],
            ['Ensure the street leading into your property is wide enough to accommodate the truck radius while turning onto your property.'],
            ['Ensure space is clear of fence posts, underground utilities, grass, planters, and concrete not able to withstand the weight.'],
            ['We require the customer to be onsite at the time of the delivery to direct the placement of the container.'],
            ['The driver(s) will do their best to place the container in the desired location. It is the driver’s right to refuse to place a container in a location where they feel it may cause harm to themselves or their property.'],
          ]),
        ],
      },
      {
        id: 'site-unsure',
        question: 'What if I’m not sure my site is deliverable?',
        blocks: [p('If you’ve reviewed the delivery guidelines but are still not sure your site is deliverable you can call one of our representatives to do an online site assessment. Additional measurements and visuals may be necessary to properly assess your site.')],
      },
      {
        id: 'cancel-reschedule',
        question: 'Can I cancel or reschedule the delivery of my container?',
        blocks: [p('Yes, you can postpone or cancel your delivery without cancellation fees as long as you give a 48-hour notice. Deliveries that are canceled or postponed with less than a 48-hour notice are subject to a $300 cancelation fee.')],
      },
      {
        id: 'own-driver',
        question: 'Can I pick up my container or send my own driver?',
        blocks: [
          p('Yes, you can arrange your own ', { text: 'container delivery', href: '/complete-shipping-container-delivery-guide' }, '. Once the container is paid in full we will send you the pick-up information required by the depot to release the container to you. The depot can load the container and your driver must secure it on the truck. The container can typically be ready for pick up within 2 days. Arrangements for same-day pick up can be made in some cases.'),
        ],
      },
      {
        id: 'reject',
        question: 'What If I get the container and I don’t like it. Can I reject it?',
        blocks: [p('If your container is delivered in wind and watertight condition, you can reject it and be issued a refund less the delivery cost.')],
      },
    ],
  },
]

/** An answer as plain text, for the FAQPage structured data. */
export function faqAnswerText(blocks: readonly FaqBlock[]): string {
  const inline = (parts: readonly FaqInline[]) => parts.map((part) => (typeof part === 'string' ? part : 'strong' in part ? part.strong : part.text)).join('')
  return blocks
    .map((block) => (block.kind === 'list' ? block.items.map((item) => inline(item)).join('; ') : inline(block.content)))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}
