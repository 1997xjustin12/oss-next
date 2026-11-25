import { ROUTES } from '@/config/routes'
import type { PriceSpec } from '@/lib/pricing'
import type { DepotFeaturedKey } from '@/services/search.service'

/**
 * The four containers featured on the homepage and under "You may also need" on
 * the product page.
 *
 * `spec` says which catalogue listings each card stands for. It drives both the
 * card's "Starts at" — the lowest price among them, worked out from live
 * listings by lowestPrice(), never typed in — and where its button goes: the
 * listing filtered to exactly those containers, so the price on the card is one
 * the visitor can find on the next page.
 */
export type FeaturedContainer = {
  key: string
  image: string
  type: string
  desc: string
  ctaLabel: string
  spec: PriceSpec
  /** The listing whose photo and price the homepage card shows. */
  depotSpec: DepotFeaturedKey
  /**
   * The homepage card's own wording, where it differs from `desc` / `ctaLabel`
   * (which the product page's "You may also need" keeps): the 2026-11-18 design.
   */
  home?: { desc?: string; ctaLabel?: string }
  /**
   * A chosen photo for this card on the homepage, /all-city and the city pages
   * (/all-city/<city>), shown instead of the catalogue listing's own. Without
   * it those cards show the listing's photo and fall back to `image`. The
   * product page's "You may also need" keeps `image`.
   */
  cardImage?: string
}

export const FEATURED_CONTAINERS: FeaturedContainer[] = [
  {
    key: 'used-20ft-standard',
    image: '/images/containers/used-20ft-standard.webp',
    type: 'Used 20ft Standard',
    desc: 'Perfect for residential, small business, and construction site storage. Fits most driveways.',
    ctaLabel: 'Get Free Quote',
    spec: { paymentType: 'buy', size: "20'", height: 'standard', condition: 'Used' },
    depotSpec: 'used_20s_wwt',
    home: {
      desc: 'A used 20ft shipping container fits most driveways and suits home storage, small business inventory, and construction site tools.',
    },
  },
  {
    key: 'used-40ft-standard',
    image: '/images/containers/used-40ft-standard.webp',
    type: 'Used 40ft Standard',
    desc: 'Double capacity for farms, retail, contractors, and industrial storage needs nationwide.',
    ctaLabel: 'Get Free Quote',
    spec: { paymentType: 'buy', size: "40'", height: 'standard', condition: 'Used' },
    depotSpec: 'used_40s_wwt',
    home: {
      desc: 'A used 40ft shipping container doubles the space for farms, retail stock, contractors, and industrial storage.',
    },
  },
  {
    key: 'used-40ft-hc',
    image: '/images/containers/used-40ft-hc.webp',
    type: 'Used 40ft High Cube',
    desc: 'Extra headroom for tall equipment, workshop setups, and high-volume inventory storage.',
    ctaLabel: 'Get Free Quote',
    spec: { paymentType: 'buy', size: "40'", height: 'high-cube', condition: 'Used' },
    depotSpec: 'used_40h_wwt',
  },
  {
    key: 'new-40ft-hc',
    image: '/images/containers/new-40ft-hc.webp',
    type: 'New 40ft High Cube',
    desc: 'Brand-new one-trip containers for maximum longevity, custom builds, and premium storage.',
    ctaLabel: 'Get Free Quote',
    spec: { paymentType: 'buy', size: "40'", height: 'high-cube', condition: 'New' },
    depotSpec: 'new_40h_iicl',
    // 2026-11-25: a supplied photo, in place of the listing's.
    cardImage: '/images/containers/new-40ft-hc-card.webp',
    // As the design has it; "Fits most driveways" is the 20ft card's old line, for the content owner to check.
    home: {
      desc: 'Perfect for residential, small business, and construction site storage. Fits most driveways.',
      ctaLabel: 'Inquire',
    },
  },
]

/**
 * The listing's `height` filter values, exactly as the catalogue stores them —
 * straight quotes for standard, curly for high cube. A near miss filters to
 * nothing.
 */
const HEIGHT_FILTER_VALUE: Record<NonNullable<PriceSpec['height']>, string> = {
  standard: `8' 6" Standard`,
  'high-cube': '9’ 6” High Cube (HC)',
}

/**
 * The listing filtered to a card's containers. Render it through PlpLink, which
 * adds the visitor's ZIP and depot.
 */
export function featuredListingHref(spec: PriceSpec): string {
  const params = new URLSearchParams({ ptype: spec.paymentType })
  if (spec.size) params.set('size', spec.size)
  if (spec.condition) params.set('condition', spec.condition)
  if (spec.height) params.set('height', HEIGHT_FILTER_VALUE[spec.height])
  return `${ROUTES.PLP}?${params}`
}
