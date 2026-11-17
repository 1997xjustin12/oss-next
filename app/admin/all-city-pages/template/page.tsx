import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { discardAllCityTemplateAction, publishAllCityTemplateAction, saveAllCityTemplateDraftAction } from '@/actions/allCityPages'
import { ADMIN_ROUTES } from '@/config/admin'
import { editorStatus } from '@/lib/adminStatus'
import { readAllCityTemplateState } from '@/services/allCity.service'
import { AllCityTemplateEditor } from '../_components/AllCityTemplateEditor'

export const metadata: Metadata = { title: 'All City Pages — Template', robots: { index: false, follow: false } }

/** A city page and a depot-city page, to preview the draft on both variants. */
const PREVIEW_PAGES = [
  { slug: 'storage-units-cocoa-beach-fl', label: 'Cocoa Beach (city page)' },
  { slug: 'cargo-containers-for-sale-houston', label: 'Houston (depot-city page)' },
] as const

export default function AllCityTemplateAdmin() {
  return (
    <>
      <Link href={ADMIN_ROUTES.ALL_CITY} className="inline-flex items-center gap-1 text-sm text-theme-muted hover:text-theme-dark dark:text-neutral-400">
        <ArrowLeft className="h-4 w-4" />
        All City Pages
      </Link>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Template</h1>
      <p className="mt-1 mb-5 max-w-3xl text-sm text-theme-muted dark:text-neutral-400">
        Every word on every /all-city/ page. A page’s own wording (its screen) replaces a field for that page only; its depot decides the banner, the
        product cards and the location buttons. Publishing refreshes every page.
      </p>
      <Suspense fallback={<p className="text-sm text-theme-muted">Loading…</p>}>
        <Editor />
      </Suspense>
    </>
  )
}

async function Editor() {
  const state = await readAllCityTemplateState()
  return (
    <AllCityTemplateEditor
      initialValue={state.value}
      hasDraft={state.hasDraft}
      status={editorStatus(state)}
      previewPages={PREVIEW_PAGES}
      previewHref={ADMIN_ROUTES.ALL_CITY_PREVIEW(PREVIEW_PAGES[0].slug)}
      save={saveAllCityTemplateDraftAction}
      publish={publishAllCityTemplateAction}
      discard={discardAllCityTemplateAction}
    />
  )
}
