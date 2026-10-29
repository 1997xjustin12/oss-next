import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ADMIN_ROUTES } from '@/config/admin'
import { readGbpSharedState } from '@/services/gbp.service'
import { GbpSharedEditor } from '../_components/GbpSharedEditor'
import { editorStatus } from '../_components/gbpAdminStatus'
import { gbpPreviewLocations } from '../_components/gbpPreviewLocations'

export const metadata: Metadata = { title: 'GBP shared content', robots: { index: false, follow: false } }

export default function GbpSharedPage() {
  return (
    <>
      <Link href={ADMIN_ROUTES.GBP} className="inline-flex items-center gap-1 text-sm text-theme-muted hover:text-theme-dark dark:text-neutral-400">
        <ArrowLeft className="h-4 w-4" />
        GBP Pages
      </Link>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Shared content</h1>
      <p className="mt-1 mb-5 max-w-2xl text-sm text-theme-muted dark:text-neutral-400">
        What every GBP page shows. Publishing changes all of them at once. Per-location content (phone, headings, About, blog cards, FAQs, map) is on each
        location’s screen.
      </p>
      <Suspense fallback={<p className="text-sm text-theme-muted">Loading…</p>}>
        <Editor />
      </Suspense>
    </>
  )
}

async function Editor() {
  const state = await readGbpSharedState()
  const locations = gbpPreviewLocations()
  return (
    <GbpSharedEditor
      initialValue={state.value}
      hasDraft={state.hasDraft}
      status={editorStatus(state)}
      previewHref={ADMIN_ROUTES.GBP_PREVIEW(locations[0].slug)}
      locations={locations}
    />
  )
}
