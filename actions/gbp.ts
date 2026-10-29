'use server'

import { updateTag } from 'next/cache'
import { notFound } from 'next/navigation'
import { CACHE_TAGS } from '@/config/cache'
import { GBP_SHARED_DEFAULTS } from '@/lib/data/gbpShared'
import { GBP_TEMPLATE_DEFAULT } from '@/lib/data/gbpTemplate'
import { currentAdminUser } from '@/lib/adminGuard'
import { GBP_CONTENT_KEYS, GBP_SEO_PAGE_KEYS, fromSeoForm, type GbpSeoForm } from '@/lib/gbpAdmin'
import { conformGbpPage, conformGbpShared, conformGbpTemplate, phoneE164 } from '@/lib/gbpValidate'
import {
  discardGbpDraft,
  discardGbpSeoDraft,
  gbpTag,
  publishGbpDraft,
  readGbpPageState,
  readGbpSeoDraft,
  readGbpSharedState,
  readGbpTemplateState,
  saveGbpDraft,
  saveGbpSeoDraft,
} from '@/services/gbp.service'
import { savePageSeo } from '@/services/seo.service'

// Mutations behind the GBP admin screens (app/admin/gbp). Every action checks
// for an admin itself: the admin layout's gate doesn't cover a Server Action,
// which is its own endpoint.
//
// Drafts are saved as validated records; Publish copies a draft over the
// published record and refreshes only that record's cache tag (updateTag, so
// the admin sees their own write at once).

export type GbpActionResult = { ok: true; at: string } | { ok: false; error: string; rejected?: string[] }

async function admin(): Promise<string> {
  const user = await currentAdminUser()
  if (!user) notFound()
  return user
}

const ok = (): GbpActionResult => ({ ok: true, at: new Date().toISOString() })
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

/** Fields the validator replaced with the current value although the form changed them. */
function rejectedKeys(keys: readonly string[], submitted: Record<string, unknown>, base: Record<string, unknown>, result: Record<string, unknown>): string[] {
  return keys.filter((key) => key in submitted && same(result[key], base[key]) && !same(submitted[key], base[key]))
}

function rejection(rejected: string[]): GbpActionResult {
  return { ok: false, error: `Not saved: ${rejected.join(', ')} ${rejected.length === 1 ? 'is' : 'are'} not valid.`, rejected }
}

// ─── A location: content and SEO share one draft, published together ─────────

async function savePagePatch(slug: string, keys: readonly string[], patch: Record<string, unknown>, by: string): Promise<GbpActionResult | string[]> {
  const state = await readGbpPageState(slug)
  if (!state) notFound()
  const base = state.value as unknown as Record<string, unknown>
  const submitted = Object.fromEntries(keys.filter((key) => key in patch).map((key) => [key, patch[key]]))
  const next = conformGbpPage({ ...base, ...submitted }, state.value)
  const rejected = rejectedKeys(keys, submitted, base, next as unknown as Record<string, unknown>)
  if (rejected.length) return rejected
  await saveGbpDraft('page', slug, next, by)
  return ok()
}

export async function saveGbpContentDraftAction(slug: string, content: Record<string, unknown>): Promise<GbpActionResult> {
  const by = await admin()
  // The E.164 form is derived, never typed: every call link is built from it.
  const contact = content.contact as Record<string, unknown> | undefined
  if (contact) {
    const e164 = phoneE164(contact.phone)
    if (!e164) return rejection(['contact.phone'])
    contact.phoneE164 = e164
  }
  // A card with its URL cleared has no post (null), rather than an invalid URL.
  if (Array.isArray(content.blogCards)) {
    content.blogCards = content.blogCards.map((card) =>
      card && typeof card === 'object' && (card as { url?: unknown }).url === '' ? { ...card, url: null } : card,
    )
  }
  const result = await savePagePatch(slug, GBP_CONTENT_KEYS, content, by)
  return Array.isArray(result) ? rejection(result) : result
}

export async function saveGbpSeoDraftAction(slug: string, form: GbpSeoForm, page: Record<string, unknown>): Promise<GbpActionResult> {
  const by = await admin()
  const { seo, rejected } = fromSeoForm(form)
  if (rejected.length) return rejection(rejected)
  const result = await savePagePatch(slug, GBP_SEO_PAGE_KEYS, page, by)
  if (Array.isArray(result)) return rejection(result)
  await saveGbpSeoDraft(slug, seo, by)
  return result
}

export async function publishGbpLocationAction(slug: string): Promise<GbpActionResult> {
  const by = await admin()
  if (!(await readGbpPageState(slug))) notFound()
  const published = await publishGbpDraft('page', slug, by)
  const seo = await readGbpSeoDraft(slug)
  if (seo) {
    await savePageSeo(`/${slug}`, { ...seo, updatedAt: new Date().toISOString() })
    await discardGbpSeoDraft(slug)
    updateTag(CACHE_TAGS.SEO)
  }
  if (!published && !seo) return { ok: false, error: 'Nothing to publish: there is no draft.' }
  updateTag(gbpTag('page', slug))
  return ok()
}

export async function discardGbpLocationAction(slug: string): Promise<GbpActionResult> {
  await admin()
  await Promise.all([discardGbpDraft('page', slug), discardGbpSeoDraft(slug)])
  return ok()
}

// ─── Shared content and template ────────────────────────────────────────────

export async function saveGbpSharedDraftAction(data: Record<string, unknown>): Promise<GbpActionResult> {
  const by = await admin()
  const state = await readGbpSharedState()
  const next = conformGbpShared(data, state.value)
  const rejected = rejectedKeys(Object.keys(GBP_SHARED_DEFAULTS), data, state.value as unknown as Record<string, unknown>, next as unknown as Record<string, unknown>)
  if (rejected.length) return rejection(rejected)
  await saveGbpDraft('shared', undefined, next, by)
  return ok()
}

export async function saveGbpTemplateDraftAction(data: Record<string, unknown>): Promise<GbpActionResult> {
  const by = await admin()
  const state = await readGbpTemplateState()
  const next = conformGbpTemplate(data, state.value)
  const rejected = rejectedKeys(Object.keys(GBP_TEMPLATE_DEFAULT), data, state.value as unknown as Record<string, unknown>, next as unknown as Record<string, unknown>)
  if (rejected.length) return rejection(rejected)
  // Sections the validator dropped (a library section with no content, a
  // duplicate) are a rejection too, not a silent loss.
  const sent = Array.isArray(data.sections) ? data.sections.length : 0
  if (sent && next.sections.length !== sent) return { ok: false, error: 'Not saved: a section has missing or invalid content.' }
  await saveGbpDraft('template', undefined, next, by)
  return ok()
}

export async function publishGbpRecordAction(kind: 'shared' | 'template'): Promise<GbpActionResult> {
  const by = await admin()
  if (!(await publishGbpDraft(kind, undefined, by))) return { ok: false, error: 'Nothing to publish: there is no draft.' }
  updateTag(gbpTag(kind))
  return ok()
}

export async function discardGbpRecordAction(kind: 'shared' | 'template'): Promise<GbpActionResult> {
  await admin()
  await discardGbpDraft(kind)
  return ok()
}
