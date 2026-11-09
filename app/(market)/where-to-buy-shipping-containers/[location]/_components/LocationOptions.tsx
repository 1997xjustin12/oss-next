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

/**
 * "Select An Option Below": Buy, Rent and Rent-To-Own, each opening the listing
 * for this depot.
 *
 * A flex row of equal cards (stacked on phones). Every card is a column: the
 * image in a fixed 330:171 box, so the three pictures are the same size
 * whatever their source dimensions; the bullets left-aligned on the image's
 * left edge; and "See Prices" pushed to the bottom (`mt-auto`) and centred,
 * so the buttons line up even when a bullet wraps (WordPress's didn't at
 * tablet width).
 */
export function LocationOptions({ options, text, depot }: Props) {
  const cards: LocationOptionCard[] = [options.buy, options.rent, options.rto]

  return (
    <section aria-labelledby="location-options" className="bg-white px-[5%] py-10 sm:py-12 dark:bg-neutral-950">
      <h2 id="location-options" className="text-center text-lg font-bold text-theme-dark sm:text-xl dark:text-white">
        {text.heading}
      </h2>
      <ul className="mt-6 flex flex-col gap-5 sm:flex-row">
        {cards.map((card) => (
          <li key={card.ptype} className="flex min-w-0 flex-1 basis-0">
            <Link
              href={locationListingHref(depot, card.ptype)}
              className="group flex w-full flex-col rounded-xl border-2 border-theme-primary bg-white px-6 pt-5 pb-5 transition-shadow
                         hover:shadow-[0_6px_18px_-6px_rgba(198,12,41,0.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary
                         sm:px-5 lg:px-9 dark:border-red-400 dark:bg-neutral-900"
            >
              <div className="relative aspect-330/171 w-full shrink-0">
                <Image src={card.image.src} alt={card.image.alt} fill sizes="(max-width: 640px) 85vw, 28vw" className="object-contain" />
              </div>
              <ul className="mt-4 mb-5 space-y-1.5 text-left text-base leading-snug text-theme-dark lg:text-lg dark:text-neutral-200">
                {card.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
              <span
                className="mt-auto inline-flex min-h-10 items-center gap-2 self-center rounded-md border-2 border-theme-primary px-5 text-sm font-semibold text-theme-primary
                           transition-colors group-hover:bg-theme-primary group-hover:text-white
                           dark:border-red-400 dark:text-red-400 dark:group-hover:bg-red-400 dark:group-hover:text-neutral-950"
              >
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
