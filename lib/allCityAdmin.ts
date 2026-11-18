import { ALL_CITY_TEMPLATE_DEFAULT } from '@/lib/data/allCityTemplate'
import type { AllCityIssue } from '@/lib/allCityIssues'
import type { AllCityDepot, AllCityPage, AllCitySeo, AllCityState, AllCityTemplateText, AllCityVariant } from '@/types/allCity'

/**
 * The admin side of the /all-city/ pages (app/admin/all-city-pages): the
 * editor's form shape, the list's filters, and bulk edits. Pure; tested in
 * tests/unit/allCityValidate.test.ts.
 */

/** A page as the editor shows it: every optional field present (blank = none / the template's). */
export type AllCityPageForm = Omit<AllCityPage, 'slug' | 'keywordHeading' | 'hidden' | 'redirectTo' | 'seo' | 'text'> & {
  keywordHeading: string
  hidden: boolean
  redirectTo: string
  seo: Required<AllCitySeo>
  text: AllCityTemplateText
}

const BLANK_TEXT: AllCityTemplateText = Object.fromEntries(
  Object.entries(ALL_CITY_TEMPLATE_DEFAULT.city).map(([key, value]) => [key, Array.isArray(value) ? [] : '']),
) as unknown as AllCityTemplateText

export function toAllCityPageForm(page: AllCityPage): AllCityPageForm {
  return {
    city: page.city,
    state: page.state,
    depotKey: page.depotKey,
    variant: page.variant,
    h1: page.h1,
    keywordHeading: page.keywordHeading ?? '',
    seo: {
      title: page.seo.title,
      description: page.seo.description,
      focusKeyphrase: page.seo.focusKeyphrase ?? '',
      keywords: page.seo.keywords ?? [],
      noindex: page.seo.noindex ?? false,
      canonical: page.seo.canonical ?? '',
    },
    lists: { ...page.lists },
    hidden: page.hidden ?? false,
    redirectTo: page.redirectTo ?? '',
    text: { ...BLANK_TEXT, ...page.text },
  }
}

// ─── The list ────────────────────────────────────────────────────────────────

export type AllCityRowStatus = 'seed' | 'edited' | 'new'

/** One row of the admin list: the working copy, and what it is relative to the seed. */
export type AllCityAdminRow = {
  page: AllCityPage
  status: AllCityRowStatus
  hasDraft: boolean
  issues: AllCityIssue[]
}

export type AllCityFilter = {
  q?: string
  state?: AllCityState | ''
  depot?: string
  variant?: AllCityVariant | ''
  list?: 'popular' | 'viewAll' | 'none' | ''
  show?: 'edited' | 'draft' | 'new' | 'issues' | 'noindex' | 'hidden' | 'redirect' | ''
}

export const ALL_CITY_SHOW_LABELS: Record<NonNullable<AllCityFilter['show']>, string> = {
  '': 'All pages',
  edited: 'Edited',
  draft: 'With a draft',
  new: 'Created here',
  issues: 'Duplicates & issues',
  noindex: 'noindex',
  hidden: 'Hidden',
  redirect: 'Redirected',
}

export function matchesAllCityFilter(row: AllCityAdminRow, filter: AllCityFilter): boolean {
  const { page } = row
  if (filter.state && page.state !== filter.state) return false
  if (filter.depot && page.depotKey !== filter.depot) return false
  if (filter.variant && page.variant !== filter.variant) return false
  if (filter.list === 'popular' && !page.lists.popular) return false
  if (filter.list === 'viewAll' && !page.lists.viewAll) return false
  if (filter.list === 'none' && (page.lists.popular || page.lists.viewAll)) return false
  switch (filter.show) {
    case 'edited':
      if (row.status === 'seed' && !row.hasDraft) return false
      break
    case 'draft':
      if (!row.hasDraft) return false
      break
    case 'new':
      if (row.status !== 'new') return false
      break
    case 'issues':
      if (!row.issues.length) return false
      break
    case 'noindex':
      if (!page.seo.noindex) return false
      break
    case 'hidden':
      if (!page.hidden) return false
      break
    case 'redirect':
      if (!page.redirectTo) return false
      break
  }
  const q = filter.q?.trim().toLowerCase()
  if (q && ![page.slug, page.city, page.h1, page.seo.title].some((value) => value.toLowerCase().includes(q))) return false
  return true
}

// ─── Bulk edits ──────────────────────────────────────────────────────────────

/** What a bulk edit sets on every page it touches. Absent = leave as it is. */
export type AllCityBulkChange = {
  depotKey?: string
  popular?: boolean
  viewAll?: boolean
  noindex?: boolean
  hidden?: boolean
  /** Replace text in one field ("Lowest Price" → "Best Prices" in every title). Case-sensitive, every occurrence. */
  replace?: { field: 'h1' | 'title' | 'description'; find: string; with: string }
}

export function applyAllCityBulkChange(page: AllCityPage, change: AllCityBulkChange): AllCityPage {
  const next: AllCityPage = { ...page, seo: { ...page.seo }, lists: { ...page.lists } }
  if (change.depotKey) next.depotKey = change.depotKey
  if (change.popular !== undefined) next.lists.popular = change.popular
  if (change.viewAll !== undefined) next.lists.viewAll = change.viewAll
  if (change.noindex !== undefined) next.seo.noindex = change.noindex
  if (change.hidden !== undefined) next.hidden = change.hidden
  const r = change.replace
  if (r?.find) {
    if (r.field === 'h1') next.h1 = next.h1.split(r.find).join(r.with)
    if (r.field === 'title') next.seo.title = next.seo.title.split(r.find).join(r.with)
    if (r.field === 'description') next.seo.description = next.seo.description.split(r.find).join(r.with)
  }
  return next
}

/** The most pages one bulk edit or bulk publish may touch: a few multi-gets and one pipeline. */
export const ALL_CITY_BULK_LIMIT = 2000

// ─── Depots ──────────────────────────────────────────────────────────────────

/** A depot as the editor shows it: the depot-city banner present (null = use the city variant's). */
export type AllCityDepotForm = Omit<AllCityDepot, 'depotCityBanner'> & {
  depotCityBanner: AllCityDepot['banner'] | null
}

export function toAllCityDepotForm(depot: AllCityDepot): AllCityDepotForm {
  return { ...depot, depotCityBanner: depot.depotCityBanner ?? null }
}
