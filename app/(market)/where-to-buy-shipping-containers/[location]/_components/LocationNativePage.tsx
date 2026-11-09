import { YouTubeEmbed } from '@/components/product/YouTubeEmbed'
import { AccentText } from '@/components/shared/AccentText'
import { JsonLd } from '@/components/shared/JsonLd'
import { LandingHero } from '@/components/shared/LandingHero'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { SectionTagline2 } from '@/components/shared/SectionTagline2'
import { ROUTES } from '@/config/routes'
import { formatPrice } from '@/lib/formatters'
import { findDepotByPath, toLocalBusinessInput } from '@/lib/locations'
import { locationListingHref, locationPath, resolveLocationText } from '@/lib/locationPage'
import { breadcrumbNode, graph, localBusinessNode, siteNodes, webPageNode } from '@/lib/schema'
import { getLocationTemplate } from '@/services/locationPage.service'
import { getReviews } from '@/services/review.service'
import { getDepotLowestRent } from '@/services/search.service'
import { LocationBand } from './LocationBand'
import { LocationBlock } from './LocationBlock'
import { LocationBuy } from './LocationBuy'
import { LocationDelivered } from './LocationDelivered'
import { LocationOptions } from './LocationOptions'
import { LocationProducts } from './LocationProducts'
import { LocationRichText } from './LocationRichText'
import { LocationSatisfaction } from './LocationSatisfaction'
import { LocationStory } from './LocationStory'
import type { ReactNode } from 'react'
import type { LocationPage, LocationSectionId } from '@/types/locationPage'

type Props = { page: LocationPage }

/**
 * A native location page: the template's sections, in its order, with this
 * location's record and wording. Static; the products and reviews are cached
 * reads, and the review slider, the photo row and the video are the client code.
 */
export async function LocationNativePage({ page }: Props) {
  const [template, reviews, lowestRent] = await Promise.all([getLocationTemplate(), getReviews(), getDepotLowestRent(page.depot)])
  const text = resolveLocationText(template, page, lowestRent !== null ? { lowestRent: `$${formatPrice(lowestRent)}` } : {})
  // No rental anywhere in the catalogue: drop the price clause rather than show
  // an unfilled placeholder or a figure nobody can get.
  if (lowestRent === null) text.rental.body = text.rental.body.replace(/,? starting as low as \{lowestRent\} a month/, '')
  const path = locationPath(page.slug)
  const name = `${page.place.city}, ${page.place.region}`
  const depot = findDepotByPath(path)

  const jsonLd = graph([
    ...siteNodes(),
    webPageNode({ path, name: page.seo.title, description: page.seo.description }),
    breadcrumbNode([{ name: 'Home', path: ROUTES.HOME }, { name: 'Where to Buy', path: ROUTES.WHERE_TO_BUY }, { name }]),
    depot ? localBusinessNode(toLocalBusinessInput(depot, path)) : null,
  ])

  const sections: Record<LocationSectionId, () => ReactNode> = {
    hero: () => <LandingHero heading={text.hero.heading} tagline={text.hero.tagline} background={template.media.heroBackground} />,
    budgetBand: () => <SectionTagline2 text={text.budgetBand} />,
    options: () => <LocationOptions options={template.options} text={text.options} depot={page.depot} />,
    products: () => <LocationProducts text={text.products} depot={page.depot} specs={template.productSpecs} />,
    buy: () => <LocationBuy text={text.buy} page={page} />,
    delivered: () => <LocationDelivered heading={text.delivered.heading} photos={[...page.deliveredLead, ...template.deliveredPhotos]} />,
    satisfaction: () => <LocationSatisfaction text={text.satisfaction} seal={template.media.satisfactionSeal} reviews={reviews} />,
    callBand: () => <LocationBand text={text.callBand} variant="call" />,
    featured: () => (
      <LocationStory
        id="location-featured"
        label={text.stories.featuredLabel}
        story={page.featured}
        readMore={text.stories.readMore}
        readLess={text.stories.readLess}
        imageSide="left"
      />
    ),
    news: () => (
      <LocationStory
        id="location-news"
        label={text.stories.newsLabel}
        story={page.news}
        readMore={text.stories.readMore}
        readLess={text.stories.readLess}
        imageSide="right"
      />
    ),
    video: () =>
      template.media.youtubeId ? (
        <section aria-label={text.video.title} className="bg-white px-[5%] py-8 dark:bg-neutral-950">
          <YouTubeEmbed video={{ id: template.media.youtubeId, title: text.video.title }} />
        </section>
      ) : null,
    overview: () => (
      <section aria-labelledby="location-overview" className="bg-white px-[5%] py-10 sm:py-12 dark:bg-neutral-950">
        <h2 id="location-overview" className="text-3xl font-semibold leading-tight text-theme-dark sm:text-4xl dark:text-white">
          <AccentText text={text.overview.heading} accentClassName="text-theme-primary dark:text-red-400" />
        </h2>
        <p className="mt-4 text-base leading-relaxed text-theme-mid sm:text-lg dark:text-neutral-300">
          <LocationRichText text={text.overview.body} />
        </p>
      </section>
    ),
    purchase: () => (
      <LocationBlock id="location-purchase" text={text.purchase} image={template.media.purchaseImage} href={locationListingHref(page.depot)} imageSide="right" />
    ),
    rental: () => (
      <LocationBlock id="location-rental" text={text.rental} image={template.media.rentalImage} href={locationListingHref(page.depot, 'rental')} imageSide="left" />
    ),
    rto: () => (
      <LocationBlock id="location-rto" text={text.rto} image={template.media.rtoImage} href={locationListingHref(page.depot, 'rto')} imageSide="right" />
    ),
    closingBand: () => <LocationBand text={text.closingBand} variant="closing" />,
  }

  // The (market) layout provides <main>.
  return (
    <div className="page-fill bg-white dark:bg-neutral-950">
      <JsonLd data={jsonLd} />
      <PageHeadScripts path={path} />
      {template.sections
        .filter((section) => section.enabled)
        .map((section) => (
          <div key={section.id} className="contents">
            {sections[section.id]()}
          </div>
        ))}
    </div>
  )
}
