import Image from 'next/image'
import { Phone } from 'lucide-react'
import { AccentText } from '@/components/shared/AccentText'
import { GoogleReviewsBadge } from '@/components/shared/GoogleReviewsBadge'
import { LANDING_HERO_BACKGROUND, LANDING_TAGLINE } from '@/lib/data/containerLandingContent'
import { CONTACT_NUMBER, telHref } from '@/lib/helpers'

type Props = {
  /** The page's h1; `[[…]]` runs are yellow, as on WordPress. */
  heading: string
  /** The line under the h1. Default: the for-sale and rental pages' tagline. */
  tagline?: string
  /** The photo behind it. Default: the container yard. */
  background?: string
  /** The call button's number. Default: the sales line. */
  phone?: string
}

/**
 * The for-sale, rental and location pages' hero: the container-yard photo under a dark
 * wash, the Google rating, the h1, the tagline and the call button. The photo
 * is the LCP element, so it is preloaded.
 *
 * WordPress's rating linked to a Google search; the badge here is not a link,
 * because the Google Business Profile URL is not recorded (config/reviews.ts).
 */
export function LandingHero({ heading, tagline = LANDING_TAGLINE, background = LANDING_HERO_BACKGROUND.src, phone = CONTACT_NUMBER }: Props) {
  return (
    <section className="relative isolate overflow-hidden bg-neutral-900 px-[5%] pb-10 pt-6 sm:pb-14 sm:pt-8">
      <Image
        src={background}
        alt={LANDING_HERO_BACKGROUND.alt}
        fill
        preload
        fetchPriority="high"
        sizes="100vw"
        className="-z-20 object-cover"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-black/55" />

      <div className="flex justify-center sm:justify-end">
        <GoogleReviewsBadge tone="onDark" showRating size="sm" />
      </div>

      <div className="mt-4 text-center">
        <h1 className="font-anton text-4xl leading-tight tracking-wide text-white text-shadow-lg sm:text-5xl lg:text-6xl">
          <AccentText text={heading} accentClassName="text-yellow-300" />
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-base text-white text-shadow-lg sm:text-xl">{tagline}</p>

        <a
          href={telHref(phone)}
          aria-label={`Call ${phone}`}
          className="mt-6 inline-flex min-h-14 items-center gap-3 rounded-full bg-white py-1.5 pl-1.5 pr-6 text-2xl font-extrabold text-theme-primary shadow-lg
                     transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-3xl"
        >
          <span aria-hidden className="flex h-11 w-11 items-center justify-center rounded-full bg-theme-primary text-white sm:h-12 sm:w-12">
            <Phone className="h-6 w-6" />
          </span>
          {phone}
        </a>
      </div>
    </section>
  )
}
