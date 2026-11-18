import { MapPin } from 'lucide-react'
import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import { ROUTES } from '@/config/routes'
import type { AllCityStateSummary } from '@/services/allCity.service'

const NUMBER = new Intl.NumberFormat('en-US')

/**
 * The cities, by state: a card per state with its city-page count and its
 * "Popular Cities" (the list each city page shows, at most 20). The full
 * lists, 8,000-odd links, stay on the city pages, where every page lists its
 * whole state: here they would make this page several times the size for
 * links a visitor reaches in one click anyway.
 */
export function StateCityDirectory({ states }: { states: AllCityStateSummary[] }) {
  return (
    <section aria-labelledby="by-state-title" className="bg-neutral-100 px-[5%] py-12 sm:py-16 dark:bg-neutral-900">
      <div className="text-center">
        <h2 id="by-state-title" className="text-2xl font-bold text-theme-primary sm:text-3xl lg:text-[34px] dark:text-red-400">
          Find Your City
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-[15px] text-neutral-700 sm:text-lg dark:text-neutral-300">
          Popular cities in each state. Every city page lists the rest of its state.
        </p>
      </div>

      <ul className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
        {states.map((s) => (
          <li key={s.state}>
            <article
              id={`state-${s.state.toLowerCase()}`}
              aria-labelledby={`state-${s.state.toLowerCase()}-title`}
              className="h-full scroll-mt-24 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.08)] sm:p-6 dark:bg-neutral-950 dark:ring-1 dark:ring-white/10"
            >
              <header className="flex items-baseline justify-between gap-3 border-b border-neutral-200 pb-3 dark:border-neutral-800">
                <h3 id={`state-${s.state.toLowerCase()}-title`} className="flex items-center gap-2 text-lg font-bold text-neutral-900 sm:text-xl dark:text-white">
                  <MapPin aria-hidden className="h-5 w-5 shrink-0 text-theme-primary dark:text-red-400" />
                  {s.name}
                </h3>
                <p className="shrink-0 text-xs font-semibold text-neutral-500 sm:text-sm dark:text-neutral-400">
                  {NUMBER.format(s.count)} cities
                </p>
              </header>
              {s.popular.length > 0 ? (
                <ul className="mt-3 grid grid-cols-2 gap-x-4">
                  {s.popular.map((city) => (
                    <li key={city.slug}>
                      <Link
                        href={ROUTES.ALL_CITY(city.slug)}
                        className="inline-block py-1 text-sm font-medium text-neutral-800 underline-offset-2 hover:text-theme-primary hover:underline dark:text-neutral-200 dark:hover:text-red-400"
                      >
                        {city.city}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">No popular cities listed yet.</p>
              )}
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}
