import { YouTubeEmbed } from '@/components/product/YouTubeEmbed'
import { HowItWorks } from '@/components/shared/HowItWorks'
import { JsonLd } from '@/components/shared/JsonLd'
import { LocationSearch } from '@/components/shared/LocationSearch'
import { OfferTabsView } from '@/components/shared/OfferTabs'
import { OnsiteDifference } from '@/components/shared/OnsiteDifference'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { ReviewsSection } from '@/components/shared/ReviewsSection'
import { TrustedBySection } from '@/components/shared/TrustedBySection'
import { ROUTES } from '@/config/routes'
import { allCityDepotParts, allCityPath, resolveAllCitySections, resolveAllCityText } from '@/lib/allCityPage'
import { ALL_CITY_ZIP_ANCHOR } from '@/lib/data/allCityTemplate'
import { OFFER_DEFAULT_PRICES, type OfferPrices } from '@/lib/data/homeOfferTabs'
import { formatMoney } from '@/lib/formatters'
import { getLocationPageSeed } from '@/lib/data/locationPages'
import { locationPath } from '@/lib/locationPage'
import { breadcrumbNode, graph, siteNodes, webPageNode } from '@/lib/schema'
import { getAllCityLists } from '@/services/allCity.service'
import { getDeliveredForDepot } from '@/services/deliveredContainer.service'
import { getDepotLowestUsedBuy, getDepotStartingPrices } from '@/services/search.service'
import { getReviews } from '@/services/review.service'
import { CityBreadcrumbs } from './CityBreadcrumbs'
import { CityDeliveries } from './CityDeliveries'
import { CityFinancing } from './CityFinancing'
import { CityHero } from './CityHero'
import { CityIntro } from './CityIntro'
import { CityLists } from './CityLists'
import { CityPopular } from './CityPopular'
import { CityOfferBand } from './CityOfferBand'
import { CityProducts } from './CityProducts'
import { CitySteps } from './CitySteps'
import type { AllCityDepot, AllCityPage as AllCityPageRecord, AllCityTemplate } from '@/types/allCity'

type Props = {
  page: AllCityPageRecord
  /** The published template, or a draft for the admin preview. */
  template: AllCityTemplate
  depot: AllCityDepot
}

/**
 * One /all-city/ page: WordPress's city template (or its depot-city variant),
 * its visible sections in its order, filled from the page, its depot and the
 * template. Static: the products, lists and reviews are cached reads; the ZIP
 * box, the review slider and the video are the client code.
 */
/** "$1,350", not "$1,350.00"; real cents stay ("$79.99"), as the homepage's tabs show them. */
const priceLabel = (price: number) => formatMoney(price).replace(/\.00$/, '')

