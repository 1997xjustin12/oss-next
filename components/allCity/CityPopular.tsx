import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import { TemplateRichText } from '@/components/shared/TemplateRichText'
import { ROUTES } from '@/config/routes'
import { CONTACT_NUMBER } from '@/lib/helpers'
import type { AllCityLink, AllCityPopularText } from '@/types/allCity'

type Props = {
  /** The section's wording, filled (the template's `sections.popular`). */
  text: AllCityPopularText
  /** The state's Popular Cities, without this page, sorted by name. */
  cities: readonly AllCityLink[]
}

const LINK = 'font-semibold text-neutral-800 underline underline-offset-2 hover:text-theme-primary dark:text-white dark:hover:text-red-400'

/**
 * "Popular Cities in <city>" (the 2026-11-19 design): links to other city
 * pages of the same state, then the call button. Server-rendered; at most 20
 * hover-prefetch links. Left out when the state lists no other city.
 */
export function CityPopular({ text, cities }: Props) {
  const shown = cities.slice(0, text.limit)
  if (shown.length === 0) return null

  return (
    <section aria-labelledby="city-popular-cities" className="bg-white px-[5%] py-10 sm:py-14 dark:bg-neutral-950">
      <div className="mx-auto max-w-4xl text-center">
        <h2 id="city-popular-cities" className="text-2xl leading-tight font-bold text-balance text-neutral-800 sm:text-3xl dark:text-white">
          <TemplateRichText text={text.heading} accentClassName="text-theme-primary dark:text-red-400" />
        </h2>
        {text.body.trim() && (
          <p className="mt-2 text-[15px] leading-relaxed text-neutral-700 sm:text-base dark:text-neutral-300">
            <TemplateRichText text={text.body} linkClassName={LINK} />
          </p>
        )}
      </div>

      <ul className="mx-auto mt-6 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-1 sm:mt-8 sm:grid-cols-4">
        {shown.map((city) => (
          <li key={city.slug} className="text-center">
            <Link
              href={ROUTES.ALL_CITY(city.slug)}
              className="inline-flex min-h-10 items-center text-[15px] text-neutral-800 underline-offset-2 hover:text-theme-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary dark:text-neutral-200 dark:hover:text-red-400"
            >
              {city.city}
            </Link>
          </li>
        ))}
      </ul>

      {text.button.trim() && (
        <div className="mx-auto mt-6 w-full max-w-sm sm:mt-8">
          <a
            href={`tel:${CONTACT_NUMBER}`}
            className="block bg-theme-primary px-5 py-3 text-center text-[15px] font-semibold text-white shadow-md transition-colors hover:bg-theme-primary-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-theme-primary sm:text-base"
          >
            {text.button}
          </a>
        </div>
      )}
    </section>
  )
}
