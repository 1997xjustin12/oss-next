import Image from 'next/image'
import { CircleArrowRight } from 'lucide-react'
import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import { locationListingHref } from '@/lib/locationPage'
import type { LocationOptionCard, LocationTemplate, LocationTemplateText } from '@/types/locationPage'

type Props = {
  options: LocationTemplate['options']
  text: LocationTemplateText['options']
  depot: string
}

/** "Select An Option Below": Buy, Rent and Rent-To-Own, each opening the listing for this depot. */
export function LocationOptions({ options, text, depot }: Props) {
  const cards: LocationOptionCard[] = [options.buy, options.rent, options.rto]

  return (
    <section aria-labelledby="location-options" className="bg-white px-[5%] py-10 sm:py-12 dark:bg-neutral-950">
      <h2 id="location-options" className="text-center text-lg font-bold text-theme-dark sm:text-xl dark:text-white">
        {text.heading}
      </h2>
      <ul className="mt-6 grid gap-5 sm:grid-cols-3">
        {cards.map((card) => (
          <li key={card.ptype}>
            <Link
              href={locationListingHref(depot, card.ptype)}
              className="group flex h-full flex-col items-center rounded-xl border-2 border-theme-primary bg-white p-5 shadow-sm transition-shadow
                         hover:shadow-[0_6px_18px_-6px_rgba(198,12,41,0.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary
                         dark:border-red-400 dark:bg-neutral-900"
            >
              <div className="relative aspect-[330/171] w-full max-w-xs">
                <Image src={card.image.src} alt={card.image.alt} fill sizes="(max-width: 640px) 80vw, 25vw" className="object-contain" />
              </div>
              <ul className="mt-4 w-full max-w-xs space-y-1 text-base text-theme-dark sm:text-lg dark:text-neutral-200">
                {card.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
              <span className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-md border-2 border-theme-primary px-5 text-sm font-semibold text-theme-primary transition-colors
                               group-hover:bg-theme-primary group-hover:text-white dark:border-red-400 dark:text-red-400 dark:group-hover:bg-red-400 dark:group-hover:text-neutral-950">
                {text.cta}
                <CircleArrowRight aria-hidden className="h-4 w-4" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
