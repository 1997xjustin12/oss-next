import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import { ROUTES } from '@/config/routes'
import type { AllCityLink } from '@/types/allCity'

type Props = {
  popularHeading: string
  popular: AllCityLink[]
  viewAllLabel: string
  viewAll: AllCityLink[]
}

const LINK =
  'inline-block py-1 text-sm font-semibold text-theme-dark underline-offset-2 hover:text-theme-primary hover:underline dark:text-neutral-200 dark:hover:text-red-400'

/**
 * "Popular Cities in <state>", then "View all cities in <state>": every city
 * page of the state, closed until opened, as WordPress's button toggled it.
 * `<details>` needs no script, and the links are in the HTML either way, as
 * they were on WordPress.
 */
export function CityLists({ popularHeading, popular, viewAllLabel, viewAll }: Props) {
  if (popular.length === 0 && viewAll.length === 0) return null

  return (
    <section aria-labelledby={popular.length ? 'city-popular' : undefined} className="bg-white px-[5%] pb-10 dark:bg-neutral-950">
      {popular.length > 0 && (
        <>
          <h2 id="city-popular" className="text-center text-xl font-bold text-theme-dark sm:text-2xl dark:text-white">
            {popularHeading}
          </h2>
          <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 lg:grid-cols-6">
            {popular.map((city) => (
              <li key={city.slug}>
                <Link href={ROUTES.ALL_CITY(city.slug)} className={LINK}>
                  {city.city}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      {viewAll.length > 0 && (
        <details className="group mt-8">
          <summary className="mx-auto flex min-h-11 w-fit cursor-pointer list-none items-center rounded-full border border-theme-border px-6 text-sm font-bold text-theme-dark hover:border-theme-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary dark:border-neutral-700 dark:text-neutral-100 [&::-webkit-details-marker]:hidden">
            {viewAllLabel}
          </summary>
          <ul className="mt-6 columns-2 gap-x-6 sm:columns-3 lg:columns-6">
            {viewAll.map((city) => (
              <li key={city.slug} className="break-inside-avoid">
                <Link href={ROUTES.ALL_CITY(city.slug)} className={LINK}>
                  {city.city}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  )
}
