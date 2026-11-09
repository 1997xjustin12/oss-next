import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { discardLocationTemplateAction, publishLocationTemplateAction, saveLocationTemplateDraftAction } from '@/actions/locationPages'
import { ADMIN_ROUTES } from '@/config/admin'
import { editorStatus } from '@/lib/adminStatus'
import { LOCATION_PAGES } from '@/lib/data/locationPages'
import { DEPOT_FEATURED_SPECS } from '@/services/search.service'
import { readLocationTemplateState } from '@/services/locationPage.service'
import { LocationTemplateEditor } from '../_components/LocationTemplateEditor'

export const metadata: Metadata = { title: 'Location page template', robots: { index: false, follow: false } }

export default function LocationTemplatePage() {
  return (
    <>
      <Link href={ADMIN_ROUTES.LOCATION_PAGES} className="inline-flex items-center gap-1 text-sm text-theme-muted hover:text-theme-dark dark:text-neutral-400">
        <ArrowLeft className="h-4 w-4" />
        Location Pages
      </Link>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Template</h1>
      <p className="mt-1 mb-5 max-w-2xl text-sm text-theme-muted dark:text-neutral-400">
        What every location page shares: its sections and their order, all the wording (with placeholders for each place), the images, the products row,
        the delivery photos and the FAQ. A location can still word anything its own way on its screen. Publishing changes every location page.
      </p>
      <Suspense fallback={<p className="text-sm text-theme-muted">Loading…</p>}>
        <Editor />
      </Suspense>
    </>
  )
}

async function Editor() {
  const state = await readLocationTemplateState()
  const locations = LOCATION_PAGES.map((page) => ({ slug: page.slug, label: page.place.label }))
  return (
    <LocationTemplateEditor
      initialValue={state.value}
      hasDraft={state.hasDraft}
      status={editorStatus(state)}
      previewHref={ADMIN_ROUTES.LOCATION_PREVIEW(locations[0].slug)}
      locations={locations}
      specOptions={DEPOT_FEATURED_SPECS.map((spec) => ({ value: spec.key, label: spec.label }))}
      save={saveLocationTemplateDraftAction}
      publish={publishLocationTemplateAction}
      discard={discardLocationTemplateAction}
    />
  )
}
