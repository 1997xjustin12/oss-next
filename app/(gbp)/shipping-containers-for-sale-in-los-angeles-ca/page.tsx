import { GbpLocationPage, gbpLocationMetadata } from '../_components/GbpLocationPage'

// The page's content is its published record (services/gbp.service.ts, over
// its seed in lib/data/gbpPages.ts); this file only names it. A new GBP page
// is this file with another slug.
const SLUG = 'shipping-containers-for-sale-in-los-angeles-ca'

export function generateMetadata() {
  return gbpLocationMetadata(SLUG)
}

/** GBP location page: Los Angeles, CA. Static; every read is cached. */
export default function Page() {
  return <GbpLocationPage slug={SLUG} />
}
