import type { PriceSpec } from '@/lib/pricing'

/**
 * The four containers featured on the homepage and under "You may also need" on
 * the product page.
 *
 * `spec` says which catalogue listings each card's "Starts at" is the lowest
 * price of. The figure itself is never typed here — lowestPrice() works it out
 * from live listings (the visitor's depot on the homepage, the page's depot on
 * a product page), and the card shows no price when nothing matches.
 */
export type FeaturedContainer = {
  key: string
  image: string
  type: string
  desc: string
  cta: { label: string; url: string }
  spec: PriceSpec
}

export const FEATURED_CONTAINERS: FeaturedContainer[] = [
  {
    key: 'used-20ft-standard',
    image: '/images/containers/used-20ft-standard.webp',
    type: 'Used 20ft Standard',
    desc: 'Perfect for residential, small business, and construction site storage. Fits most driveways.',
    cta: { label: 'Get Free Quote', url: '#' },
    spec: { paymentType: 'buy', size: "20'", height: 'standard', condition: 'Used' },
  },
  {
    key: 'used-40ft-standard',
    image: '/images/containers/used-40ft-standard.webp',
    type: 'Used 40ft Standard',
    desc: 'Double capacity for farms, retail, contractors, and industrial storage needs nationwide.',
    cta: { label: 'Get Free Quote', url: '#' },
    spec: { paymentType: 'buy', size: "40'", height: 'standard', condition: 'Used' },
  },
  {
    key: 'used-40ft-hc',
    image: '/images/containers/used-40ft-hc.webp',
    type: 'Used 40ft High Cube',
    desc: 'Extra headroom for tall equipment, workshop setups, and high-volume inventory storage.',
    cta: { label: 'Get Free Quote', url: '#' },
    spec: { paymentType: 'buy', size: "40'", height: 'high-cube', condition: 'Used' },
  },
  {
    key: 'new-40ft-hc',
    image: '/images/containers/new-40ft-hc.webp',
    type: 'New 40ft High Cube',
    desc: 'Brand-new one-trip containers for maximum longevity, custom builds, and premium storage.',
    cta: { label: 'Inquire', url: '#' },
    spec: { paymentType: 'buy', size: "40'", height: 'high-cube', condition: 'New' },
  },
]
