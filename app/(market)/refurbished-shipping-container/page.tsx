import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { JsonLd } from '@/components/shared/JsonLd'
import { NewsletterForm } from '@/components/shared/NewsletterForm'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { ReviewsSection } from '@/components/shared/ReviewsSection'
import { PAGE_SEO_DEFAULTS } from '@/config/pageSeoDefaults'
import { ROUTES } from '@/config/routes'
import {
  REFURB_FAQ_HEADING,
  REFURB_FAQS,
  REFURB_NEWSLETTER_HEADING,
  REFURB_REVIEWS_HEADING,
} from '@/lib/data/refurbishedContent'
import { breadcrumbNode, faqNode, graph, siteNodes, webPageNode } from '@/lib/schema'
import { resolvePageMetadata } from '@/lib/seo'
import { getReviews } from '@/services/review.service'
import { RefurbAbout } from './_components/RefurbAbout'
import { RefurbBuying } from './_components/RefurbBuying'
import { RefurbDetails } from './_components/RefurbDetails'
import { RefurbHero } from './_components/RefurbHero'
import { RefurbOptions } from './_components/RefurbOptions'

const PAGE_NAME = 'Refurbished Shipping Container'

export function generateMetadata() {
  return resolvePageMetadata(ROUTES.REFURBISHED_CONTAINERS)
}

/**
 * Refurbished shipping containers, native since 2026-11-06 at the URL WordPress
 * served it from (the backend never imported the page). Its visible sections in
 * WordPress's order, copy in lib/data/refurbishedContent.ts. Static: the reviews
 * read is cached; the ZIP finder, the review slider and the newsletter form are
 * the only client code.
 */
export default async function RefurbishedContainerPage() {
  const reviews = await getReviews()

  const jsonLd = graph([
    ...siteNodes(),
    webPageNode({
      path: ROUTES.REFURBISHED_CONTAINERS,
      name: PAGE_NAME,
      description: PAGE_SEO_DEFAULTS[ROUTES.REFURBISHED_CONTAINERS]?.description,
    }),
    breadcrumbNode([{ name: 'Home', path: ROUTES.HOME }, { name: PAGE_NAME }]),
    // From the same list the FAQ below renders.
    faqNode(REFURB_FAQS),
  ])

  // The (market) layout provides <main>.
  return (
    <div className="page-fill bg-white dark:bg-neutral-950">
      <JsonLd data={jsonLd} />
      <PageHeadScripts path={ROUTES.REFURBISHED_CONTAINERS} />

      <RefurbHero />
      <RefurbAbout />
      <RefurbBuying />
      <RefurbDetails />
      <RefurbOptions />
      <ReviewsSection heading={REFURB_REVIEWS_HEADING} reviews={reviews} />

      <section aria-labelledby="refurb-newsletter" className="bg-theme-primary px-[5%] py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <h2 id="refurb-newsletter" className="text-center text-2xl font-extrabold uppercase leading-tight text-white sm:text-3xl">
            {REFURB_NEWSLETTER_HEADING}
          </h2>
          <div className="mt-8">
            <NewsletterForm tone="dark" />
          </div>
        </div>
      </section>

      <div className="bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
        <FaqAccordion
          id="refurb-faq"
          heading={REFURB_FAQ_HEADING}
          items={REFURB_FAQS.map((faq) => ({ question: faq.question, answer: <p>{faq.answer}</p> }))}
        />
      </div>
    </div>
  )
}
