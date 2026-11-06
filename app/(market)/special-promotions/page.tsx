import { FeaturedContainerCards } from '@/components/product/FeaturedContainerCards'
import { CustomerTestimonials } from '@/components/shared/CustomerTestimonials'
import { JsonLd } from '@/components/shared/JsonLd'
import { NewsletterForm } from '@/components/shared/NewsletterForm'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { PAGE_SEO_DEFAULTS } from '@/config/pageSeoDefaults'
import { ROUTES } from '@/config/routes'
import { PROMO_HEADING, PROMO_NEWSLETTER_HEADING, PROMO_TESTIMONIALS_HEADING } from '@/lib/data/specialPromotionsContent'
import { breadcrumbNode, graph, siteNodes, webPageNode } from '@/lib/schema'
import { resolvePageMetadata } from '@/lib/seo'
import { PromoContainerTypes } from './_components/PromoContainerTypes'
import { PromoGiveaways } from './_components/PromoGiveaways'
import { PromoOptions } from './_components/PromoOptions'
import { PromoRentalDeals } from './_components/PromoRentalDeals'
import { PromoTerms } from './_components/PromoTerms'

const PAGE_NAME = 'Special Promotions'

export function generateMetadata() {
  return resolvePageMetadata(ROUTES.SPECIAL_PROMOTIONS)
}

/**
 * Special promotions, native since 2026-11-06 at the URL WordPress served it
 * from. Its visible sections in WordPress's order, copy in
 * lib/data/specialPromotionsContent.ts; WordPress's product row is the shared
 * featured cards. Static; the cards' depot prices and the newsletter form are
 * the only client code.
 */
export default function SpecialPromotionsPage() {
  const jsonLd = graph([
    ...siteNodes(),
    webPageNode({
      path: ROUTES.SPECIAL_PROMOTIONS,
      name: PAGE_NAME,
      description: PAGE_SEO_DEFAULTS[ROUTES.SPECIAL_PROMOTIONS]?.description,
    }),
    breadcrumbNode([{ name: 'Home', path: ROUTES.HOME }, { name: PAGE_NAME }]),
  ])

  // The (market) layout provides <main>.
  return (
    <div className="page-fill bg-white dark:bg-neutral-950">
      <JsonLd data={jsonLd} />
      <PageHeadScripts path={ROUTES.SPECIAL_PROMOTIONS} />

      <section className="bg-[#0F3A59] p-5">
        <h1 className="text-center text-[32px] font-bold uppercase leading-tight text-white">{PROMO_HEADING}</h1>
      </section>

      <section aria-label="Featured containers" className="bg-white px-[5%] dark:bg-neutral-950">
        <FeaturedContainerCards />
      </section>

      <PromoGiveaways />
      <PromoRentalDeals />
      <PromoContainerTypes />
      <PromoOptions />
      <CustomerTestimonials heading={PROMO_TESTIMONIALS_HEADING} />
      <PromoTerms />

      <section aria-labelledby="promo-newsletter" className="bg-theme-primary px-[5%] py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <h2 id="promo-newsletter" className="text-center text-2xl font-extrabold uppercase leading-tight text-white sm:text-3xl">
            {PROMO_NEWSLETTER_HEADING}
          </h2>
          <div className="mt-8">
            <NewsletterForm tone="dark" />
          </div>
        </div>
      </section>
    </div>
  )
}
