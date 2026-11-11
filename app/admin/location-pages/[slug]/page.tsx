import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink, FileCog } from 'lucide-react'
import { discardLocationPageAction, publishLocationPageAction, saveLocationPageDraftAction } from '@/actions/locationPages'
import { ADMIN_ROUTES } from '@/config/admin'
import { DEPOT_SNAPSHOT } from '@/config/depotCoordinates'
import { depotSelectOptions } from '@/lib/depotOptions'
import { editorStatus } from '@/lib/adminStatus'
import { LOCATION_PAGES } from '@/lib/data/locationPages'
import { toLocationPageForm } from '@/lib/locationAdmin'
import { locationPath } from '@/lib/locationPage'
import { DEPOT_FEATURED_SPECS } from '@/services/search.service'
import { readLocationPageState, readLocationTemplateState } from '@/services/locationPage.service'
import { LocationPageEditor } from '../_components/LocationPageEditor'

type Props = { params: Promise<{ slug: string }> }

export const metadata: Metadata = { title: 'Location page', robots: { index: false, follow: false } }

export function generateStaticParams() {
  return LOCATION_PAGES.map((page) => ({ slug: page.slug }))
}

export default function LocationPageAdmin({ params }: Props) {
  return (
    <>
      <Link href={ADMIN_ROUTES.LOCATION_PAGES} className="inline-flex items-center gap-1 text-sm text-theme-muted hover:text-theme-dark dark:text-neutral-400">
        <ArrowLeft className="h-4 w-4" />
        Location Pages
      </Link>
      <Suspense fallback={<p className="mt-4 text-sm text-theme-muted">Loading…</p>}>
        <Editor params={params} />
      </Suspense>
    </>
  )
}

async function Editor({ params }: Props) {
  const { slug } = await params
  const [state, template] = await Promise.all([readLocationPageState(slug), readLocationTemplateState()])
  if (!state) notFound()
  const label = state.value.place.label

  return (
    <>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">{label}</h1>
      <p className="mt-1 mb-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-theme-muted dark:text-neutral-400">
        <a href={locationPath(slug)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline">
          {locationPath(slug)}
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
        <Link href={ADMIN_ROUTES.PAGE_CONFIGURATOR_EDIT(`location-${slug}`)} className="inline-flex items-center gap-1 font-semibold hover:underline">
          <FileCog className="h-4 w-4" aria-hidden />
          Title, description &amp; scripts (Page Configurator)
        </Link>
      </p>
      <LocationPageEditor
        label={label}
        initialValue={toLocationPageForm(state.value, template.value)}
        templateText={template.value.text}
        templateSections={template.value.sections}
        specOptions={DEPOT_FEATURED_SPECS.map((spec) => ({ value: spec.key, label: spec.label }))}
        depotOptions={depotSelectOptions(DEPOT_SNAPSHOT)}
        hasDraft={state.hasDraft}
        status={editorStatus(state)}
        previewHref={ADMIN_ROUTES.LOCATION_PREVIEW(slug)}
        save={saveLocationPageDraftAction.bind(null, slug)}
        publish={publishLocationPageAction.bind(null, slug)}
        discard={discardLocationPageAction.bind(null, slug)}
      />
    </>
  )
}
