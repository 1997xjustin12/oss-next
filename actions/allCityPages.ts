'use server'

import { updateTag } from 'next/cache'
import { notFound } from 'next/navigation'
import { CACHE_TAGS } from '@/config/cache'
import { currentAdminUser } from '@/lib/adminGuard'
import { ALL_CITY_BULK_LIMIT, applyAllCityBulkChange, matchesAllCityFilter, toAllCityDepotForm, toAllCityPageForm, type AllCityBulkChange, type AllCityFilter } from '@/lib/allCityAdmin'
import { getSeedPage } from '@/lib/allCitySeed'
import { ALL_CITY_DEPOTS } from '@/lib/data/allCityDepots'
import { SLUG_PATTERN, conformAllCityDepot, conformAllCityPage, conformAllCityTemplate } from '@/lib/allCityValidate'
import {
  allCityListsTag,
  allCityPageTag,
  blankAllCityPage,
  discardAllCityDraft,
  publishAllCityDraft,
  publishAllCityPageDrafts,
  readAllCityAdminRows,
  readAllCityDepotState,
  readAllCityPageState,
  readAllCityTemplateState,
  readAllCityWorkingCopies,
  readPublishedAllCityPage,
  saveAllCityDraft,
  saveAllCityPageDrafts,
} from '@/services/allCity.service'
import type { AdminActionResult } from '@/components/admin/EditorShell'
import type { AllCityDepot, AllCityPage, AllCityState, AllCityVariant } from '@/types/allCity'

// Mutations behind Admin → All City Pages (app/admin/all-city-pages). Every
// action checks for an admin itself: the admin layout's gate doesn't cover a
// Server Action, which is its own endpoint.
//
// Drafts are saved as validated records (lib/allCityValidate.ts); Publish
// copies a draft over the published record and refreshes only what it
// changes (updateTag, so the admin sees their own write at once): a page's
// own tag and its state's lists; the template and depots refresh every page.

async function admin(): Promise<string> {
  const user = await currentAdminUser()
  if (!user) notFound()
  return user
}

const ok = (): AdminActionResult => ({ ok: true, at: new Date().toISOString() })
const fail = (error: string): AdminActionResult => ({ ok: false, error })
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

/**
 * Top-level fields the validator did not take as sent: it kept the stored
 * value although the form changed it. Reported rather than saved silently, so
 * a typo in a link is not quietly undone (as the location actions do).
 */
function rejectedKeys(submitted: Record<string, unknown>, base: Record<string, unknown>, result: Record<string, unknown>): string[] {
  return Object.keys(submitted).filter((key) => !same(submitted[key], base[key]) && !same(result[key], submitted[key]) && same(result[key], base[key]))
}

function rejection(rejected: string[]): AdminActionResult {
  return { ok: false, error: `Not saved: ${rejected.join(', ')} ${rejected.length === 1 ? 'is' : 'are'} not valid.`, rejected }
}

/** A page's lists live under its state's tag: refresh the old state's and the new one's. */
function refreshPage(slug: string, before: AllCityPage | null, after: AllCityPage | null): void {
  updateTag(allCityPageTag(slug))
  const states = new Set<AllCityState>([before?.state, after?.state].filter((s): s is AllCityState => !!s))
  for (const state of states) updateTag(allCityListsTag(state))
}

// ─── One page ────────────────────────────────────────────────────────────────

export async function saveAllCityPageDraftAction(slug: string, data: Record<string, unknown>): Promise<AdminActionResult> {
  const by = await admin()
  const state = await readAllCityPageState(slug)
  if (!state) notFound()
  const next = conformAllCityPage({ ...state.value, ...data }, state.value)
  // Compared as forms: the editor sends blanks where the record has nothing.
  const asForm = (page: AllCityPage) => toAllCityPageForm(page) as unknown as Record<string, unknown>
  const rejected = rejectedKeys(data, asForm(state.value), asForm(next))
  if (rejected.length) return rejection(rejected)
  if (next.redirectTo) {
    const target = await readAllCityPageState(next.redirectTo)
    if (!target || target.value.hidden || target.value.redirectTo) {
      return fail(`Not saved: /all-city/${next.redirectTo} is not a live page to redirect to.`)
    }
  }
  await saveAllCityDraft('page', slug, next, by)
  return ok()
}

export async function publishAllCityPageAction(slug: string): Promise<AdminActionResult> {
  const by = await admin()
  const [state, before] = await Promise.all([readAllCityPageState(slug), readPublishedAllCityPage(slug)])
  if (!state) notFound()
  if (!(await publishAllCityDraft('page', slug, by))) return fail('Nothing to publish: there is no draft.')
  refreshPage(slug, before, state.value)
  return ok()
}

export async function discardAllCityPageAction(slug: string): Promise<AdminActionResult> {
  await admin()
  await discardAllCityDraft('page', slug)
  return ok()
}

/**
 * A page WordPress never had. Saved as a draft (it goes live on Publish, like
 * any edit), from the template, with the essentials filled in.
 */