export async function AllCityPage({ page, template, depot }: Props) {
  // The depot's id in the delivery records: its location page's (every city depot has one; a test checks).
  const depotId = getLocationPageSeed(depot.locationSlug)?.depotId
  const [reviews, lists, usedFrom, starting, deliveries] = await Promise.all([
    getReviews(),
    getAllCityLists(page.state, page.slug),
    getDepotLowestUsedBuy(depot.depot),
    getDepotStartingPrices(depot.depot),
    depotId === undefined ? [] : getDeliveredForDepot(depotId),
  ])
  // The Buy / Rent / Rent-To-Own tabs' {buy} {rent} {rto}: the page's depot's, else the design's figures.
  const offerPrices: OfferPrices = {
    buy: starting.buy !== null ? priceLabel(starting.buy) : OFFER_DEFAULT_PRICES.buy,
    rent: starting.rent !== null ? priceLabel(starting.rent) : OFFER_DEFAULT_PRICES.rent,
    rto: starting.rto !== null ? priceLabel(starting.rto) : OFFER_DEFAULT_PRICES.rto,
  }
  const text = resolveAllCityText(template, page)
  const sections = resolveAllCitySections(template, page, { depot: depot.depot, depotPage: locationPath(depot.locationSlug), usedFrom })
  const { banner } = allCityDepotParts(depot, page)
  const path = allCityPath(page.slug)
  // The state's list on the /all-city index.
  const stateHref = `${ROUTES.ALL_CITY_INDEX}#state-${page.state.toLowerCase()}`

  const jsonLd = graph([
    ...siteNodes(),
    webPageNode({ path, name: page.seo.title, description: page.seo.description }),
    // The trail the page shows (CityBreadcrumbs).
    breadcrumbNode([
      { name: sections.breadcrumbs.home, path: ROUTES.HOME },
      { name: sections.breadcrumbs.state, path: stateHref },
      { name: sections.breadcrumbs.city },
    ]),
  ])

  // The (market) layout provides <main>.
  return (
    <div className="page-fill bg-white dark:bg-neutral-950">
      <JsonLd data={jsonLd} />
      <PageHeadScripts path={path} />

      {/* The redesigned sections, in the designs' order. */}
      <CityBreadcrumbs {...sections.breadcrumbs} stateHref={stateHref} />
      <CityHero text={sections.hero} background={template.media.heroBackground} />
      <CityProducts text={sections.products} depot={depot.depot} />
      {sections.trustedBy.show && (
        <TrustedBySection
          heading={sections.trustedBy.heading.trim() || null}
          background="bg-neutral-100 dark:bg-neutral-900"
          colour
        />
      )}
      {sections.offers.show && <OfferTabsView tabs={sections.offers.tabs} prices={offerPrices} />}
      {sections.howItWorks.show && (
        <HowItWorks
          eyebrow={sections.howItWorks.eyebrow}
          heading={sections.howItWorks.heading}
          subtitle={sections.howItWorks.subtitle}
          steps={sections.howItWorks.steps}
          button={{ label: sections.howItWorks.button, href: sections.howItWorks.buttonHref }}
          background="bg-neutral-100 dark:bg-theme-dark"
        />
      )}
      {sections.difference.show && (
        <OnsiteDifference
          heading={sections.difference.heading}
          body={sections.difference.body}
          points={sections.difference.points}
          button={sections.difference.button}
          // The template's photo if it sets one, else this page's depot's banner.
          image={
            sections.difference.image
              ? { src: sections.difference.image, alt: `Shipping container delivery in ${page.city}, ${page.state}` }
              : {
                  // The banner's full-size original (1800 x 800): the 1024 x 455 copy is stretched by this tall frame.
                  src: banner.src.replace(/-1024x455(\.\w+)$/, '$1'),
                  alt: `Shipping containers at the ${depot.depot} depot`,
                  // Cropped to the frame's height, it shows at about 2.25 times the frame's width.
                  sizes: '(min-width: 1024px) 100vw, 200vw',
                }
          }
          background="bg-white dark:bg-neutral-950"
          headingColour="text-neutral-900 dark:text-white"
        />
      )}
      {sections.deliveries.show && <CityDeliveries text={sections.deliveries} deliveries={deliveries} />}
      {sections.popular.show && <CityPopular text={sections.popular} cities={lists.popular} />}

      {/* WordPress's sections, until each is redesigned. */}
      <CityIntro
        banner={banner}
        bannerAlt={`Shipping containers at the ${depot.depot} depot`}
        quote={{ label: text.quoteButton, href: template.links.quote }}
        heading={text.introHeading}
        body={text.introBody}
        whyHeading={text.whyHeading}
        whyBody={text.whyBody}
      />

      {/* Its popular half moved up (CityPopular) unless that section is off; the full state list stays: it is how search engines reach every city page. */}
      <CityLists
        popularHeading={text.popularHeading}
        popular={sections.popular.show ? [] : lists.popular}
        viewAllLabel={text.viewAllLabel}
        viewAll={lists.viewAll}
      />

      {template.media.youtubeId && (
        <section aria-label={template.media.videoTitle} className="bg-white px-[5%] pb-10 dark:bg-neutral-950">
          <div className="mx-auto max-w-4xl">
            <YouTubeEmbed video={{ id: template.media.youtubeId, title: template.media.videoTitle }} />
          </div>
        </section>
      )}

      <CitySteps heading={text.stepsHeading} steps={text.steps} />

      <section id={ALL_CITY_ZIP_ANCHOR} aria-labelledby="city-find-prices" className="scroll-mt-24 bg-white px-[5%] pb-12 dark:bg-neutral-950">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="city-find-prices" className="text-xl font-bold text-theme-dark sm:text-2xl dark:text-white">
            {text.locatorHeading}
          </h2>
          <div className="mt-5">
            <LocationSearch tone="onLight" />
          </div>
        </div>
      </section>

      <CityFinancing
        heading={text.financingHeading}
        rental={{ title: text.rentalTitle, body: text.rentalBody }}
        lease={{ title: text.leaseTitle, body: text.leaseBody, button: text.leaseButton, href: template.links.financing }}
      />

      <ReviewsSection heading={text.reviewsHeading} reviews={reviews} />

      {text.offerBand.trim() && <CityOfferBand text={text.offerBand} />}
    </div>
  )
}
