import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AlertTriangle, ArrowLeft, ExternalLink } from 'lucide-react'
import { discardAllCityPageAction, publishAllCityPageAction, saveAllCityPageDraftAction } from '@/actions/allCityPages'
import { ADMIN_ROUTES } from '@/config/admin'
import { editorStatus } from '@/lib/adminStatus'
import { toAllCityPageForm } from '@/lib/allCityAdmin'
import { ALL_CITY_STATE_NAMES, allCityPath } from '@/lib/allCityPage'
import { ALL_CITY_STATES } from '@/lib/allCityValidate'
import { ALL_CITY_DEPOTS } from '@/lib/data/allCityDepots'
import { readAllCityAdminRows, readAllCityPageState, readAllCityTemplateState } from '@/services/allCity.service'
import { AllCityPageEditor } from '../../_components/AllCityPageEditor'

type Props = { params: Promise<{ slug: string }> }

export const metadata: Metadata = { title: 'All City page', robots: { index: false, follow: false } }

// 8,539 pages: none is built ahead; each screen renders on request.
export function generateStaticParams() {
  return [{ slug: 'storage-units-cocoa-beach-fl' }]
}

export default function AllCityPageAdmin({ params }: Props) {
  return (
    <>
      <Link href={ADMIN_ROUTES.ALL_CITY} className="inline-flex items-center gap-1 text-sm text-theme-muted hover:text-theme-dark dark:text-neutral-400">
        <ArrowLeft className="h-4 w-4" />
        All City Pages
      </Link>
      <Suspense fallback={<p className="mt-4 text-sm text-theme-muted">Loading…</p>}>
        <Editor params={params} />
      </Suspense>
    </>
  )
}

async function Editor({ params }: Props) {
  const { slug } = await params
  const [state, template, rows] = await Promise.all([readAllCityPageState(slug), readAllCityTemplateState(), readAllCityAdminRows()])
  if (!state) notFound()
  const page = state.value
  const issues = rows.find((row) => row.page.slug === slug)?.issues ?? []
  const label = `${page.city}, ${page.state}`

  return (
    <>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">{label}</h1>
      <p className="mt-1 mb-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-theme-muted dark:text-neutral-400">
        {state.hasPublished || !rows.some((row) => row.page.slug === slug && row.status === 'new') ? (
          <a href={allCityPath(slug)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline">
            {allCityPath(slug)}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        ) : (
          <span>{allCityPath(slug)} (not live until published)</span>
        )}
      </p>

      {issues.length > 0 && (
        <div role="note" className="mb-5 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          <p className="flex items-center gap-1.5 font-semibold">
            <AlertTriangle className="h-4 w-4" aria-hidden />
            Worth a look
          </p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            {issues.map((issue, i) => (
              <li key={i}>
                {issue.message}
                {issue.twins.length > 0 && (
                  <>
                    {': '}
                    {issue.twins.map((twin, j) => (
                      <span key={twin}>
                        {j > 0 && ', '}
                        <Link href={ADMIN_ROUTES.ALL_CITY_PAGE(twin)} className="underline">
                          {twin}
                        </Link>
                      </span>
                    ))}
                  </>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-1 text-xs">Options: fix the text, set a canonical, noindex, hide it, or redirect it to its twin.</p>
        </div>
      )}

      <AllCityPageEditor
        label={label}
        initialValue={toAllCityPageForm(page)}
        templateText={template.value[page.variant]}
        stateOptions={ALL_CITY_STATES.map((st) => ({ value: st, label: `${ALL_CITY_STATE_NAMES[st]} (${st})` }))}
        depotOptions={Object.values(ALL_CITY_DEPOTS).map((depot) => ({ value: depot.key, label: depot.depot }))}
        hasDraft={state.hasDraft}
        status={editorStatus(state)}
        previewHref={ADMIN_ROUTES.ALL_CITY_PREVIEW(slug)}
        save={saveAllCityPageDraftAction.bind(null, slug)}
        publish={publishAllCityPageAction.bind(null, slug)}
        discard={discardAllCityPageAction.bind(null, slug)}
      />
    </>
  )
}
