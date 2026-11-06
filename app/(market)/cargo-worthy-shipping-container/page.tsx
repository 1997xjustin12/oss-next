import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import { JsonLd } from '@/components/shared/JsonLd'
import { NewsletterForm } from '@/components/shared/NewsletterForm'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { ReviewsSection } from '@/components/shared/ReviewsSection'
import { SectionTagline2 } from '@/components/shared/SectionTagline2'
import { PAGE_SEO_DEFAULTS } from '@/config/pageSeoDefaults'
import { ROUTES } from '@/config/routes'
import {
  CARGO_FAQ_HEADING,
  CARGO_FAQS,
  CARGO_LINKS,
  CARGO_NEWSLETTER_HEADING,
  CARGO_REVIEWS_CTA,
  CARGO_REVIEWS_HEADING,
  CARGO_SIZES_BAND,
} from '@/lib/data/cargoWorthyContent'
import { breadcrumbNode, faqNode, graph, siteNodes, webPageNode } from '@/lib/schema'
import { resolvePageMetadata } from '@/lib/seo'
import { getReviews } from '@/services/review.service'
import { CargoAvailability } from './_components/CargoAvailability'
import { CargoHero } from './_components/CargoHero'
import { CargoIntro } from './_components/CargoIntro'
import { CargoOptions } from './_components/CargoOptions'
import { CargoSizes } from './_components/CargoSizes'

const PAGE_NAME = 'Cargo Worthy Shipping Container'

export function generateMetadata() {
  return resolvePageMetadata(ROUTES.CARGO_WORTHY_CONTAINERS)
}

/**
 * Cargo worthy shipping containers, native since 2026-11-06 at the URL
 * WordPress served it from (the backend never imported it, so it 404'd here).
 * Its visible sections in WordPress's order, copy in lib/data/cargoWorthyContent.ts.
 *
 * Static: the reviews are a cached read. The ZIP finder, the review carousel and
 * the newsletter form are the only client code.
 */
export default async function CargoWorthyPage() {
  const reviews = await getReviews()

  const jsonLd = graph([
    ...siteNodes(),
    webPageNode({
      path: ROUTES.CARGO_WORTHY_CONTAINERS,
      name: PAGE_NAME,
      description: PAGE_SEO_DEFAULTS[ROUTES.CARGO_WORTHY_CONTAINERS]?.description,
    }),
    breadcrumbNode([{ name: 'Home', path: ROUTES.HOME }, { name: PAGE_NAME }]),
    // From the same list the FAQ below renders.
    faqNode(CARGO_FAQS),
  ])

  // The (market) layout provides <main>.
  return (
    <div className="page-fill bg-white dark:bg-neutral-950">
      <JsonLd data={jsonLd} />
      <PageHeadScripts path={ROUTES.CARGO_WORTHY_CONTAINERS} />

      <CargoHero />
      <CargoIntro />
      <CargoAvailability />
      <SectionTagline2 bg="blue" text={CARGO_SIZES_BAND} />
      <CargoSizes />
      <CargoOptions />

      <ReviewsSection heading={CARGO_REVIEWS_HEADING} reviews={reviews} />
      <div className="bg-[#F7F7F7] px-[5%] pb-12 text-center dark:bg-gray-900">
        <Link
          href={CARGO_LINKS.reviews}
          className="inline-flex min-h-11 items-center rounded-md border border-theme-primary bg-theme-primary px-8 font-bold text-white transition-colors hover:bg-white hover:text-theme-primary
                     focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary dark:hover:bg-neutral-950 dark:hover:text-red-400"
        >
          {CARGO_REVIEWS_CTA}
        </Link>
      </div>

      <section aria-labelledby="cargo-newsletter" className="bg-theme-primary px-[5%] py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <h2 id="cargo-newsletter" className="text-center text-2xl font-extrabold uppercase leading-tight text-white sm:text-3xl">
            {CARGO_NEWSLETTER_HEADING}
          </h2>
          <div className="mt-8">
            <NewsletterForm tone="dark" />
          </div>
        </div>
      </section>

      <div className="bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
        <FaqAccordion
          id="cargo-faq"
          heading={CARGO_FAQ_HEADING}
          items={CARGO_FAQS.map((faq) => ({ question: faq.question, answer: <p>{faq.answer}</p> }))}
        />
      </div>
    </div>
  )
}
