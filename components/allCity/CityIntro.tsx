import Image from 'next/image'
import { PillLink } from '@/components/shared/PillLink'
import { CityParagraphs } from './CityParagraphs'
import type { AllCityImage } from '@/types/allCity'

type Props = {
  banner: AllCityImage
  bannerAlt: string
  quote: { label: string; href: string }
  heading: string
  body: string
  whyHeading: string
  whyBody: string
}

/**
 * The grey band under the hero: the depot's photo and "GET A QUOTE" beside the
 * template's paragraphs about the city, then "WHY CHOOSE ON-SITE STORAGE
 * SOLUTIONS?" across the full width.
 */
export function CityIntro({ banner, bannerAlt, quote, heading, body, whyHeading, whyBody }: Props) {
  return (
    <section aria-labelledby="city-intro" className="bg-neutral-100 px-[5%] py-10 sm:py-12 dark:bg-neutral-900">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <div className="flex flex-col items-center gap-5">
          <Image
            src={banner.src}
            alt={bannerAlt}
            width={banner.width}
            height={banner.height}
            sizes="(min-width: 1024px) 45vw, 90vw"
            className="h-auto w-full"
          />
          <PillLink href={quote.href}>{quote.label}</PillLink>
        </div>

        <div>
          <h2 id="city-intro" className="text-xl font-bold text-theme-dark sm:text-2xl dark:text-white">
            {heading}
          </h2>
          <div className="mt-4">
            <CityParagraphs text={body} />
          </div>
        </div>
      </div>

      <h2 className="mt-10 text-xl font-bold text-theme-dark sm:text-2xl dark:text-white">{whyHeading}</h2>
      <div className="mt-4">
        <CityParagraphs text={whyBody} />
      </div>
    </section>
  )
}
