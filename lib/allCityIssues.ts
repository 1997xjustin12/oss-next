import type { AllCityPage } from '@/types/allCity'

/**
 * Data issues among the /all-city/ pages, for the admin's "Duplicates &
 * issues" filter and the warning on a page's screen (docs/reference/all-city-pages.md
 * §3.10). The same checks as scripts/check-all-city-pages.mjs, run on the
 * records as they are now (seed plus edits), so a fix clears its warning.
 *
 * Pure; tested in tests/unit/allCityValidate.test.ts.
 */

export type AllCityIssue = {
  kind: 'sameCity' | 'copySlug' | 'sameTitle' | 'sameDescription' | 'h1NoCity' | 'h1OtherCity' | 'noDescription'
  message: string
  /** The other pages involved, by slug. */
  twins: string[]
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

function groupBy(pages: AllCityPage[], key: (page: AllCityPage) => string): AllCityPage[][] {
  const map = new Map<string, AllCityPage[]>()
  for (const page of pages) {
    const k = key(page)
    if (!k) continue
    const group = map.get(k)
    if (group) group.push(page)
    else map.set(k, [page])
  }
  return [...map.values()].filter((group) => group.length > 1)
}

/** Every page's issues, keyed by slug. Pages that are hidden or redirect are left out: they are resolved. */
export function findAllCityIssues(all: AllCityPage[]): Map<string, AllCityIssue[]> {
  const pages = all.filter((page) => !page.hidden && !page.redirectTo)
  const issues = new Map<string, AllCityIssue[]>()
  const add = (page: AllCityPage, issue: AllCityIssue) => issues.set(page.slug, [...(issues.get(page.slug) ?? []), issue])
  const others = (group: AllCityPage[], page: AllCityPage) => group.filter((p) => p !== page).map((p) => p.slug)

  for (const group of groupBy(pages, (p) => `${p.state}|${norm(p.city)}`)) {
    for (const page of group) add(page, { kind: 'sameCity', message: `Another page for ${page.city}, ${page.state}`, twins: others(group, page) })
  }
  const bySlug = new Map(pages.map((p) => [p.slug, p]))
  for (const page of pages) {
    const original = page.slug.match(/^(.+)-\d+$/)?.[1]
    if (original && bySlug.has(original)) add(page, { kind: 'copySlug', message: `A WordPress copy of /all-city/${original}`, twins: [original] })
  }
  for (const group of groupBy(pages, (p) => norm(p.seo.title))) {
    for (const page of group) add(page, { kind: 'sameTitle', message: 'Same SEO title as another page', twins: others(group, page) })
  }
  for (const group of groupBy(pages, (p) => norm(p.seo.description))) {
    for (const page of group) add(page, { kind: 'sameDescription', message: 'Same SEO description as another page', twins: others(group, page) })
  }

  const citiesByDepot = new Map<string, string[]>()
  for (const page of pages) citiesByDepot.set(page.depotKey, [...(citiesByDepot.get(page.depotKey) ?? []), norm(page.city)])
  for (const page of pages) {
    if (!page.seo.description.trim()) add(page, { kind: 'noDescription', message: 'No SEO description', twins: [] })
    if (page.variant !== 'city' || norm(page.h1).includes(norm(page.city))) continue
    const other = citiesByDepot.get(page.depotKey)?.find((c) => c.length > 3 && c !== norm(page.city) && ` ${norm(page.h1)} `.includes(` ${c} `))
    add(
      page,
      other
        ? { kind: 'h1OtherCity', message: `The h1 names another city (${other})`, twins: [] }
        : { kind: 'h1NoCity', message: `The h1 does not name ${page.city}`, twins: [] },
    )
  }
  return issues
}
