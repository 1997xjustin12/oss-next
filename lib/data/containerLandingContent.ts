/**
 * What /shipping-containers-for-sale and /shipping-container-rental share, word
 * for word from WordPress, where the two pages are one Elementor template: the
 * hero's backdrop and tagline, the bands, the "3 Easy Steps" box, the logo
 * marquee, the satisfaction block and the FAQ shape. Each page's own copy is in
 * forSaleContent.ts and rentalContent.ts.
 *
 * Copy corrections (owner approved for the migrated pages, 2026-11-06): every
 * phone number is (888) 977-9085, and plain misspellings are fixed. Wording
 * that needs new copy is left as WordPress has it and listed in the migration
 * doc's decisions.
 */

export const CDN = 'https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads'

/** Where the satisfaction block's "Check out our reviews" goes. Still a WordPress page. */
export const REVIEWS_PAGE = '/review-of-shipping-containers'

/** The hero's container-yard photo (a CSS background on WordPress). */
export const LANDING_HERO_BACKGROUND = { src: `${CDN}/2024/08/22033247/new_homepage_banner.webp`, alt: '' } as const

export const LANDING_TAGLINE = 'Lowest Price - Huge Inventory - Highly Recommended - Satisfaction Guaranteed'

export const BUDGET_BAND = 'WE HAVE CONTAINERS FOR EVERY BUDGET!'

export const INSTANT_PRICING_BAND = 'GET INSTANT PRICING NOW!'

/** WordPress's ZIP box in that band: a "Submit" button. */
export const INSTANT_PRICING_BOX = { submitLabel: 'Submit', placeholder: 'Enter your ZIP/Postal Code' } as const

export const THREE_STEPS = {
  /** `[[…]]` is the red run, as WordPress colours "3 Easy Steps". */
  heading: 'Purchase or Rent Your Shipping Container in [[3 Easy Steps]]',
  steps: [
    'Enter zip/postal code for container prices near you.',
    'Affordable pricing options based on your type, size, and condition preferences.',
    'Wait for your delivery! Delivery takes 3-7 days after checkout.',
  ],
  submitLabel: 'Get Instant Local Pricing',
  placeholder: 'Enter zipcode here',
  image: { src: `${CDN}/2025/08/21074414/home-202508-map-1.webp`, alt: 'where to buy shipping containers', width: 800, height: 833 },
} as const

export const TRUSTED_BAND = 'TRUSTED BY ORGANIZATIONS LIKE'

/** WordPress's logo carousel, in its order, named from its file names. */
export const TRUSTED_LOGOS = [
  ['2023/08/03171857/U.S.-Forest-Service-2.webp', 'U.S. Forest Service'],
  ['2023/08/03171905/Ford-Motor-Company-2.webp', 'Ford Motor Company'],
  ['2023/08/03171919/Nissan-2.webp', 'Nissan'],
  ['2023/08/03171924/U.S.-Air-Force-2.webp', 'U.S. Air Force'],
  ['2023/08/03171931/U.S.-Army-2.webp', 'U.S. Army'],
  ['2023/08/03171936/U.S.-Coast-Guard-2.webp', 'U.S. Coast Guard'],
  ['2023/08/03171946/U.S.-Marine-Corp-2.webp', 'U.S. Marine Corps'],
  ['2023/08/03172914/Crown-Lift.webp', 'Crown Lift'],
  ['2023/08/03172920/Young-Bros.webp', 'Young Brothers'],
  ['2023/08/03172925/General-Electric.webp', 'General Electric'],
  ['2023/08/03172931/Toll-Brothers.webp', 'Toll Brothers'],
  ['2023/08/03172941/La-Quinta.webp', 'La Quinta'],
  ['2023/08/03172951/Toyota-2.webp', 'Toyota'],
  ['2023/08/03172959/TruGreen.webp', 'TruGreen'],
  ['2024/05/07063631/walmart-6639cafcac2af.webp', 'Walmart'],
  ['2024/05/07063635/walt-disney-6639cafd04427.webp', 'Walt Disney'],
  ['2024/05/07063638/abc-6639cafe7f7e2.webp', 'ABC'],
  ['2024/05/07063642/advanced-auto-parts-6639cafecb0fc.webp', 'Advance Auto Parts'],
  ['2024/05/07063645/air-liquide-6639cb196b89d.webp', 'Air Liquide'],
  ['2024/05/07063649/alcoa-6639cb009bee9.webp', 'Alcoa'],
  ['2024/05/07063652/bnsf-railway-6639cb00a6d28.webp', 'BNSF Railway'],
  ['2024/05/07063655/boeing-6639cb0181cfa.webp', 'Boeing'],
  ['2024/05/07063659/dow-chemical-6639cb018692d.webp', 'Dow Chemical'],
  ['2024/05/07063703/federal-express-6639cb037d352.webp', 'FedEx'],
  ['2024/05/07063706/girl-scouts-6639cb03464d7.webp', 'Girl Scouts'],
  ['2024/05/07063709/la-dwp-6639caf98bd28.webp', 'Los Angeles Department of Water and Power'],
  ['2024/05/07063712/lockheed-martin-6639caf951aea.webp', 'Lockheed Martin'],
  ['2024/05/07063715/mitsubishi-6639cafa467be.webp', 'Mitsubishi'],
  ['2024/05/07063718/nbc-6639cb10b82d4.webp', 'NBC'],
  ['2024/05/07063721/sony-studios-6639cafbbf040.webp', 'Sony Pictures Studios'],
  ['2024/05/07063724/spacex-6639cafbbefcf.webp', 'SpaceX'],
].map(([path, alt]) => ({ src: `${CDN}/${path}`, alt }))

/**
 * Beside WordPress's review slider: 33 screenshots of Google reviews, text in
 * pictures. Here the slider is `ReviewsSection` with `getReviews()`, the same
 * reviews as text (migration doc §6).
 */
export const SATISFACTION = {
  heading: '100% Satisfaction Guaranteed',
  body: 'Our satisfaction guarantee makes buying or renting a container easy and worry-free. Call to order from our friendly experienced sales associates or just order online using our website. Our website is a great place to start learning more about container prices, types, conditions, and grades. Order today you will be glad you did.',
  cta: 'Check out our reviews',
  seal: { src: `${CDN}/2024/10/08011536/Satisfaction-Guaranteed-1.webp`, alt: '', width: 149, height: 141 },
} as const

export const LANDING_FAQ_HEADING = 'FREQUENTLY ASKED QUESTIONS'

/** Text, a link, or a bold run inside an answer. */
export type LandingInline = string | { text: string; href: string } | { strong: string }

/** A paragraph, or a list whose items are runs of inlines. */
export type LandingFaqBlock = { p: readonly LandingInline[] } | { ul: readonly (readonly LandingInline[])[] }

export type LandingFaq = { question: string; answer: readonly LandingFaqBlock[] }

/** A one-paragraph answer, the common case. */
export const p = (...parts: LandingInline[]): LandingFaqBlock => ({ p: parts })

function inlineText(parts: readonly LandingInline[]): string {
  return parts.map((part) => (typeof part === 'string' ? part : 'strong' in part ? part.strong : part.text)).join('')
}

/** An answer as plain text, for the FAQPage structured data. */
export function landingFaqText(faq: LandingFaq): string {
  return faq.answer
    .map((block) => ('p' in block ? inlineText(block.p) : block.ul.map((item) => inlineText(item)).join(' ')))
    .join(' ')
}
