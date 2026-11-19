import { HowItWorks } from '@/components/shared/HowItWorks'
import { JsonLd } from '@/components/shared/JsonLd'
import { OfferTabsView } from '@/components/shared/OfferTabs'
import { OnsiteDifference } from '@/components/shared/OnsiteDifference'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { QuoteForm } from '@/components/shared/QuoteForm'
import { TrustedBySection } from '@/components/shared/TrustedBySection'
import { ROUTES } from '@/config/routes'
import { allCityDepotParts, allCityPath, resolveAllCitySections, templatePlainText } from '@/lib/allCityPage'
import { OFFER_DEFAULT_PRICES, type OfferPrices } from '@/lib/data/homeOfferTabs'
import { getLocationPageSeed } from '@/lib/data/locationPages'
import { formatMoney } from '@/lib/formatters'
import { locationPath } from '@/lib/locationPage'
import { CONTACT_NUMBER } from '@/lib/helpers'
import { breadcrumbNode, faqNode, graph, siteNodes, webPageNode } from '@/lib/schema'
import { getAllCityLists } from '@/services/allCity.service'
import { getDeliveredForDepot } from '@/services/deliveredContainer.service'
import { getDepotLowestUsedBuy, getDepotStartingPrices } from '@/services/search.service'
import { CityBreadcrumbs } from './CityBreadcrumbs'
import { CityDeliveries } from './CityDeliveries'
import { CityFaq } from './CityFaq'
import { CityHero } from './CityHero'
import { CityPopular } from './CityPopular'
import { CityProducts } from './CityProducts'
import type { AllCityDepot, AllCityPage as AllCityPageRecord, AllCityTemplate } from '@/types/allCity'

type Props = {
  page: AllCityPageRecord
  /** The published template, or a draft for the admin preview. */
  template: AllCityTemplate
  depot: AllCityDepot
}

/** "$1,350", not "$1,350.00"; real cents stay ("$79.99"), as the homepage's tabs show them. */
const priceLabel = (price: number) => formatMoney(price).replace(/\.00$/, '')

/**
 * One /all-city/ page: the template's sections (the 2026-11-18/19 redesign),
 * top to bottom, each switched and worded in Admin → All City Pages →
 * Template, filled from the page and its depot. Static: every read is cached
 * (prices, cards, deliveries, the state's lists). The client code is small:
 * the Buy / Rent / Rent-To-Own tabs, the delivery carousel's arrows and the
 * Zoho quote form. The FAQ is also the page's FAQPage structured data.
 */
export async function AllCityPage({ page, template, depot }: Props) {
  // The depot's id in the delivery records: its location page's (every city depot has one; a test checks).
  const depotId = getLocationPageSeed(depot.locationSlug)?.depotId
  const [lists, usedFrom, starting, deliveries] = await Promise.all([
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
  const sections = resolveAllCitySections(template, page, {
    depot: depot.depot,
    depotPage: locationPath(depot.locationSlug),
    usedFrom,
    // Real prices only (not the tabs' fallback figures): an FAQ quoting one the depot lacks is left out.
    rentFrom: starting.rent !== null ? priceLabel(starting.rent) : null,
    rtoFrom: starting.rto !== null ? priceLabel(starting.rto) : null,
  })
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
    // The questions the page shows (CityFaq), as plain text.
    sections.faq.show
      ? faqNode(sections.faq.items.map((item) => ({ question: templatePlainText(item.question, CONTACT_NUMBER), answer: templatePlainText(item.answer, CONTACT_NUMBER) })))
      : null,
  ])

  // The (market) layout provides <main>.
  return (
    <div className="page-fill bg-white dark:bg-neutral-950">
      <JsonLd data={jsonLd} />
      <PageHeadScripts path={path} />

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
      {/* Off, it still renders its "View all cities" list: how search engines reach every city page. */}
      <CityPopular text={sections.popular} cities={lists.popular} viewAll={lists.viewAll} listOnly={!sections.popular.show} />
      {sections.quote.show && <QuoteForm heading={sections.quote.heading} body={sections.quote.body} points={sections.quote.points} />}
      {sections.faq.show && <CityFaq text={sections.faq} />}
    </div>
  )
}
