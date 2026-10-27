/**
 * Copy and media for /shipping-container-rent-to-own-financing, carried over
 * from the WordPress page it replaced (2026-10-27). Edit here; the components
 * only lay it out.
 *
 * Not carried over yet: the WordPress page's plugin features — the product
 * configurator under the hero and the two "see my monthly payment" ZIP boxes.
 * They come next, as native features.
 */

const CDN = 'https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana'

/** The page's lead price: a $1,350 container over the 48-month term. */
export const RTO_STARTING_MONTHLY = '$61.36'

export const RTO_HERO = {
  ribbon: `Starts at ${RTO_STARTING_MONTHLY.slice(1)}/month`,
  /** The page's main heading; WordPress had it as an h2 (it had no h1). */
  heading: { accent: 'Rent-To-Own', rest: 'Shipping Containers' },
  subheading: { accent: 'Instant', rest: 'Approval: Secure Your On-Site Storage Today.' },
  background: { src: `${CDN}/shipping-containers-for-sale-nearby_3CXLAqJ.webp`, alt: '' },
  badges: ['Flexible Rent-to-Own program.', 'No credit checks.', 'No hidden fees.', 'Just easy monthly payments.'],
} as const

export const RTO_OFFER = {
  ribbon: 'limited time offer',
  heading: 'Pay just $99 to get started—100% refundable at the end of your term.',
  cta: 'Get Approved in Minutes',
} as const

export const RTO_WHY = {
  heading: { rest: 'Why Choose', accent: 'Rent-To-Own' },
  image: { src: `${CDN}/why-rto-1024x576webpbv_resized_desktopwebpbv_rg4ZJmn.webp`, alt: 'On-Site Storage Solutions shipping container on a delivery truck' },
  badge: { src: `${CDN}/early-payoff-discount-available-badgewebpbv.webp`, alt: 'Early payoff discount available' },
  points: [
    { title: 'Keep Your Cash', body: 'Get a rent-to-own shipping container delivered to your site with minimal upfront costs. No need to drain savings or working capital.' },
    { title: 'No Credit Check Required', body: 'Qualifying for a portable storage container RTO plan is simple. No hard credit pull, no lengthy approval process.' },
    { title: 'Build Equity With Every Payment', body: 'Every rent-to-own container payment moves you closer to full ownership. Your money works for you instead of disappearing into a rental.' },
    { title: 'Flexible Terms That Work for You', body: 'Pay off your shipping container early, return it, or cancel anytime. No penalties, no fine print surprises.' },
  ],
} as const

export type RtoStepIcon = 'cart' | 'approved' | 'autopay' | 'own'

type RtoStep = { icon: RtoStepIcon; title: string; body: string }

const RTO_STEPS: readonly RtoStep[] = [
  { icon: 'cart', title: 'Pick Your Rent-to-Own Payment Plan', body: 'Choose your shipping container size and the monthly term that fits your budget.' },
  { icon: 'approved', title: 'Get Instantly Approved', body: 'Complete the fast, no credit check application and get approved the same day.' },
  { icon: 'autopay', title: 'Set Up Autopay and Schedule Delivery', body: 'Autopay is required for all RTO container orders. We deliver your portable storage container straight to your property, and every payment builds equity.' },
  { icon: 'own', title: 'Use It & Own It', body: 'We drop the shipping container at your location. After your final payment, it is 100% yours to keep.' },
]

export const RTO_PROCESS = {
  heading: { rest: 'Shipping Container Rent-To-Own Process:', accent: 'How It Works' },
  steps: RTO_STEPS,
} as const

/**
 * The payment table under step 1, as WordPress shows it: monthly payment by
 * container amount and term. Each figure is the amount over the term's divisor
 * (8.4, 13.4, 18, 22 — RTO_DIVISOR_TABLE in lib/pricing.ts).
 */
export const RTO_PAYMENT_TABLE = {
  caption: 'MCR Rent To Own',
  terms: ['12 Months', '24 Months', '36 Months', '48 Months'],
  rows: [
    { amount: '$2,000.00', monthly: ['$238.10', '$149.25', '$111.11', '$90.91'] },
    { amount: '$2,500.00', monthly: ['$297.62', '$186.57', '$138.89', '$113.64'] },
    { amount: '$3,000.00', monthly: ['$357.14', '$223.88', '$166.67', '$136.36'] },
    { amount: '$3,500.00', monthly: ['$416.67', '$261.19', '$194.44', '$159.09'] },
    { amount: '$4,000.00', monthly: ['$476.19', '$298.51', '$222.22', '$181.82'] },
  ],
} as const

