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
  /** Every other city page of the state, sorted by name: the "View all" list. */
  viewAll: readonly AllCityLink[]
  /** The section is switched off: only its "View all" list renders (it carries the state's internal links). */
  listOnly?: boolean
}

const LINK = 'font-semibold text-neutral-800 underline underline-offset-2 hover:text-theme-primary dark:text-white dark:hover:text-red-400'
const CITY_LINK =
  'inline-block py-1 text-sm text-neutral-800 underline-offset-2 hover:text-theme-primary hover:underline dark:text-neutral-200 dark:hover:text-red-400'

/**
 * "View all cities in <state>": every other city page of the state, closed
 * until opened. `<details>` needs no script, and the links are in the HTML
 * either way: this list is how search engines reach all the city pages (the
 * /all-city index links only the popular ones).
 *
 * Plain anchors on purpose: the list runs to 1,437 cities (Texas); as
 * `next/link`s each would be a Client Component, adding every one to the
 * page's RSC payload and hydration for a list that is closed by default.
 */
function ViewAllCities({ label, cities }: { label: string; cities: readonly AllCityLink[] }) {
  return (
    <details className="mx-auto mt-6 max-w-5xl sm:mt-8">
      <summary className="mx-auto flex min-h-11 w-fit cursor-pointer list-none items-center rounded-full border border-neutral-300 px-6 text-sm font-bold text-neutral-800 hover:border-theme-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary dark:border-neutral-700 dark:text-neutral-100 [&::-webkit-details-marker]:hidden">
        {label}
      </summary>
      <ul className="mt-6 columns-2 gap-x-6 sm:columns-3 lg:columns-5">
        {cities.map((city) => (
          <li key={city.slug} className="break-inside-avoid">
            <a href={ROUTES.ALL_CITY(city.slug)} className={CITY_LINK}>
              {city.city}
            </a>
          </li>
        ))}
      </ul>
    </details>
  )
}

/**
 * "Popular Cities in <city>" (the 2026-11-19 design): links to other city
 * pages of the same state, the "View all cities in <state>" list closed under
 * them, then the call button. Server-rendered. Left out when the state has no
 * other city page; switched off, only the "View all" list stays.
 */
export function CityPopular({ text, cities, viewAll, listOnly = false }: Props) {
  const shown = cities.slice(0, text.limit)
  const all = text.viewAllLabel.trim() && viewAll.length > 0 ? viewAll : []

  if (listOnly) {
    if (all.length === 0) return null
    return (
      <section aria-label={text.viewAllLabel} className="bg-white px-[5%] pb-10 dark:bg-neutral-950">
        <ViewAllCities label={text.viewAllLabel} cities={all} />
      </section>
    )
  }
  if (shown.length === 0 && all.length === 0) return null

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

      {shown.length > 0 && (
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
      )}

      {all.length > 0 && <ViewAllCities label={text.viewAllLabel} cities={all} />}

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
