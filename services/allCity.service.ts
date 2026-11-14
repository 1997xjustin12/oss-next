import { ALL_CITY_DEPOTS } from '@/lib/data/allCityDepots'
import { ALL_CITY_TEMPLATE_DEFAULT } from '@/lib/data/allCityTemplate'
import { allSeedPages, getSeedPage } from '@/lib/allCitySeed'
import { isListable } from '@/lib/allCityPage'
import type { AllCityDepot, AllCityLink, AllCityPage, AllCityState, AllCityTemplate } from '@/types/allCity'

/**
 * Reads for the /all-city/ pages: the page records, the template, the depots
 * and each state's two city lists.
 *
 * Phase 1 (this file): the records are the seed imported from WordPress
 * (lib/data/allCityPages.json) and the code defaults. Phase 2 lays the
 * admin's published edits from Redis over them, behind these same functions.
 */

export async function getAllCityPage(slug: string): Promise<AllCityPage | null> {
  return getSeedPage(slug)
}

export async function getAllCityTemplate(): Promise<AllCityTemplate> {
  return ALL_CITY_TEMPLATE_DEFAULT
}

export async function getAllCityDepot(key: string): Promise<AllCityDepot | null> {
  return ALL_CITY_DEPOTS[key] ?? null
}

export type AllCityStateLists = { popular: AllCityLink[]; viewAll: AllCityLink[] }

let listsByState: Map<AllCityState, AllCityStateLists> | null = null

/**
 * Both lists for every state, sorted as WordPress sorted them (by the city's
 * name), built once per server instance rather than per page: Texas's
 * View-all list alone is 1,437 cities.
 */
function buildLists(): Map<AllCityState, AllCityStateLists> {
  const lists = new Map<AllCityState, AllCityStateLists>()
  for (const page of allSeedPages()) {
    if (!isListable(page)) continue
    const entry = lists.get(page.state) ?? { popular: [], viewAll: [] }
    const link = { slug: page.slug, city: page.city }
    if (page.lists.popular) entry.popular.push(link)
    if (page.lists.viewAll) entry.viewAll.push(link)
    lists.set(page.state, entry)
  }
  const byCity = (a: AllCityLink, b: AllCityLink) => a.city.localeCompare(b.city, 'en') || a.slug.localeCompare(b.slug, 'en')
  for (const entry of lists.values()) {
    entry.popular.sort(byCity)
    entry.viewAll.sort(byCity)
  }
  return lists
}

/**
 * "Popular Cities in <state>" and "View all cities in <state>" for one page:
 * the state's lists without the page itself, as WordPress left the current
 * post out of both.
 */
export async function getAllCityLists(state: AllCityState, exceptSlug: string): Promise<AllCityStateLists> {
  listsByState ??= buildLists()
  const lists = listsByState.get(state)
  if (!lists) return { popular: [], viewAll: [] }
  const notThis = (link: AllCityLink) => link.slug !== exceptSlug
  return { popular: lists.popular.filter(notThis), viewAll: lists.viewAll.filter(notThis) }
}
