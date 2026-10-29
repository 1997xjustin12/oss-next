import { ReviewsSection } from '@/components/shared/ReviewsSection'
import { GBP_REVIEWS_HEADING } from '@/lib/data/gbpShared'
import { gbpTelHref } from '@/lib/gbp'
import { GbpAbout } from './GbpAbout'
import { GbpFaq } from './GbpFaq'
import { GbpFooter } from './GbpFooter'
import { GbpHeader } from './GbpHeader'
import { GbpHero } from './GbpHero'
import { GbpNewsletter } from './GbpNewsletter'
import { GbpProducts } from './GbpProducts'
import { GbpQuote } from './GbpQuote'
import { GbpResources } from './GbpResources'
import { GbpTrustedBy } from './GbpTrustedBy'
import { GbpTypes } from './GbpTypes'
import { GbpWhyChoose } from './GbpWhyChoose'
import type { Review } from '@/config/reviews'
import type { GbpPage } from '@/types/gbp'

type Props = { page: GbpPage; reviews: Review[] }

/**
 * The one template every GBP location page renders: header, eleven sections,
 * footer, in the WordPress order. Everything per page comes from `page`;
 * everything else from lib/data/gbpShared.ts.
 * Reference: docs/reference/gbp-subdomain-pages.md ("Page anatomy").
 */
export function GbpTemplate({ page, reviews }: Props) {
  const { contact, headings, location } = page
  const call = { phone: contact.phone, telHref: gbpTelHref(page) }

  return (
    <>
      <GbpHeader {...call} />
      <main className="flex-1">
        <GbpHero heading={headings.hero} {...call} />
        <GbpTrustedBy heading={headings.trustedBy} />
        <GbpProducts heading={headings.products} {...call} />
        <ReviewsSection heading={GBP_REVIEWS_HEADING} reviews={reviews} />
        <GbpTypes heading={headings.types} {...call} />
        <GbpResources heading={headings.resources} cards={page.blogCards} />
        <GbpWhyChoose />
        <GbpAbout paragraphs={page.about} {...call} />
        <GbpQuote mapEmbedUrl={page.mapEmbedUrl} city={location.city} />
        <GbpNewsletter />
        <GbpFaq faqs={page.faqs} youtubeId={page.youtubeId} city={location.city} />
      </main>
      <GbpFooter contact={contact} telHref={call.telHref} />
    </>
  )
}
