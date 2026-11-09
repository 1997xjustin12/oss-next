'use server'

import { updateTag } from 'next/cache'
import { notFound } from 'next/navigation'
import { CACHE_TAGS } from '@/config/cache'
import { currentAdminUser } from '@/lib/adminGuard'
import { LOCATION_TEMPLATE_DEFAULT } from '@/lib/data/locationTemplate'
import { toLocationPageForm } from '@/lib/locationAdmin'
import { conformLocationPage, conformLocationTemplate } from '@/lib/locationValidate'
import {
  discardLocationDraft,
  locationPageTag,
  publishLocationDraft,
  readLocationPageState,
  readLocationTemplateState,
  saveLocationDraft,
} from '@/services/locationPage.service'
import type { AdminActionResult } from '@/components/admin/EditorShell'

// Mutations behind the location-page admin screens (app/admin/location-pages).
// Every action checks for an admin itself: the admin layout's gate doesn't
// cover a Server Action, which is its own endpoint.
//
// Drafts are saved as validated records; Publish copies a draft over the
// published record and refreshes only that record's cache (updateTag, so the
// admin sees their own write at once). SEO is the Page Configurator's.

async function admin(): Promise<string> {
  const user = await currentAdminUser()
  if (!user) notFound()
  return user
}

const ok = (): AdminActionResult => ({ ok: true, at: new Date().toISOString() })
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

/**
 * Top-level fields the validator did not take as sent: it kept the stored
 * value (or dropped it) although the form changed it. Reported rather than
 * saved silently, so a typo in a URL is not quietly undone.
 */
function rejectedKeys(submitted: Record<string, unknown>, base: Record<string, unknown>, result: Record<string, unknown>): string[] {
  return Object.keys(submitted).filter((key) => !same(submitted[key], base[key]) && !same(result[key], submitted[key]) && same(result[key], base[key]))
}

function rejection(rejected: string[]): AdminActionResult {
  return { ok: false, error: `Not saved: ${rejected.join(', ')} ${rejected.length === 1 ? 'is' : 'are'} not valid.`, rejected }
}

// ─── One location ────────────────────────────────────────────────────────────

export async function saveLocationPageDraftAction(slug: string, data: Record<string, unknown>): Promise<AdminActionResult> {
  const by = await admin()
  const state = await readLocationPageState(slug)
  if (!state) notFound()
  const next = conformLocationPage({ ...(state.value as unknown as Record<string, unknown>), ...data }, state.value)
  // Compared as forms (lib/locationAdmin.ts): the editor sends blanks where the
  // record has nothing ("use the template"), which is not a change.
  const asForm = (page: typeof next) => toLocationPageForm(page, LOCATION_TEMPLATE_DEFAULT) as unknown as Record<string, unknown>
  const rejected = rejectedKeys(data, asForm(state.value), asForm(next))
  if (rejected.length) return rejection(rejected)
  await saveLocationDraft('page', slug, next, by)
  return ok()
}

export async function publishLocationPageAction(slug: string): Promise<AdminActionResult> {
  const by = await admin()
  if (!(await readLocationPageState(slug))) notFound()
  if (!(await publishLocationDraft('page', slug, by))) return { ok: false, error: 'Nothing to publish: there is no draft.' }
  updateTag(locationPageTag(slug))
  return ok()
}

export async function discardLocationPageAction(slug: string): Promise<AdminActionResult> {
  await admin()
  await discardLocationDraft('page', slug)
  return ok()
}

/** Refresh one location's cached page now, without publishing (its own tag only). */
export async function purgeLocationPageCacheAction(slug: string): Promise<AdminActionResult> {
  await admin()
  if (!(await readLocationPageState(slug))) notFound()
  updateTag(locationPageTag(slug))
  return ok()
}

// ─── The template (every location page) ─────────────────────────────────────

export async function saveLocationTemplateDraftAction(data: Record<string, unknown>): Promise<AdminActionResult> {
  const by = await admin()
  const state = await readLocationTemplateState()
  const base = state.value as unknown as Record<string, unknown>
  const next = conformLocationTemplate({ ...base, ...data }, state.value)
  const rejected = rejectedKeys(data, base, next as unknown as Record<string, unknown>)
  if (rejected.length) return rejection(rejected)
  await saveLocationDraft('template', undefined, next, by)
  return ok()
}

export async function publishLocationTemplateAction(): Promise<AdminActionResult> {
  const by = await admin()
  if (!(await publishLocationDraft('template', undefined, by))) return { ok: false, error: 'Nothing to publish: there is no draft.' }
  // The template is every location page's, so the whole group refreshes.
  updateTag(CACHE_TAGS.LOCATION_PAGES)
  return ok()
}

export async function discardLocationTemplateAction(): Promise<AdminActionResult> {
  await admin()
  await discardLocationDraft('template')
  return ok()
}
