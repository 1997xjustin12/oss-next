import { LocationFeaturedContainers } from '@/components/product/LocationFeaturedContainers'
import { YouTubeEmbed } from '@/components/product/YouTubeEmbed'
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
import { RENTAL_FAQS, RENTAL_FEATURED_SPECS, RENTAL_HERO, RENTAL_PRODUCT_NAME, RENTAL_VIDEO } from '@/lib/data/rentalContent'
import { aggregateOfferProductNode, breadcrumbNode, faqNode, graph, siteNodes, webPageNode } from '@/lib/schema'
import { resolvePageMetadata } from '@/lib/seo'
import { getReviews } from '@/services/review.service'
import { getNationalFeaturedContainers } from '@/services/search.service'
import { RentalFinancing } from './_components/RentalFinancing'
import { RentalIntro } from './_components/RentalIntro'
import { RentalProducts } from './_components/RentalProducts'
import { RentalWhy } from './_components/RentalWhy'

const PAGE_NAME = 'Shipping Container Rental'

export function generateMetadata() {
  return resolvePageMetadata(ROUTES.RENTAL)
}

/**
 * Shipping container rental, native since 2026-11-06 at the URL WordPress
 * served it from. Its visible sections in WordPress's order; copy in
 * lib/data/rentalContent.ts, the parts it shares with the for-sale page in
 * containerLandingContent.ts. Static: the reviews and the national rental
 * prices (for the Product structured data) are cached reads; the ZIP boxes,
 * the featured row, the review slider and the video are the client code.
 */
export default async function RentalPage() {
  const [reviews, rentals] = await Promise.all([getReviews(), getNationalFeaturedContainers(RENTAL_FEATURED_SPECS, 'rental')])

  const jsonLd = graph([
    ...siteNodes(),
    webPageNode({ path: ROUTES.RENTAL, name: PAGE_NAME, description: PAGE_SEO_DEFAULTS[ROUTES.RENTAL]?.description }),
    breadcrumbNode([{ name: 'Home', path: ROUTES.HOME }, { name: PAGE_NAME }]),
    // WordPress declared this Product (a rental, with the rating and a price
    // range); its range now comes from the live national rental listings.
    aggregateOfferProductNode({ name: RENTAL_PRODUCT_NAME, products: rentals.map(({ product }) => product) }),
    // WordPress declared no FAQPage, but the FAQ is visible, so it has one.
    faqNode(RENTAL_FAQS.map((faq) => ({ question: faq.question, answer: landingFaqText(faq) }))),
  ])

  // The (market) layout provides <main>.
  return (
    <div className="page-fill bg-white dark:bg-neutral-950">
      <JsonLd data={jsonLd} />
      <PageHeadScripts path={ROUTES.RENTAL} />

      <LandingHero heading={RENTAL_HERO.heading} />
      <SectionTagline2 text={BUDGET_BAND} />
      <RentalIntro />
      <LocationFeaturedContainers specs={RENTAL_FEATURED_SPECS} paymentType="rental" className="pb-12 sm:pb-16" />
      <LandingInstantPricing bg="blue" ptype="rental" />
      <RentalWhy />
      <LandingThreeSteps ptype="rental" />
      <LandingSocialProof reviews={reviews} />

      <section aria-label={RENTAL_VIDEO.title} className="bg-white px-[5%] pb-12 sm:pb-16 dark:bg-neutral-950">
        <div className="mx-auto max-w-4xl">
          <YouTubeEmbed video={RENTAL_VIDEO} />
        </div>
      </section>

      <RentalProducts />
      <RentalFinancing />
      <LandingFaqSection faqs={RENTAL_FAQS} />
    </div>
  )
}
