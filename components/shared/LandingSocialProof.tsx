import Image from 'next/image'
import { PillLink } from '@/components/shared/PillLink'
import { ReviewsSection } from '@/components/shared/ReviewsSection'
import { SectionTagline2 } from '@/components/shared/SectionTagline2'
import { TrustedBySection } from '@/components/shared/TrustedBySection'
import { REVIEWS_PAGE, SATISFACTION, TRUSTED_BAND, TRUSTED_LOGOS } from '@/lib/data/containerLandingContent'
import type { Review } from '@/config/reviews'

type Props = {
  /** From `getReviews()`, read by the page (a Server Component). */
  reviews: Review[]
}

/**
 * The for-sale and rental pages' run of trust signals, in WordPress's order:
 * the "TRUSTED BY ORGANIZATIONS LIKE" band and its logo marquee, then the
 * satisfaction guarantee beside the review slider. WordPress's slider was
 * screenshots of Google reviews; this one shows the reviews as text.
 */
export function LandingSocialProof({ reviews }: Props) {
  const { heading, body, cta, seal } = SATISFACTION

  return (
    <>
      <SectionTagline2 bg="blue" text={TRUSTED_BAND} />
      <TrustedBySection heading={null} logos={TRUSTED_LOGOS} />

      <section aria-labelledby="satisfaction" className="bg-white px-[5%] pt-12 sm:pt-16 dark:bg-neutral-950">
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex items-center justify-center gap-4">
            <Image src={seal.src} alt={seal.alt} width={seal.width} height={seal.height} className="h-16 w-auto" />
            <h2 id="satisfaction" className="text-2xl font-extrabold text-theme-dark sm:text-3xl dark:text-white">
              {heading}
            </h2>
          </div>
          <p className="mt-5 text-base leading-relaxed text-theme-mid dark:text-neutral-300">{body}</p>
          <PillLink href={REVIEWS_PAGE} className="mt-6">
            {cta}
          </PillLink>
        </div>
      </section>
      <ReviewsSection heading="Customer reviews" headingHidden reviews={reviews} className="bg-white dark:bg-neutral-950" />
    </>
  )
}
