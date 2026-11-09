import Image from 'next/image'
import { GoogleReviewsBadge } from '@/components/shared/GoogleReviewsBadge'
import { PillLink } from '@/components/shared/PillLink'
import { ReviewsSection } from '@/components/shared/ReviewsSection'
import { REVIEWS_PAGE } from '@/lib/data/containerLandingContent'
import type { Review } from '@/config/reviews'
import type { LocationImage, LocationTemplateText } from '@/types/locationPage'

type Props = {
  text: LocationTemplateText['satisfaction']
  seal: LocationImage
  reviews: Review[]
}

/**
 * "100% Satisfaction Guaranteed" with the Google rating, then the review
 * slider. WordPress's slider was screenshots of Google reviews; this is
 * `getReviews()` as text.
 */
export function LocationSatisfaction({ text, seal, reviews }: Props) {
  return (
    <>
      <section aria-labelledby="location-satisfaction" className="bg-white px-[5%] pt-12 sm:pt-16 dark:bg-neutral-950">
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Image src={seal.src} alt={seal.alt} width={seal.width} height={seal.height} className="h-16 w-auto" />
            <div>
              <h2 id="location-satisfaction" className="text-2xl font-extrabold text-theme-dark sm:text-3xl dark:text-white">
                {text.heading}
              </h2>
              <GoogleReviewsBadge showRating size="sm" className="mt-2 justify-center sm:justify-start" />
            </div>
          </div>
          {text.body.split(/\n\s*\n/).map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="mt-5 text-base leading-relaxed text-theme-mid dark:text-neutral-300">
              {paragraph.trim()}
            </p>
          ))}
          <PillLink href={REVIEWS_PAGE} className="mt-6">
            {text.cta}
          </PillLink>
        </div>
      </section>
      <ReviewsSection heading="Customer reviews" headingHidden reviews={reviews} className="bg-white dark:bg-neutral-950" />
    </>
  )
}
