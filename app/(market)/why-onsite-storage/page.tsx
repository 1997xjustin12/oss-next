import { CustomerTestimonials } from '@/components/shared/CustomerTestimonials'
import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { JsonLd } from '@/components/shared/JsonLd'
import { NewsletterForm } from '@/components/shared/NewsletterForm'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { SectionTagline2 } from '@/components/shared/SectionTagline2'
import { PAGE_SEO_DEFAULTS } from '@/config/pageSeoDefaults'
import { ROUTES } from '@/config/routes'
import {
  WHY_FAQ_HEADING,
  WHY_FAQS,
  WHY_HERO,
  WHY_NEWSLETTER_HEADING,
  WHY_REASONS_BAND,
  WHY_TESTIMONIALS_HEADING,
} from '@/lib/data/whyOnsiteContent'
import { breadcrumbNode, faqNode, graph, siteNodes, webPageNode } from '@/lib/schema'
import { resolvePageMetadata } from '@/lib/seo'
import { WhyHero } from './_components/WhyHero'
import { WhyIntro } from './_components/WhyIntro'
import { WhyQuality } from './_components/WhyQuality'
import { WhyReasons } from './_components/WhyReasons'
import { WhyTopReasons } from './_components/WhyTopReasons'

export function generateMetadata() {
  return resolvePageMetadata(ROUTES.WHY_ONSITE)
}

/**
 * Why On-Site Storage, native since 2026-11-06 at the URL WordPress served it
 * from. Its visible sections in WordPress's order, copy in
 * lib/data/whyOnsiteContent.ts. Static; the newsletter form is the only client code.
 */
export default function WhyOnsitePage() {
  const jsonLd = graph([
    ...siteNodes(),
    webPageNode({
      path: ROUTES.WHY_ONSITE,
      name: WHY_HERO.heading,
      description: PAGE_SEO_DEFAULTS[ROUTES.WHY_ONSITE]?.description,
    }),
    breadcrumbNode([{ name: 'Home', path: ROUTES.HOME }, { name: WHY_HERO.heading }]),
    // From the same list the visible FAQ renders.
    faqNode(WHY_FAQS),
  ])

  // The (market) layout provides <main>.
  return (
    <div className="page-fill bg-white dark:bg-neutral-950">
      <JsonLd data={jsonLd} />
      <PageHeadScripts path={ROUTES.WHY_ONSITE} />

      <WhyHero />
      <WhyIntro />
      <SectionTagline2 text={WHY_REASONS_BAND} />
      <WhyReasons />
      <WhyQuality />
      <WhyTopReasons />

      <div className="bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
        <FaqAccordion
          id="why-faq"
          heading={WHY_FAQ_HEADING}
          items={WHY_FAQS.map((faq) => ({ question: faq.question, answer: <p>{faq.answer}</p> }))}
        />
      </div>

      <CustomerTestimonials heading={WHY_TESTIMONIALS_HEADING} />

      <section aria-labelledby="why-newsletter" className="bg-theme-primary px-[5%] py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <h2 id="why-newsletter" className="text-center text-2xl font-extrabold uppercase leading-tight text-white sm:text-3xl">
            {WHY_NEWSLETTER_HEADING}
          </h2>
          <div className="mt-8">
            <NewsletterForm tone="dark" />
          </div>
        </div>
      </section>
    </div>
  )
}
