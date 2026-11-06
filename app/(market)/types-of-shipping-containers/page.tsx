import { FeaturedContainerCards } from '@/components/product/FeaturedContainerCards'
import { CustomerTestimonials } from '@/components/shared/CustomerTestimonials'
import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { JsonLd } from '@/components/shared/JsonLd'
import { NewsletterForm } from '@/components/shared/NewsletterForm'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { SectionTagline2 } from '@/components/shared/SectionTagline2'
import { PAGE_SEO_DEFAULTS } from '@/config/pageSeoDefaults'
import { ROUTES } from '@/config/routes'
import {
  CONTAINER_TYPE_CATEGORIES,
  CONTAINER_TYPES_BAND,
  CONTAINER_TYPES_FAQ_HEADING,
  CONTAINER_TYPES_FAQS,
  CONTAINER_TYPES_NEWSLETTER_HEADING,
  CONTAINER_TYPES_TESTIMONIALS_HEADING,
  CONTAINER_TYPES_WHY_BAND,
} from '@/lib/data/containerTypesContent'
import { breadcrumbNode, faqNode, graph, siteNodes, webPageNode } from '@/lib/schema'
import { resolvePageMetadata } from '@/lib/seo'
import { TypesCategory } from './_components/TypesCategory'
import { TypesHero } from './_components/TypesHero'
import { TypesIntro } from './_components/TypesIntro'
import { TypesOptions } from './_components/TypesOptions'
import { TypesReasons } from './_components/TypesReasons'

const PAGE_NAME = 'Different Types Of Shipping Containers'

export function generateMetadata() {
  return resolvePageMetadata(ROUTES.CONTAINER_TYPES)
}

/**
 * Types of shipping containers, native since 2026-11-06 at the URL WordPress
 * served it from. Its visible sections in WordPress's order, copy in
 * lib/data/containerTypesContent.ts. Static: the featured cards' national
 * listings are cached. The only client code is the cards' depot swap and the
 * newsletter form.
 */
export default function ContainerTypesPage() {
  const jsonLd = graph([
    ...siteNodes(),
    webPageNode({
      path: ROUTES.CONTAINER_TYPES,
      name: PAGE_NAME,
      description: PAGE_SEO_DEFAULTS[ROUTES.CONTAINER_TYPES]?.description,
    }),
    breadcrumbNode([{ name: 'Home', path: ROUTES.HOME }, { name: PAGE_NAME }]),
    // From the same list the FAQ below renders.
    faqNode(CONTAINER_TYPES_FAQS),
  ])

  // The (market) layout provides <main>.
  return (
    <div className="page-fill bg-white dark:bg-neutral-950">
      <JsonLd data={jsonLd} />
      <PageHeadScripts path={ROUTES.CONTAINER_TYPES} />

      <TypesHero />
      <TypesIntro />
      <SectionTagline2 bg="blue" text={CONTAINER_TYPES_BAND} />

      <section aria-label="Featured shipping containers" className="bg-white px-[5%] pb-4 pt-2 dark:bg-neutral-950">
        <FeaturedContainerCards />
      </section>

      {CONTAINER_TYPE_CATEGORIES.map((category, index) => (
        <TypesCategory key={category.id} category={category} shaded={index % 2 === 0} />
      ))}

      <TypesOptions />
      <SectionTagline2 bg="blue" text={CONTAINER_TYPES_WHY_BAND} />
      <TypesReasons />

      <div className="bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
        <FaqAccordion
          id="types-faq"
          heading={CONTAINER_TYPES_FAQ_HEADING}
          items={CONTAINER_TYPES_FAQS.map((faq) => ({ question: faq.question, answer: <p>{faq.answer}</p> }))}
        />
      </div>

      <CustomerTestimonials heading={CONTAINER_TYPES_TESTIMONIALS_HEADING} />

      <section aria-labelledby="types-newsletter" className="bg-theme-primary px-[5%] py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <h2 id="types-newsletter" className="text-center text-2xl font-extrabold uppercase leading-tight text-white sm:text-3xl">
            {CONTAINER_TYPES_NEWSLETTER_HEADING}
          </h2>
          <div className="mt-8">
            <NewsletterForm tone="dark" />
          </div>
        </div>
      </section>
    </div>
  )
}
