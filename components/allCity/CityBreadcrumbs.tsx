import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import { ROUTES } from '@/config/routes'

type Props = {
  /** The crumbs' wording, filled (the template's `sections.breadcrumbs`). */
  home: string
  state: string
  city: string
  /** The state's list on /all-city. */
  stateHref: string
}

const LINK = 'underline underline-offset-2 hover:text-theme-primary dark:hover:text-red-400'

/**
 * "Home / Texas / Abilene" above the hero. The same trail is in the page's
 * BreadcrumbList structured data (AllCityPage).
 */
export function CityBreadcrumbs({ home, state, city, stateHref }: Props) {
  return (
    <nav aria-label="Breadcrumb" className="bg-white px-[5%] py-3 text-sm text-neutral-700 dark:bg-neutral-950 dark:text-neutral-300">
      <ol className="flex flex-wrap items-center gap-x-1.5">
        <li>
          <Link href={ROUTES.HOME} className={LINK}>
            {home}
          </Link>
        </li>
        <li aria-hidden className="text-neutral-400">
          /
        </li>
        <li>
          <Link href={stateHref} className={LINK}>
            {state}
          </Link>
        </li>
        <li aria-hidden className="text-neutral-400">
          /
        </li>
        <li aria-current="page" className="text-neutral-900 dark:text-white">
          {city}
        </li>
      </ol>
    </nav>
  )
}
