import { CustomerTestimonials } from '@/components/shared/CustomerTestimonials'
import { JsonLd } from '@/components/shared/JsonLd'
import { NewsletterForm } from '@/components/shared/NewsletterForm'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { SectionTagline2 } from '@/components/shared/SectionTagline2'
import { PAGE_SEO_DEFAULTS } from '@/config/pageSeoDefaults'
import { ROUTES } from '@/config/routes'
import {
  REEFER_HERO,
  REEFER_NEWSLETTER_HEADING,
  REEFER_POWER_BAND,
  REEFER_TESTIMONIALS_HEADING,
} from '@/lib/data/reeferContent'
import { breadcrumbNode, graph, siteNodes, webPageNode } from '@/lib/schema'
import { resolvePageMetadata } from '@/lib/seo'
import { ReeferHero } from './_components/ReeferHero'
import { ReeferIntro } from './_components/ReeferIntro'
import { ReeferNonWorking } from './_components/ReeferNonWorking'
import { ReeferOptions } from './_components/ReeferOptions'
import { ReeferPower } from './_components/ReeferPower'

export function generateMetadata() {
  return resolvePageMetadata(ROUTES.REEFER)
}

/**
 * Refrigerated containers, native since 2026-11-06 at the URL WordPress served
 * it from. Its visible sections in WordPress's order, copy in
 * lib/data/reeferContent.ts. Static; the newsletter form is the only client code.
 */
export default function ReeferPage() {
  const jsonLd = graph([
    ...siteNodes(),
    webPageNode({
      path: ROUTES.REEFER,
      name: REEFER_HERO.heading,
      description: PAGE_SEO_DEFAULTS[ROUTES.REEFER]?.description,
    }),
    breadcrumbNode([{ name: 'Home', path: ROUTES.HOME }, { name: REEFER_HERO.heading }]),
  ])

  // The (market) layout provides <main>.
  return (
    <div className="page-fill bg-white dark:bg-neutral-950">
      <JsonLd data={jsonLd} />
      <PageHeadScripts path={ROUTES.REEFER} />

      <ReeferHero />
      <ReeferIntro />
      <SectionTagline2 bg="blue" text={REEFER_POWER_BAND} />
      <ReeferPower />
      <ReeferNonWorking />
      <ReeferOptions />
      <CustomerTestimonials heading={REEFER_TESTIMONIALS_HEADING} />

      <section aria-labelledby="reefer-newsletter" className="bg-theme-primary px-[5%] py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <h2 id="reefer-newsletter" className="text-center text-2xl font-extrabold uppercase leading-tight text-white sm:text-3xl">
            {REEFER_NEWSLETTER_HEADING}
          </h2>
          <div className="mt-8">
            <NewsletterForm tone="dark" />
          </div>
        </div>
      </section>
    </div>
  )
}
