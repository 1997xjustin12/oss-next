import Image from 'next/image'
import { CalendarDays, MapPin, Package } from 'lucide-react'
import { SnapCarousel } from '@/components/shared/SnapCarousel'
import { formatDeliveredOn } from '@/lib/deliveredContainers'
import type { DeliveredContainer } from '@/types/deliveredContainer'

type Props = {
  heading: string
  /** Newest first; only the first `limit` are rendered. */
  items: readonly DeliveredContainer[]
  /** `band`: on the red band (location pages). `light`: its own light section (homepage). */
  tone?: 'band' | 'light'
  limit?: number
}

/**
 * "Recently Delivered Containers": photo cards in a row that swipes, each with
 * what was delivered, when, and where, as the WordPress plugin showed them.
 * A Server Component; the carousel's arrows are the only client code. Photos
 * are lazy and sized to the card, so a row of 20 costs the first few.
 */
export function DeliveredContainers({ heading, items, tone = 'light', limit = 20 }: Props) {
  const shown = items.slice(0, limit)
  if (shown.length === 0) return null
  const band = tone === 'band'

  return (
    <section
      aria-labelledby="delivered-containers"
      className={`px-[5%] py-10 sm:py-12 ${band ? 'bg-theme-primary' : 'bg-theme-subtle dark:bg-neutral-950'}`}
    >
      <h2
        id="delivered-containers"
        className={`text-center text-3xl font-semibold sm:text-4xl ${band ? 'text-white' : 'text-theme-dark dark:text-white'}`}
      >
        {heading}
      </h2>
      <SnapCarousel label={heading} itemName="deliveries" className="mt-8">
        {shown.map((item) => (
          <li
            key={item.id}
            className="w-[80%] shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)] xl:w-[calc((100%-3.75rem)/4)]"
          >
            <article className="relative aspect-square overflow-hidden rounded-lg bg-neutral-200 dark:bg-neutral-800">
              {item.image && (
                <Image
                  src={item.image}
                  alt={`${item.title}, delivered${item.location ? ` in ${item.location}` : ''} on ${formatDeliveredOn(item.deliveredOn)}`}
                  fill
                  sizes="(max-width: 640px) 80vw, (max-width: 1024px) 45vw, (max-width: 1280px) 30vw, 22vw"
                  className="object-cover"
                />
              )}
              <div className="absolute inset-x-0 bottom-0 space-y-1 bg-gradient-to-t from-black/85 via-black/65 to-transparent px-4 pb-4 pt-10 text-sm text-white">
                <p className="flex items-start gap-2 font-semibold leading-snug">
                  <Package className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <span className="line-clamp-2">{item.title}</span>
                </p>
                <p className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 shrink-0" aria-hidden />
                  <time dateTime={item.deliveredOn}>{formatDeliveredOn(item.deliveredOn)}</time>
                </p>
                {item.location && (
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                    {item.location}
                  </p>
                )}
              </div>
            </article>
          </li>
        ))}
      </SnapCarousel>
    </section>
  )
}
