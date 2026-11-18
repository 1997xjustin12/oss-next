import { HowItWorks } from '@/app/(market)/(home)/_components/HowItWorks'
import { HomeReviews } from '@/app/(market)/(home)/_components/HomeReviews'
import { RightContainer } from '@/app/(market)/(home)/_components/RightContainer'
import { JsonLd } from '@/components/shared/JsonLd'
import { LocationSearch } from '@/components/shared/LocationSearch'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { PAGE_SEO_DEFAULTS } from '@/config/pageSeoDefaults'
import { ROUTES } from '@/config/routes'
import { breadcrumbNode, graph, siteNodes, webPageNode } from '@/lib/schema'
import { resolvePageMetadata } from '@/lib/seo'
import { getAllCityDirectory, getAllCityTemplate } from '@/services/allCity.service'
import { getReviews } from '@/services/review.service'
import { AllCityIndexHero } from './_components/AllCityIndexHero'
import { StateCityDirectory } from './_components/StateCityDirectory'

export function generateMetadata() {
  return resolvePageMetadata(ROUTES.ALL_CITY_INDEX)
}

const PRICING_ANCHOR = 'find-local-pricing'
const TITLE = 'Shipping Containers For Sale & Rent In Your City'

/**
 * /all-city: the index of the 8,500 city pages beneath it, native since
 * 2026-11-18 (WordPress had none and sent the URL to the homepage). No design
 * of its own: its hero and state directory in the city pages' style, then the
 * homepage's sections (containers with local prices, how it works, reviews)
 * and the city pages' ZIP box.
 *
 * Static: every read is cached (the per-state city lists, the template, the
 * reviews), and publishing a city page refreshes its state's list here too.
 * The client code is the homepage's: the cards' local prices, the ZIP box and
 * the review carousel.
 */
export default async function AllCityIndexPage() {
  const [states, template, reviews] = await Promise.all([getAllCityDirectory(), getAllCityTemplate(), getReviews()])
  const total = states.reduce((sum, s) => sum + s.count, 0)
  // Rounded down to the hundred, so the copy never claims more than there are.
  const cityCount = `${new Intl.NumberFormat('en-US').format(Math.floor(total / 100) * 100)}+`

  const jsonLd = graph([
    ...siteNodes(),
    webPageNode({ path: ROUTES.ALL_CITY_INDEX, name: TITLE, description: PAGE_SEO_DEFAULTS[ROUTES.ALL_CITY_INDEX]?.description }),
    breadcrumbNode([{ name: 'Home', path: ROUTES.HOME }, { name: 'All Cities' }]),
  ])

  // The (market) layout provides <main>.
  return (
    <div className="page-fill bg-white dark:bg-neutral-950">
      <JsonLd data={jsonLd} />
      <PageHeadScripts path={ROUTES.ALL_CITY_INDEX} />

      <AllCityIndexHero background={template.media.heroBackground} states={states} cityCount={cityCount} pricingAnchor={PRICING_ANCHOR} />
      <StateCityDirectory states={states} />
      <RightContainer />
      <HowItWorks />

      <section id={PRICING_ANCHOR} aria-labelledby="all-city-pricing" className="scroll-mt-24 bg-white px-[5%] pb-12 sm:pb-16 dark:bg-neutral-950">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="all-city-pricing" className="text-xl font-bold text-theme-dark sm:text-2xl dark:text-white">
            Get Local Pricing For Your ZIP Code
          </h2>
          <div className="mt-5">
            <LocationSearch tone="onLight" />
          </div>
        </div>
      </section>

      <HomeReviews reviews={reviews} />
    </div>
  )
}
