import { ROUTES } from '@/config/routes'
import { fillPlaceholders } from '@/lib/locationPage'
import type { AllCityDepot, AllCityImage, AllCityLink, AllCityPage, AllCitySections, AllCityState, AllCityTemplate, AllCityTemplateText } from '@/types/allCity'

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

/** What the page shows of its depot: the depot-city variant may have its own banner. */
export function allCityDepotParts(depot: AllCityDepot, page: Pick<AllCityPage, 'variant'>): { banner: AllCityImage } {
  const depotCity = page.variant === 'depotCity'
  return { banner: (depotCity && depot.depotCityBanner) || depot.banner }
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * The page's h1 with its city part marked as an accent (`[[…]]`), so the hero
 * shows the page's own heading (its SEO keyword) in the design's style: the
 * city, with the state code or name right after it if there is one ("Storage
 * Units [[Adrian MI]]", "[[Detroit]]"). Unchanged when the city is not in it.
 */
export function accentCityInHeading(h1: string, page: Pick<AllCityPage, 'city' | 'state'>): string {
  const state = `(?:,?\\s+(?:${escapeRegExp(page.state)}|${escapeRegExp(ALL_CITY_STATE_NAMES[page.state] ?? page.state)})\\b)?`
  const match = new RegExp(`${escapeRegExp(page.city)}${state}`, 'i').exec(h1)
  if (!match) return h1
  return `${h1.slice(0, match.index)}[[${match[0]}]]${h1.slice(match.index + match[0].length)}`
}

/**
 * What the sections know of the page's depot: `{depot}`, `{depotCount}`,
 * `{depotPage}`, `{depotPlp}` (the listing at that depot) and, when there is
 * one, `{price}`.
 */
export type AllCityHeroFacts = {
  depot: string
  /** The depot's location page. */
  depotPage: string
  /** The depot's lowest used container price; null leaves out what quotes it. */
  usedFrom: number | null
}

const WHOLE_DOLLARS = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

/** Does a filled string still hold a placeholder it could not fill (say `{price}` with no price)? */
const unfilled = (value: string, names: readonly string[]) => names.some((name) => value.includes(`{${name}}`))

/**
 * The redesigned sections' wording for one page: placeholders filled (the
 * page's, plus `{h1}`, `{depot}`, `{depotCount}`, `{depotPage}`, `{depotPlp}`, `{keyword}`
 * and `{price}`). A hero figure that quotes `{price}` is left out when the
 * depot has no price, rather than shown with a hole in it. On a depot-city
 * page the products heading is `depotCityHeading` (its keyword heading, by
 * default) unless that comes out blank.
 */
export function resolveAllCitySections(template: AllCityTemplate, page: AllCityPage, facts: AllCityHeroFacts): AllCitySections {
  const depots = facts.depot.split(/\s*\/\s*/).filter(Boolean)
  const vars: Record<string, string> = {
    ...allCityVars(page),
    h1: accentCityInHeading(page.h1, page),
    depot: facts.depot,
    depotCount: `${depots.length} ${depots.length === 1 ? 'Depot' : 'Depots'}`,
    depotPage: facts.depotPage,
    // The listing at this depot. A link that names its location keeps it: the visitor's saved one is not swapped in (PlpLink).
    depotPlp: `${ROUTES.PLP}?${new URLSearchParams({ location: facts.depot })}`,
    keyword: page.keywordHeading?.trim() ? accentCityInHeading(page.keywordHeading.trim(), page) : '',
  }
  if (facts.usedFrom !== null) vars.price = WHOLE_DOLLARS.format(facts.usedFrom)

  const sections = fillDeep(template.sections, vars)
  const missing = facts.usedFrom === null ? ['price'] : []
  const depotCityHeading = sections.products.depotCityHeading.trim()
  return {
    ...sections,
    hero: { ...sections.hero, stats: sections.hero.stats.filter((stat) => !unfilled(stat.value, missing) && !unfilled(stat.label, missing)) },
    products: {
      ...sections.products,
      heading: page.variant === 'depotCity' && depotCityHeading ? depotCityHeading : sections.products.heading,
    },
  }
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
