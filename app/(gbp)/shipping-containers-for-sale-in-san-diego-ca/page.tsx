import { JsonLd } from '@/components/shared/JsonLd'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { gbpJsonLd, gbpPath, requireGbpPage } from '@/lib/gbp'
import { gbpMetadata } from '@/lib/gbpMetadata'
import { getReviews } from '@/services/review.service'
import { GbpTemplate } from '../_components/GbpTemplate'

// The page's content is its entry in lib/data/gbpPages.ts; this file only
// names it. A new GBP page is this file with another slug.
const page = requireGbpPage('shipping-containers-for-sale-in-san-diego-ca')

export function generateMetadata() {
  return gbpMetadata(page)
}

/** GBP location page: San Diego, CA. Static; the reviews are a cached read. */
export default async function Page() {
  const reviews = await getReviews()
  return (
    <>
      <JsonLd data={gbpJsonLd(page)} />
      <PageHeadScripts path={gbpPath(page)} />
      <GbpTemplate page={page} reviews={reviews} />
    </>
  )
}
