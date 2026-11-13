import { YouTubeEmbed } from '@/components/product/YouTubeEmbed'
import { JsonLd } from '@/components/shared/JsonLd'
import { LocationSearch } from '@/components/shared/LocationSearch'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { ReviewsSection } from '@/components/shared/ReviewsSection'
import { ROUTES } from '@/config/routes'
import { ALL_CITY_LINKS, ALL_CITY_TEXT, ALL_CITY_VIDEO } from '@/lib/data/allCityContent'
import { ALL_CITY_LISTS } from '@/lib/data/allCityLists'
import { locationPath } from '@/lib/locationPage'
import { breadcrumbNode, graph, siteNodes, webPageNode } from '@/lib/schema'
import { getReviews } from '@/services/review.service'
import { CityFinancing } from './CityFinancing'
import { CityHero } from './CityHero'
import { CityIntro } from './CityIntro'
import { CityLists } from './CityLists'
import { CityProducts } from './CityProducts'
import { CitySteps } from './CitySteps'
import type { AllCityLink, AllCityPage as AllCityPageRecord } from '@/types/allCity'

type Props = { page: AllCityPageRecord }

/** The ZIP box the steps' "Enter zip/postal code" link scrolls to. */
const ZIP_ANCHOR = 'find-prices'

/**
 * One /all-city/ page: WordPress's city template, its visible sections in its
 * order (copy in lib/data/allCityContent.ts, the record in allCityPages.ts).
 * Static: the products and reviews are cached reads; the ZIP box, the review
 * slider and the video are the client code.
 */
export async function AllCityPage({ page }: Props) {
  const reviews = await getReviews()
  const { depot } = page
  const path = ROUTES.ALL_CITY(page.slug)
  const depotHref = locationPath(depot.locationSlug)

  // The state's two lists, without this page (WordPress left the current post out of both).
  const lists = ALL_CITY_LISTS[depot.state]
  const toLinks = (list: readonly (readonly [string, string])[] = []): AllCityLink[] =>
    list.filter(([slug]) => slug !== page.slug).map(([slug, city]) => ({ slug, city }))

  const jsonLd = graph([
    ...siteNodes(),
    webPageNode({ path, name: page.seoTitle, description: page.seoDescription }),
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
        body={ALL_CITY_TEXT.hero.body}
        depotButton={{ label: ALL_CITY_TEXT.hero.depotButton, href: depotHref }}
        otherButton={{ label: ALL_CITY_TEXT.hero.otherButton, href: depot.otherPricesHref }}
      />

      <CityIntro
        banner={depot.banner}
        bannerAlt={`Shipping containers at the ${depot.depot} depot`}
        quote={{ label: ALL_CITY_TEXT.quoteButton, href: ALL_CITY_LINKS.quote }}
        heading={ALL_CITY_TEXT.intro.heading(page.city)}
        paragraphs={ALL_CITY_TEXT.intro.paragraphs(page.city)}
        whyHeading={ALL_CITY_TEXT.why.heading}
        why={ALL_CITY_TEXT.why.paragraphs(page.city)}
      />

      <CityProducts heading={page.h1} depot={depot.depot} specs={depot.specs} seeMore={{ label: ALL_CITY_TEXT.seeMore, href: depotHref }} />

      <CityLists
        popularHeading={ALL_CITY_TEXT.popularHeading(depot.stateName)}
        popular={toLinks(lists?.popular)}
        viewAllLabel={ALL_CITY_TEXT.viewAllLabel(depot.stateName)}
        viewAll={toLinks(lists?.viewAll)}
      />

      <section aria-label={ALL_CITY_VIDEO.title} className="bg-white px-[5%] pb-10 dark:bg-neutral-950">
        <div className="mx-auto max-w-4xl">
          <YouTubeEmbed video={ALL_CITY_VIDEO} />
        </div>
      </section>

      <CitySteps heading={ALL_CITY_TEXT.steps.heading(page.city)} steps={ALL_CITY_TEXT.steps.items} zipAnchor={`#${ZIP_ANCHOR}`} />

      <section id={ZIP_ANCHOR} aria-labelledby="city-find-prices" className="scroll-mt-24 bg-white px-[5%] pb-12 dark:bg-neutral-950">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="city-find-prices" className="text-xl font-bold text-theme-dark sm:text-2xl dark:text-white">
            {ALL_CITY_TEXT.locatorHeading}
          </h2>
          <div className="mt-5">
            <LocationSearch tone="onLight" />
          </div>
        </div>
      </section>

      <CityFinancing
        heading={ALL_CITY_TEXT.financing.heading}
        rental={ALL_CITY_TEXT.financing.rental}
        lease={{ ...ALL_CITY_TEXT.financing.lease, href: ALL_CITY_LINKS.financing }}
      />

      <ReviewsSection heading={ALL_CITY_TEXT.reviewsHeading} reviews={reviews} />
    </div>
  )
}
