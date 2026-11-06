import { LocationFeaturedContainers } from '@/components/product/LocationFeaturedContainers'
import { JsonLd } from '@/components/shared/JsonLd'
import { LandingFaqSection } from '@/components/shared/LandingFaqSection'
import { LandingHero } from '@/components/shared/LandingHero'
import { LandingInstantPricing } from '@/components/shared/LandingInstantPricing'
import { LandingSocialProof } from '@/components/shared/LandingSocialProof'
import { LandingThreeSteps } from '@/components/shared/LandingThreeSteps'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { SectionTagline2 } from '@/components/shared/SectionTagline2'
import { PAGE_SEO_DEFAULTS } from '@/config/pageSeoDefaults'
import { ROUTES } from '@/config/routes'
import { BUDGET_BAND, landingFaqText } from '@/lib/data/containerLandingContent'
import { FOR_SALE_FAQS, FOR_SALE_FEATURED_SPECS, FOR_SALE_HERO } from '@/lib/data/forSaleContent'
import { breadcrumbNode, faqNode, graph, siteNodes, webPageNode } from '@/lib/schema'
import { resolvePageMetadata } from '@/lib/seo'
import { getReviews } from '@/services/review.service'
import { ForSaleGuarantee } from './_components/ForSaleGuarantee'
import { ForSaleIntro } from './_components/ForSaleIntro'
import { ForSaleOptions } from './_components/ForSaleOptions'
import { ForSaleSteps } from './_components/ForSaleSteps'
import { ForSaleTypes } from './_components/ForSaleTypes'
import { ForSaleWhy } from './_components/ForSaleWhy'

const PAGE_NAME = 'Shipping Containers for Sale'

export function generateMetadata() {
  return resolvePageMetadata(ROUTES.FOR_SALE)
}

/**
 * Shipping containers for sale, native since 2026-11-06 at the URL WordPress
 * served it from. Its visible sections in WordPress's order; copy in
 * lib/data/forSaleContent.ts, the parts it shares with the rental page in
 * containerLandingContent.ts. Static: the reviews read is cached; the ZIP
 * boxes, the featured row, the review slider and the video are the client code.
 */
export default async function ForSalePage() {
  const reviews = await getReviews()

  const jsonLd = graph([
    ...siteNodes(),
    webPageNode({ path: ROUTES.FOR_SALE, name: PAGE_NAME, description: PAGE_SEO_DEFAULTS[ROUTES.FOR_SALE]?.description }),
    breadcrumbNode([{ name: 'Home', path: ROUTES.HOME }, { name: PAGE_NAME }]),
    // WordPress declared FAQPage too; from the same list the FAQ below renders.
    faqNode(FOR_SALE_FAQS.map((faq) => ({ question: faq.question, answer: landingFaqText(faq) }))),
  ])

  // The (market) layout provides <main>.
  return (
    <div className="page-fill bg-white dark:bg-neutral-950">
      <JsonLd data={jsonLd} />
      <PageHeadScripts path={ROUTES.FOR_SALE} />

      <LandingHero heading={FOR_SALE_HERO.heading} />
      <SectionTagline2 text={BUDGET_BAND} />
      <ForSaleIntro />
      <LocationFeaturedContainers specs={FOR_SALE_FEATURED_SPECS} className="pb-12 sm:pb-16" />
      <LandingInstantPricing bg="red" ptype="buy" />
      <ForSaleSteps />
      <LandingThreeSteps ptype="buy" />
      <LandingSocialProof reviews={reviews} />
      <ForSaleWhy />
      <ForSaleTypes />
      <ForSaleOptions />
      <ForSaleGuarantee />
      <LandingFaqSection faqs={FOR_SALE_FAQS} />
    </div>
  )
}
