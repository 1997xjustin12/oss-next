import { YouTubeEmbed } from '@/components/product/YouTubeEmbed'
import { AccentText } from '@/components/shared/AccentText'
import { JsonLd } from '@/components/shared/JsonLd'
import { LandingHero } from '@/components/shared/LandingHero'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { SectionTagline2 } from '@/components/shared/SectionTagline2'
import { ROUTES } from '@/config/routes'
import { landingFaqText } from '@/lib/data/containerLandingContent'
import { formatPrice } from '@/lib/formatters'
import { findDepotByPath, findDepotByTitle, toLocalBusinessInput } from '@/lib/locations'
import {
  locationLink,
  locationPath,
  locationPhone,
  locationProductSpecs,
  locationSections,
  resolveLocationText,
} from '@/lib/locationPage'
import { breadcrumbNode, faqNode, graph, localBusinessNode, siteNodes, webPageNode } from '@/lib/schema'
import { getLocationTemplate } from '@/services/locationPage.service'
import { getReviews } from '@/services/review.service'
import { getDepotLowestRent } from '@/services/search.service'
import { LocationBand } from './LocationBand'
import { LocationBlock } from './LocationBlock'
import { LocationBuy } from './LocationBuy'
import { LocationDelivered } from './LocationDelivered'
import { LocationFaq } from './LocationFaq'
import { LocationNewsletter } from './LocationNewsletter'
import { LocationOptions } from './LocationOptions'
import { LocationParagraphs } from './LocationParagraphs'
import { LocationPricingForm } from './LocationPricingForm'
import { LocationProducts } from './LocationProducts'
import { LocationResources } from './LocationResources'
import { LocationSatisfaction } from './LocationSatisfaction'
import { LocationStory } from './LocationStory'
import type { ReactNode } from 'react'
import type { LocationPage, LocationSectionId } from '@/types/locationPage'

type Props = { page: LocationPage }

/**
 * A native location page: the template's sections (or the location's own
 * list), in order, with this location's record, wording and phone. Static;
 * the products, rent and reviews are cached reads, and the review slider, the
 * photo row, the forms and the videos are the client code.
 */
export async function LocationNativePage({ page }: Props) {
  const [template, reviews, lowestRent] = await Promise.all([getLocationTemplate(), getReviews(), getDepotLowestRent(page.depot)])
  const text = resolveLocationText(template, page, lowestRent !== null ? { lowestRent: `$${formatPrice(lowestRent)}` } : {})
  // No rental anywhere in the catalogue: drop the price clause rather than show
  // an unfilled placeholder or a figure nobody can get.
  if (lowestRent === null) text.rental.body = text.rental.body.replace(/,? starting as low as \{lowestRent\} a month/, '')

  const path = locationPath(page.slug)
  const phone = locationPhone(page)
  const sectionIds = locationSections(template, page)
  // By path first, as the catch-all matches; by name when the record's path is wrong (Indianapolis).
  const depot = findDepotByPath(path) ?? findDepotByTitle(page.depot)

  const jsonLd = graph([
    ...siteNodes(),
    webPageNode({ path, name: page.seo.title, description: page.seo.description }),
    breadcrumbNode([{ name: 'Home', path: ROUTES.HOME }, { name: 'Where to Buy', path: ROUTES.WHERE_TO_BUY }, { name: page.place.label }]),
    depot ? localBusinessNode(toLocalBusinessInput(depot, path)) : null,
    // Only for a page that shows its FAQ.
    sectionIds.includes('faq') ? faqNode(template.faqs.map((faq) => ({ question: faq.question, answer: landingFaqText(faq) }))) : null,
  ])

  const sections: Record<LocationSectionId, () => ReactNode> = {
    hero: () => <LandingHero heading={text.hero.heading} tagline={text.hero.tagline} background={template.media.heroBackground} phone={phone} />,
    budgetBand: () => <SectionTagline2 text={text.budgetBand} />,
    options: () => <LocationOptions options={template.options} text={text.options} depot={page.depot} />,
    products: () => (
      <LocationProducts text={text.products} depot={page.depot} specs={locationProductSpecs(template, page)} href={locationLink(page, 'products')} />
    ),
    buy: () => <LocationBuy text={text.buy} page={page} href={locationLink(page, 'buy')} phone={phone} />,
    delivered: () => <LocationDelivered heading={text.delivered.heading} photos={[...page.deliveredLead, ...template.deliveredPhotos]} />,
    satisfaction: () => <LocationSatisfaction text={text.satisfaction} seal={template.media.satisfactionSeal} reviews={reviews} />,
    callBand: () => <LocationBand text={text.callBand} variant="call" phone={phone} />,
    featured: () =>
      page.featured ? (
        <LocationStory
          id="location-featured"
          label={text.stories.featuredLabel}
          story={page.featured}
          readMore={text.stories.readMore}
          readLess={text.stories.readLess}
          imageSide="left"
        />
      ) : null,
    news: () =>
      page.news ? (
        <LocationStory
          id="location-news"
          label={text.stories.newsLabel}
          story={page.news}
          readMore={text.stories.readMore}
          readLess={text.stories.readLess}
          imageSide="right"
        />
      ) : null,
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
        <div className="mt-4">
          <LocationParagraphs text={text.overview.body} phone={phone} />
        </div>
      </section>
    ),
    purchase: () => (
      <LocationBlock id="location-purchase" text={text.purchase} image={template.media.purchaseImage} href={locationLink(page, 'purchase')} phone={phone} imageSide="right" />
    ),
    rental: () => (
      <LocationBlock id="location-rental" text={text.rental} image={template.media.rentalImage} href={locationLink(page, 'rental')} phone={phone} imageSide="left" />
    ),
    rto: () => <LocationBlock id="location-rto" text={text.rto} image={template.media.rtoImage} href={locationLink(page, 'rto')} phone={phone} imageSide="right" />,
    closingBand: () => <LocationBand text={text.closingBand} variant="closing" phone={phone} />,
    resources: () => <LocationResources heading={text.resources.heading} resources={page.resources ?? []} />,
    pricingForm: () => <LocationPricingForm heading={text.pricingForm.heading} />,
    newsletter: () => <LocationNewsletter text={text.newsletter} />,
    faq: () => <LocationFaq heading={text.faq.heading} faqs={template.faqs} youtubeId={page.faqYoutubeId} videoTitle={`${page.place.label} shipping containers`} />,
  }

  // The (market) layout provides <main>.
  return (
    <div className="page-fill bg-white dark:bg-neutral-950">
      <JsonLd data={jsonLd} />
      <PageHeadScripts path={path} />
      {sectionIds.map((id) => (
        <div key={id} className="contents">
          {sections[id]()}
        </div>
      ))}
    </div>
  )
}
