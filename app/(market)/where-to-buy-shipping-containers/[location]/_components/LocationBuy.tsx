import Image from 'next/image'
import { AccentText } from '@/components/shared/AccentText'
import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import { PillLink } from '@/components/shared/PillLink'
import { locationListingHref } from '@/lib/locationPage'
import { LocationRichText } from './LocationRichText'
import type { LocationPage, LocationTemplateText } from '@/types/locationPage'

type Props = {
  text: LocationTemplateText['buy']
  page: LocationPage
}

/** "Buy A Shipping Container In {Region}": the paragraph, the nearby cities and the map. */
export function LocationBuy({ text, page }: Props) {
  return (
    <section aria-labelledby="location-buy" className="bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
      <div className="grid items-center gap-10 lg:grid-cols-[3fr_2fr]">
        <div>
          <h2 id="location-buy" className="text-3xl font-semibold leading-tight text-theme-dark sm:text-4xl dark:text-white">
            <AccentText text={text.heading} accentClassName="text-theme-primary dark:text-red-400" />
          </h2>
          <p className="mt-5 text-base leading-relaxed text-theme-mid sm:text-lg dark:text-neutral-300">
            <LocationRichText text={text.body} />
          </p>

          {page.nearbyCities.length > 0 && (
            <nav aria-label={`Cities near ${page.place.city}`} className="mt-6">
              <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-4">
                {page.nearbyCities.map((city) => (
                  <li key={city.href}>
                    <Link
                      href={city.href}
                      className="text-base text-theme-dark transition-colors hover:text-theme-primary hover:underline sm:text-lg dark:text-neutral-200 dark:hover:text-red-400"
                    >
                      {city.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <PillLink href={locationListingHref(page.depot)} className="mt-8">
            {text.cta}
          </PillLink>
        </div>

        <Image
          src={page.mapImage.src}
          alt={page.mapImage.alt}
          width={page.mapImage.width}
          height={page.mapImage.height}
          sizes="(max-width: 1024px) 90vw, 35vw"
          className="mx-auto h-auto w-full max-w-md rounded-xl shadow-md"
        />
      </div>
    </section>
  )
}
