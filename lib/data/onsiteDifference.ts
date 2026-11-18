/**
 * "The On-Site Storage Difference" (components/shared/OnsiteDifference.tsx):
 * the homepage's words (the 2026-11-18 design), which the /all-city/ template
 * starts from. Template text: `[[…]]` an accent, `[label](/path)` a link.
 */

export type OnsiteDifferencePoint = { title: string; desc: string }

export const ONSITE_DIFFERENCE_BODY =
  'Since 2002, we have helped thousands of businesses, farms, and homeowners find the right shipping container at the right price.'

/** The homepage's points. Their titles are admin-editable there (config/homeContent.ts `onsiteDifference.item1`–`item4`). */
export const ONSITE_DIFFERENCE_POINTS: readonly OnsiteDifferencePoint[] = [
  { title: 'No Hidden Fees', desc: 'Your quoted price is final from first inquiry to invoice.' },
  { title: '60+ Locations In The U.S. And Canada', desc: 'A local depot near you keeps mileage and delivery costs down.' },
  { title: '75+ Years Of Combined Industry Experience', desc: 'Senior staff with deep shipping container expertise answer every call.' },
  { title: 'Buy, Rent, Or Rent-To-Own', desc: 'Pick the option that fits your budget and timeline. Ask about our price match.' },
]

export const ONSITE_DIFFERENCE_BUTTON = 'Call To Check Fast Delivery And Best Price'

/** The homepage's photo. */
export const ONSITE_DIFFERENCE_IMAGE = {
  src: '/images/gregg.webp',
  alt: 'Gregg, On-Site Storage founder, checking an order on a clipboard',
}
