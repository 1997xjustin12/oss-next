import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { discardAllCityOldUrlsAction, publishAllCityOldUrlsAction, saveAllCityOldUrlsDraftAction } from '@/actions/allCityPages'
import { ADMIN_ROUTES } from '@/config/admin'
import { editorStatus } from '@/lib/adminStatus'
import { readAllCityOldUrlsState } from '@/services/allCity.service'
import { AllCityOldUrlsEditor } from '../_components/AllCityOldUrlsEditor'

export const metadata: Metadata = { title: 'All City Pages — Old URL redirects', robots: { index: false, follow: false } }

export default function AllCityOldUrlsAdmin() {
  return (
    <>
      <Link href={ADMIN_ROUTES.ALL_CITY} className="inline-flex items-center gap-1 text-sm text-theme-muted hover:text-theme-dark dark:text-neutral-400">
        <ArrowLeft className="h-4 w-4" />
        All City Pages
      </Link>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Old URL redirects</h1>
      <p className="mt-1 mb-5 max-w-3xl text-sm text-theme-muted dark:text-neutral-400">
        City pages that lived outside /all-city/ on the old site. A visit to an old URL here is sent to its /all-city/ page with a permanent (301) redirect, so its links and search ranking carry over. Save draft checks every row; Publish puts the list live within a minute (browsers and the CDN may keep a redirect for up to an hour).
      </p>
      <Suspense fallback={<p className="text-sm text-theme-muted">Loading…</p>}>
        <Editor />
      </Suspense>
    </>
  )
}

async function Editor() {
  const state = await readAllCityOldUrlsState()
  return (
    <AllCityOldUrlsEditor
      initialValue={state.value}
      hasDraft={state.hasDraft}
      status={editorStatus(state)}
      save={saveAllCityOldUrlsDraftAction}
      publish={publishAllCityOldUrlsAction}
      discard={discardAllCityOldUrlsAction}
    />
  )
}