export async function createAllCityPageAction(input: {
  slug: string
  city: string
  state: AllCityState
  depotKey: string
  variant: AllCityVariant
  h1: string
  title: string
}): Promise<AdminActionResult> {
  const by = await admin()
  const slug = input.slug.trim().toLowerCase()
  if (!SLUG_PATTERN.test(slug)) return fail('The URL may use only lower-case letters, digits and single hyphens (storage-units-springfield-il).')
  if (getSeedPage(slug) || (await readAllCityPageState(slug))) return fail(`/all-city/${slug} already exists.`)
  if (!ALL_CITY_DEPOTS[input.depotKey]) return fail('Choose a depot.')
  const page = conformAllCityPage(
    {
      city: input.city,
      state: input.state,
      depotKey: input.depotKey,
      variant: input.variant,
      h1: input.h1,
      seo: { title: input.title, description: '' },
      lists: { popular: false, viewAll: true },
    },
    blankAllCityPage(slug),
  )
  if (!page.city || !page.h1 || !page.seo.title) return fail('City, heading and SEO title are required.')
  await saveAllCityDraft('page', slug, page, by)
  return ok()
}

// ─── Many pages ──────────────────────────────────────────────────────────────

/** Which pages a bulk action applies to: the list's current filter (re-applied here), or the rows ticked on the screen. */
export type AllCityBulkTarget = { filter: AllCityFilter } | { slugs: string[] }

async function targetSlugs(target: AllCityBulkTarget): Promise<string[]> {
  if ('slugs' in target) return [...new Set(target.slugs)]
  return (await readAllCityAdminRows()).filter((row) => matchesAllCityFilter(row, target.filter)).map((row) => row.page.slug)
}

/** One change saved as a draft on each page (validated like a single save); publish them afterwards. */
export async function bulkEditAllCityPagesAction(target: AllCityBulkTarget, change: AllCityBulkChange): Promise<AdminActionResult & { count?: number }> {
  const by = await admin()
  const unique = await targetSlugs(target)
  if (!unique.length) return fail('No pages selected.')
  if (unique.length > ALL_CITY_BULK_LIMIT) return fail(`At most ${ALL_CITY_BULK_LIMIT} pages at a time; narrow the filter.`)
  if (change.depotKey && !ALL_CITY_DEPOTS[change.depotKey]) return fail('Unknown depot.')
  if (change.replace && !change.replace.find) return fail('Say what to replace.')
  const pages = await readAllCityWorkingCopies(unique)
  const next = [...pages.values()].map((page) => conformAllCityPage(applyAllCityBulkChange(page, change), page)).filter((page) => !same(page, pages.get(page.slug)))
  await saveAllCityPageDrafts(next, by)
  return { ...ok(), count: next.length }
}

export async function bulkPublishAllCityPagesAction(target: AllCityBulkTarget): Promise<AdminActionResult & { count?: number }> {
  const by = await admin()
  const unique = await targetSlugs(target)
  if (!unique.length) return fail('No pages selected.')
  if (unique.length > ALL_CITY_BULK_LIMIT) return fail(`At most ${ALL_CITY_BULK_LIMIT} pages at a time; narrow the filter.`)
  const published = await publishAllCityPageDrafts(unique, by)
  if (!published.length) return fail('Nothing to publish: none of these pages has a draft.')
  // Many pages: refresh the group once rather than a tag per page.
  if (published.length > 50) updateTag(CACHE_TAGS.ALL_CITY)
  else for (const { slug, before, after } of published) refreshPage(slug, before, after)
  return { ...ok(), count: published.length }
}

// ─── The template (every page) ───────────────────────────────────────────────

export async function saveAllCityTemplateDraftAction(data: Record<string, unknown>): Promise<AdminActionResult> {
  const by = await admin()
  const state = await readAllCityTemplateState()
  const base = state.value as unknown as Record<string, unknown>
  const next = conformAllCityTemplate({ ...base, ...data }, state.value)
  const rejected = rejectedKeys(data, base, next as unknown as Record<string, unknown>)
  if (rejected.length) return rejection(rejected)
  await saveAllCityDraft('template', undefined, next, by)
  return ok()
}

export async function publishAllCityTemplateAction(): Promise<AdminActionResult> {
  const by = await admin()
  if (!(await publishAllCityDraft('template', undefined, by))) return fail('Nothing to publish: there is no draft.')
  updateTag(CACHE_TAGS.ALL_CITY)
  return ok()
}

export async function discardAllCityTemplateAction(): Promise<AdminActionResult> {
  await admin()
  await discardAllCityDraft('template')
  return ok()
}

// ─── One depot (every page on it) ────────────────────────────────────────────

export async function saveAllCityDepotDraftAction(key: string, data: Record<string, unknown>): Promise<AdminActionResult> {
  const by = await admin()
  const state = await readAllCityDepotState(key)
  if (!state) notFound()
  const next = conformAllCityDepot({ ...state.value, ...data }, state.value)
  // Compared as forms: the editor sends null / [] for "use the city variant's".
  const asForm = (depot: AllCityDepot) => toAllCityDepotForm(depot) as unknown as Record<string, unknown>
  const rejected = rejectedKeys(data, asForm(state.value), asForm(next)).filter((field) => field !== 'key')
  if (rejected.length) return rejection(rejected)
  await saveAllCityDraft('depot', key, next, by)
  return ok()
}

export async function publishAllCityDepotAction(key: string): Promise<AdminActionResult> {
  const by = await admin()
  if (!(await readAllCityDepotState(key))) notFound()
  if (!(await publishAllCityDraft('depot', key, by))) return fail('Nothing to publish: there is no draft.')
  // The depots are read as one cached record, so every page refreshes.
  updateTag(CACHE_TAGS.ALL_CITY)
  return ok()
}

export async function discardAllCityDepotAction(key: string): Promise<AdminActionResult> {
  await admin()
  await discardAllCityDraft('depot', key)
  return ok()
}
