import { YouTubeEmbed } from '@/components/product/YouTubeEmbed'
import { JsonLd } from '@/components/shared/JsonLd'
import { LocationSearch } from '@/components/shared/LocationSearch'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { ReviewsSection } from '@/components/shared/ReviewsSection'
import { ROUTES } from '@/config/routes'
import { allCityDepotParts, allCityOtherHref, allCityPath, resolveAllCityText } from '@/lib/allCityPage'
import { ALL_CITY_ZIP_ANCHOR } from '@/lib/data/allCityTemplate'
import { locationPath } from '@/lib/locationPage'
import { breadcrumbNode, graph, siteNodes, webPageNode } from '@/lib/schema'
import { getAllCityLists } from '@/services/allCity.service'
import { getReviews } from '@/services/review.service'
import { CityFinancing } from './CityFinancing'
import { CityHero } from './CityHero'
import { CityIntro } from './CityIntro'
import { CityLists } from './CityLists'
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
export async function AllCityPage({ page, template, depot }: Props) {
  const [reviews, lists] = await Promise.all([getReviews(), getAllCityLists(page.state, page.slug)])
  const text = resolveAllCityText(template, page)
  const { banner, specs } = allCityDepotParts(depot, page)
  const path = allCityPath(page.slug)
  const depotHref = locationPath(depot.locationSlug)
  const depotCity = page.variant === 'depotCity'

  const jsonLd = graph([
    ...siteNodes(),
    webPageNode({ path, name: page.seo.title, description: page.seo.description }),
    breadcrumbNode([
      { name: 'Home', path: ROUTES.HOME },
      { name: 'Where to Buy', path: ROUTES.WHERE_TO_BUY },
      { name: depot.depot, path: depotHref },
      { name: page.city },
    ]),
  ])

  // The (market) layout provides <main>.
  return (
    <div className="page-fill bg-white dark:bg-neutral-950">
      <JsonLd data={jsonLd} />
      <PageHeadScripts path={path} />

      <CityHero
        city={page.city}
        body={text.heroBody}
        depotButton={{ label: text.depotButton, href: depotHref }}
        otherButton={{ label: text.otherButton, href: allCityOtherHref(text, depot) }}
        background={template.media.heroBackground}
        pinIcon={template.media.pinIcon}
        cityIsHeading={depotCity}
      />

      <CityIntro
        banner={banner}
        bannerAlt={`Shipping containers at the ${depot.depot} depot`}
        quote={{ label: text.quoteButton, href: template.links.quote }}
        heading={text.introHeading}
        body={text.introBody}
        whyHeading={text.whyHeading}
        whyBody={text.whyBody}
      />

      <CityProducts
        heading={depotCity ? page.keywordHeading || page.h1 : page.h1}
        headingLevel={depotCity ? 'h2' : 'h1'}
        depot={depot.depot}
        specs={specs}
        seeMore={{ label: text.seeMore, href: depotHref }}
      />

      <CityLists popularHeading={text.popularHeading} popular={lists.popular} viewAllLabel={text.viewAllLabel} viewAll={lists.viewAll} />

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
