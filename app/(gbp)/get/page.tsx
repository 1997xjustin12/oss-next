import { GbpLocationPage, gbpLocationMetadata } from '../_components/GbpLocationPage'

// The national GBP page: the GBP template with no single location (its record
// is the `get` entry in lib/data/gbpPages.ts, published through /admin/gbp).
const SLUG = 'get'

export function generateMetadata() {
  return gbpLocationMetadata(SLUG)
}

/** GBP national page (/get). Static; every read is cached. Kept out of search (the record's `seo.noindex`). */
export default function Page() {
  return <GbpLocationPage slug={SLUG} />
}
