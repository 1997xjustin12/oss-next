import { LocationFeaturedContainers } from '@/components/product/LocationFeaturedContainers'
import { CustomerTestimonials } from '@/components/shared/CustomerTestimonials'
import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { JsonLd } from '@/components/shared/JsonLd'
import { NewsletterForm } from '@/components/shared/NewsletterForm'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { SectionTagline2 } from '@/components/shared/SectionTagline2'
import { PAGE_SEO_DEFAULTS } from '@/config/pageSeoDefaults'
import { ROUTES } from '@/config/routes'
import {
  CONDITIONS_BAND,
  CONDITIONS_CARDS,
  CONDITIONS_FAQ_HEADING,
  CONDITIONS_FAQS,
  CONDITIONS_FEATURED_SPECS,
  CONDITIONS_INTRO,
  CONDITIONS_NEWSLETTER_HEADING,
  CONDITIONS_TESTIMONIALS_HEADING,
  GRADE_CARDS,
  GRADES_BAND,
  GRADES_INTRO,
  SELECTION_BAND,
} from '@/lib/data/containerConditionsContent'
import { breadcrumbNode, faqNode, graph, siteNodes, webPageNode } from '@/lib/schema'
import { resolvePageMetadata } from '@/lib/seo'
import { ConditionsCardGrid } from './_components/ConditionsCardGrid'
import { ConditionsHelp } from './_components/ConditionsHelp'
import { ConditionsHero } from './_components/ConditionsHero'
import { ConditionsOptions } from './_components/ConditionsOptions'
import { ConditionsRichText } from './_components/ConditionsRichText'
import { ConditionsSelection } from './_components/ConditionsSelection'

const PAGE_NAME = 'Shipping Container Conditions'

export function generateMetadata() {
  return resolvePageMetadata(ROUTES.CONTAINER_CONDITIONS)
}

/**
 * Shipping container conditions, grades and selection options, native since
 * 2026-11-06 at the URL WordPress served it from. Its visible sections in
 * WordPress's order, copy in lib/data/containerConditionsContent.ts. Static;
 * the featured cards' depot swap and the newsletter form are the only client code.
 */
export default function ContainerConditionsPage() {
  const jsonLd = graph([
    ...siteNodes(),
    webPageNode({
      path: ROUTES.CONTAINER_CONDITIONS,
      name: PAGE_NAME,
      description: PAGE_SEO_DEFAULTS[ROUTES.CONTAINER_CONDITIONS]?.description,
    }),
    breadcrumbNode([{ name: 'Home', path: ROUTES.HOME }, { name: PAGE_NAME }]),
    // From the same list the FAQ below renders.
    faqNode(CONDITIONS_FAQS),
  ])

  // The (market) layout provides <main>.
  return (
    <div className="page-fill bg-white dark:bg-neutral-950">
      <JsonLd data={jsonLd} />
      <PageHeadScripts path={ROUTES.CONTAINER_CONDITIONS} />

      <ConditionsHero />

      <section aria-label="About container conditions" className="bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
        <div className="mx-auto max-w-4xl space-y-4">
          {CONDITIONS_INTRO.map((segments, i) => (
            <ConditionsRichText key={i} segments={segments} className="text-base leading-relaxed text-theme-mid sm:text-lg dark:text-neutral-300" />
          ))}
        </div>
      </section>

      <LocationFeaturedContainers specs={CONDITIONS_FEATURED_SPECS} className="pb-12" />

      <SectionTagline2 bg="blue" text={CONDITIONS_BAND} />
      <ConditionsCardGrid cards={CONDITIONS_CARDS} columns={3} label="Container conditions" />

      <SectionTagline2 bg="blue" text={GRADES_BAND} />
      <section aria-label="About container grades" className="bg-white px-[5%] pt-12 dark:bg-neutral-950">
        <p className="mx-auto max-w-4xl text-center text-base leading-relaxed text-theme-mid sm:text-lg dark:text-neutral-300">{GRADES_INTRO}</p>
      </section>
      <div className="bg-white pt-8 dark:bg-neutral-950">
        <ConditionsCardGrid cards={GRADE_CARDS} columns={4} label="Container grades" />
      </div>

      <SectionTagline2 bg="blue" text={SELECTION_BAND} />
      <ConditionsSelection />

      <ConditionsOptions />

      <div className="bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
        <FaqAccordion
          id="conditions-faq"
          heading={CONDITIONS_FAQ_HEADING}
          items={CONDITIONS_FAQS.map((faq) => ({ question: faq.question, answer: <p>{faq.answer}</p> }))}
        />
      </div>

      <ConditionsHelp />
      <CustomerTestimonials heading={CONDITIONS_TESTIMONIALS_HEADING} />

      <section aria-labelledby="conditions-newsletter" className="bg-theme-primary px-[5%] py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <h2 id="conditions-newsletter" className="text-center text-2xl font-extrabold uppercase leading-tight text-white sm:text-3xl">
            {CONDITIONS_NEWSLETTER_HEADING}
          </h2>
          <div className="mt-8">
            <NewsletterForm tone="dark" />
          </div>
        </div>
      </section>
    </div>
  )
}
