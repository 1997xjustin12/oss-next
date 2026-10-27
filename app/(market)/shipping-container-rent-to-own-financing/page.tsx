import { ROUTES } from '@/config/routes'
import { PAGE_SEO_DEFAULTS } from '@/config/pageSeoDefaults'
import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { JsonLd } from '@/components/shared/JsonLd'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { ReviewsSection } from '@/components/shared/ReviewsSection'
import { TrustedBySection } from '@/components/shared/TrustedBySection'
import {
  RTO_FAQS,
  RTO_OFFER,
  RTO_OWN_BANNER,
  RTO_READY_BANNER,
  RTO_REVIEWS_HEADING,
  RTO_TRUSTED_HEADING,
} from '@/lib/data/rentToOwnContent'
import { breadcrumbNode, faqNode, graph, siteNodes, webPageNode } from '@/lib/schema'
import { resolvePageMetadata } from '@/lib/seo'
import { getReviews } from '@/services/review.service'
import { RtoBanner } from './_components/RtoBanner'
import { RtoHero } from './_components/RtoHero'
import { RtoProcess } from './_components/RtoProcess'
import { RtoWhyChoose } from './_components/RtoWhyChoose'

export function generateMetadata() {
  return resolvePageMetadata(ROUTES.RENT_TO_OWN)
}

/**
 * Rent-to-own, native since 2026-10-27 at the URL WordPress served it from.
 *
 * Copied from the WordPress page section by section (copy in
 * lib/data/rentToOwnContent.ts). Not yet carried over: its plugin features —
 * the product configurator under the hero and the "see my monthly payment" ZIP
 * boxes — which come next as native features. The reviews are the store's own,
 * REVIEWS.io and Google, through getReviews().
 *
 * Static: the reviews are a cached read, so the page is prerendered.
 */
export default async function RentToOwnPage() {
  const reviews = await getReviews()

  const jsonLd = graph([
    ...siteNodes(),
    webPageNode({
      path: ROUTES.RENT_TO_OWN,
      name: 'Rent-To-Own Shipping Containers',
      description: PAGE_SEO_DEFAULTS[ROUTES.RENT_TO_OWN]?.description,
    }),
    breadcrumbNode([{ name: 'Home', path: ROUTES.HOME }, { name: 'Rent-To-Own Shipping Containers' }]),
    // From the same list the FAQ below renders.
    faqNode(RTO_FAQS),
  ])

  // The (market) layout provides <main>. `page-fill` and the background: every
  // section paints its own, and this covers any gap above the footer.
  return (
    <div className="page-fill bg-white dark:bg-neutral-950">
      <JsonLd data={jsonLd} />
      <PageHeadScripts path={ROUTES.RENT_TO_OWN} />

      <RtoHero />
      <RtoBanner tone="light" ribbon={RTO_OFFER.ribbon} heading={RTO_OFFER.heading} cta={RTO_OFFER.cta} />
      <RtoWhyChoose />
      <RtoProcess />
      <ReviewsSection heading={RTO_REVIEWS_HEADING} reviews={reviews} />
      <TrustedBySection heading={RTO_TRUSTED_HEADING} />
      <RtoBanner tone="dark" heading={RTO_OWN_BANNER.heading} cta={RTO_OWN_BANNER.cta} sideImage={RTO_OWN_BANNER.image} />

      <div className="bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
        <FaqAccordion
          id="rto-faq"
          heading="Frequently Asked Questions"
          items={RTO_FAQS.map((faq) => ({ question: faq.question, answer: <p>{faq.answer}</p> }))}
        />
      </div>

      <RtoBanner tone="light" heading={RTO_READY_BANNER.heading} cta={RTO_READY_BANNER.cta} sideImage={RTO_READY_BANNER.image} />
    </div>
  )
}
