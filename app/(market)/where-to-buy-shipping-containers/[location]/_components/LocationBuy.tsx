import Image from 'next/image'
import { AccentText } from '@/components/shared/AccentText'
import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import { PillLink } from '@/components/shared/PillLink'
import { LocationParagraphs } from './LocationParagraphs'
import type { LocationPage, LocationTemplateText } from '@/types/locationPage'

type Props = {
  text: LocationTemplateText['buy']
  page: LocationPage
  href: string
  phone: string
}

/**
 * "Buy A Shipping Container In {Place}": the paragraphs, the nearby cities and
 * the map. Without a map (Bakersfield, Las Vegas, Temecula, Indianapolis) the
 * text takes the full width.
 */
export function LocationBuy({ text, page, href, phone }: Props) {
  const { mapImage } = page

  return (
    <section aria-labelledby="location-buy" className="bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
      <div className={`grid items-center gap-10 ${mapImage ? 'lg:grid-cols-[3fr_2fr]' : ''}`}>
        <div>
          <h2 id="location-buy" className="text-3xl font-semibold leading-tight text-theme-dark sm:text-4xl dark:text-white">
            <AccentText text={text.heading} accentClassName="text-theme-primary dark:text-red-400" />
          </h2>
          <div className="mt-5">
            <LocationParagraphs text={text.body} phone={phone} />
          </div>

          {page.nearbyCities.length > 0 && (
            <nav aria-label={text.citiesHeading || `Cities near ${page.place.city}`} className="mt-6">
              {text.citiesHeading && <h3 className="mb-3 text-lg font-semibold text-theme-primary dark:text-red-400">{text.citiesHeading}</h3>}
              <ul className={`grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3 ${mapImage ? 'lg:grid-cols-4' : 'lg:grid-cols-6'}`}>
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

          <PillLink href={href} className="mt-8">
            {text.cta}
          </PillLink>
        </div>

        {mapImage && (
          <Image
            src={mapImage.src}
            alt={mapImage.alt}
            width={mapImage.width}
            height={mapImage.height}
            sizes="(max-width: 1024px) 90vw, 35vw"
            className="mx-auto h-auto w-full max-w-md rounded-xl shadow-md"
          />
        )}
      </div>
    </section>
  )
}
