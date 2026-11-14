import { ROUTES } from '@/config/routes'
import { fillPlaceholders } from '@/lib/locationPage'
import type { AllCityDepot, AllCityImage, AllCityLink, AllCityPage, AllCityState, AllCityTemplate, AllCityTemplateText } from '@/types/allCity'
import type { DepotFeaturedKey } from '@/services/search.service'

/** Pure helpers for the /all-city/ pages: wording, depot parts, paths. No I/O. */

export const ALL_CITY_STATE_NAMES: Readonly<Record<AllCityState, string>> = {
  CO: 'Colorado',
  FL: 'Florida',
  GA: 'Georgia',
  IL: 'Illinois',
  IN: 'Indiana',
  KS: 'Kansas',
  MD: 'Maryland',
  MI: 'Michigan',
  NC: 'North Carolina',
  OH: 'Ohio',
  SC: 'South Carolina',
  TX: 'Texas',
}

export function allCityPath(slug: string): string {
  return ROUTES.ALL_CITY(slug)
}

/** The placeholders a page fills in its template (`{phone}` is left to TemplateRichText). */
export function allCityVars(page: Pick<AllCityPage, 'city' | 'state'>): Record<string, string> {
  return {
    city: page.city,
    CITY: page.city.toUpperCase(),
    state: ALL_CITY_STATE_NAMES[page.state] ?? page.state,
    ST: page.state,
  }
}

function fillDeep<T>(value: T, vars: Record<string, string>): T {
  if (typeof value === 'string') return fillPlaceholders(value, vars) as T
  if (Array.isArray(value)) return value.map((item) => fillDeep(item, vars)) as T
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, fillDeep(item, vars)])) as T
  }
  return value
}

/**
 * The page's wording: its variant's template text with the page's own
 * overrides laid over it field by field (a blank override keeps the
 * template's), placeholders filled.
 */
export function resolveAllCityText(template: AllCityTemplate, page: AllCityPage): AllCityTemplateText {
  const base = template[page.variant]
  const merged: AllCityTemplateText = { ...base }
  for (const [key, value] of Object.entries(page.text ?? {}) as [keyof AllCityTemplateText, AllCityTemplateText[keyof AllCityTemplateText]][]) {
    const blank = typeof value === 'string' ? !value.trim() : !Array.isArray(value) || value.length === 0
    if (!blank) (merged as Record<string, unknown>)[key] = value
  }
  return fillDeep(merged, allCityVars(page))
}

/** What the page shows of its depot: the depot-city variant may have its own banner and cards. */
export function allCityDepotParts(depot: AllCityDepot, page: Pick<AllCityPage, 'variant'>): { banner: AllCityImage; specs: readonly DepotFeaturedKey[] } {
  const depotCity = page.variant === 'depotCity'
  return {
    banner: (depotCity && depot.depotCityBanner) || depot.banner,
    specs: (depotCity && depot.depotCitySpecs?.length && depot.depotCitySpecs) || depot.specs,
  }
}

/** Where "See other location prices" goes: the variant's own link, else the depot's. */
export function allCityOtherHref(text: AllCityTemplateText, depot: AllCityDepot): string {
  return text.otherHref.trim() || depot.otherPricesHref
}

/** Whether a page is in its state's lists at all (hidden and redirected pages are not). */
export function isListable(page: Pick<AllCityPage, 'hidden' | 'redirectTo'>): boolean {
  return !page.hidden && !page.redirectTo
}

export type AllCityStateLists = { popular: AllCityLink[]; viewAll: AllCityLink[] }

const byCity = (a: AllCityLink, b: AllCityLink) => a.city.localeCompare(b.city, 'en') || a.slug.localeCompare(b.slug, 'en')

/**
 * One state's "Popular Cities" and "View all cities", from the pages as they
 * are: sorted as WordPress sorted them (by the city's name), hidden and
 * redirected pages left out.
 */
export function buildAllCityLists(pages: readonly AllCityPage[], state: AllCityState): AllCityStateLists {
  const lists: AllCityStateLists = { popular: [], viewAll: [] }
  for (const page of pages) {
    if (page.state !== state || !isListable(page)) continue
    const link = { slug: page.slug, city: page.city }
    if (page.lists.popular) lists.popular.push(link)
    if (page.lists.viewAll) lists.viewAll.push(link)
  }
  lists.popular.sort(byCity)
  lists.viewAll.sort(byCity)
  return lists
}

/** A page's lists: its state's, without the page itself (WordPress left the current post out of both). */
export function withoutPage(lists: AllCityStateLists, slug: string): AllCityStateLists {
  const notThis = (link: AllCityLink) => link.slug !== slug
  return { popular: lists.popular.filter(notThis), viewAll: lists.viewAll.filter(notThis) }
}