export const RTO_REVIEWS_HEADING = "We've Got a Lot of [[Happy Customers]]"
export const RTO_TRUSTED_HEADING = '[[Trusted By]] Organizations Like'

export const RTO_OWN_BANNER = {
  heading: `Own your own shipping container for as little as ${RTO_STARTING_MONTHLY} per month`,
  cta: 'Start My Application',
  image: { src: `${CDN}/shipping-cargo-containers-for-sale-1024x601webpbv.webp`, alt: 'Shipping cargo containers for sale' },
} as const

export const RTO_READY_BANNER = {
  heading: 'Ready to lock in your low monthly payment?',
  cta: 'See my monthly payment',
  image: { src: `${CDN}/cargo-shipping-containers-for-salewebpbv.webp`, alt: 'Cargo shipping containers for sale' },
} as const

/** Background photo behind the three call-to-action banners. */
export const RTO_BANNER_BACKGROUND = { src: `${CDN}/shipping-containers-for-sale_WbKvUCy.webp`, alt: '' } as const

export const RTO_FAQS = [
  {
    question: 'What if I want to pay it off early?',
    answer: 'We offer a 33% Early Payoff Discount on your remaining balance, available at any time during your contract, except during the last 6 months. For example, if you have 18 months left and owe $6,000, you would only pay $4,020. The sooner you pay it off, the more you save.',
  },
  {
    question: "What happens if I don't need it anymore?",
    answer: 'You can cancel at any time. If you cancel before delivery, the process is simple, and there is no delivery to reverse. If the container has already been delivered, a retrieval fee applies, and your account must be current on payments before we can coordinate a pickup. Please note that prior rental payments already made are not refunded upon return.',
  },
  {
    question: 'Are there hidden maintenance fees?',
    answer: 'No. Your monthly payment is your rental payment, nothing more. There is no interest, no principal, and no surprise buyout at the end of your term. Once your final payment is made, the container is yours.',
  },
  {
    question: 'What is the liability damage waiver?',
    answer: 'The Liability Damage Waiver (LDW) protects your container in situations outside your control, such as fire, windstorm, or hail damage. If something happens to the unit, you are covered for the total remaining balance of your contract. Please note that the LDW covers the container itself, not the contents inside it.',
  },
  {
    question: 'How do I reduce my monthly payments?',
    answer: 'Two easy ways: choose a longer term (we offer 12, 24, 36, and 48-month options, and the longer the term, the lower the monthly payment), or put extra money down upfront. Any extra down payment gets spread across your remaining term to lower what you owe each month.',
  },
  {
    question: 'Where do I go to apply?',
    answer: 'Just reach out to one of our sales agents, and we will generate a free instant quote for you. The quote will include an Apply Online link you can click to complete your application. No credit check is required, and approval is typically same-day.',
  },
  {
    question: 'Is the Rent-to-Own payment option available for all types and conditions of containers?',
    answer: 'RTO is available on most standard containers. Modifications are supported, such as adding doors, windows, and vents, as long as our dealer handles them. We are not able to process RTO on AS-IS containers or units with plumbing, extensive electrical, flooring, or drywall. If you are unsure about your configuration, just ask us, and we will let you know what is possible.',
  },
  {
    question: 'How much does it cost?',
    answer: 'Your total cash price is the container price plus delivery. From there, your down payment is as low as 10% for single container deliveries within 250 miles, or 20% for longer distances or modified units. You then choose a term of 12, 24, 36, or 48 months, and your monthly payment is set from there. Contact us for a free instant quote with your specific size and location.',
  },
  {
    question: 'How many containers can I order if I plan to Rent-to-Own?',
    answer: 'We can accommodate orders for two containers under our RTO program. Two-container orders require a 20% down payment, and delivery must be within 200 miles. If you need more than two units, reach out to our team, and we will walk you through the best options available.',
  },
] as const
