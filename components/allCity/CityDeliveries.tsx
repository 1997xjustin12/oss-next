import Image from 'next/image'
import { SnapCarousel } from '@/components/shared/SnapCarousel'
import { TemplateRichText } from '@/components/shared/TemplateRichText'
import { fillPlaceholders } from '@/lib/locationPage'
import { formatDeliveredOn } from '@/lib/deliveredContainers'
import type { AllCityDeliveriesText } from '@/types/allCity'
import type { DeliveredContainer } from '@/types/deliveredContainer'

type Props = {
  /** The section's wording, filled (the template's `sections.deliveries`). */
  text: AllCityDeliveriesText
  /** The depot's deliveries, newest first, photo only (getDeliveredForDepot). */
  deliveries: readonly DeliveredContainer[]
}

/**
 * "Recently Delivered Containers Near <city>" (the 2026-11-19 design): the
 * newest deliveries from the page's depot, a photo card each with what was
 * delivered, where (city only) and when, in the homepage's carousel: swiped on a
 * phone, arrows from `sm` (the cards stay server-rendered). Left out when
 * the depot has no delivery with a photo.
 */
export function CityDeliveries({ text, deliveries }: Props) {
  const shown = deliveries.slice(0, text.limit)
  if (shown.length === 0) return null

  return (
    <section aria-labelledby="city-deliveries" className="bg-neutral-100 px-[5%] py-10 sm:py-14 dark:bg-neutral-900">
      <div className="mx-auto max-w-4xl text-center">
        <h2 id="city-deliveries" className="text-2xl leading-tight font-bold text-balance text-neutral-800 sm:text-3xl dark:text-white">
          <TemplateRichText text={text.heading} accentClassName="text-theme-primary dark:text-red-400" />
        </h2>
        {text.body.trim() && (
          <p className="mt-2 text-[15px] leading-relaxed text-neutral-700 sm:text-lg dark:text-neutral-300">
            <TemplateRichText text={text.body} />
          </p>
        )}
      </div>

      {/* The homepage's carousel (SnapCarousel): swiped on a phone, arrows from sm. The cards stay server-rendered. */}
      <SnapCarousel label="Recent deliveries" itemName="deliveries">
        {shown.map((item) => {
          const when = formatDeliveredOn(item.deliveredOn)
          return (
            <li
              key={item.id}
              className="w-[75%] shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)] xl:w-[calc((100%-3.75rem)/4)]"
            >
              <article>
                <div className="relative aspect-4/5 overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                  <Image
                    src={item.image!}
                    alt={`${item.title}, delivered${item.location ? ` to ${item.location}` : ''} on ${when}`}
                    fill
                    sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 75vw"
                    className="object-cover"
                  />
                </div>
                <h3 className="mt-3 text-[15px] leading-snug font-bold text-neutral-800 dark:text-white">{item.title}</h3>
                {item.location && (
                  <p className="text-[15px] leading-snug text-neutral-700 dark:text-neutral-300">
                    {fillPlaceholders(text.placeLabel, { place: item.location })}
                  </p>
                )}
                <p className="text-[15px] leading-snug text-neutral-700 dark:text-neutral-300">
                  <time dateTime={item.deliveredOn}>{when}</time>
                </p>
              </article>
            </li>
          )
        })}
      </SnapCarousel>
    </section>
  )
}
