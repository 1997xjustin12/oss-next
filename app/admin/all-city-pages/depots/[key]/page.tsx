import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { discardAllCityDepotAction, publishAllCityDepotAction, saveAllCityDepotDraftAction } from '@/actions/allCityPages'
import { ADMIN_ROUTES } from '@/config/admin'
import { editorStatus } from '@/lib/adminStatus'
import { toAllCityDepotForm } from '@/lib/allCityAdmin'
import { ALL_CITY_STATE_NAMES } from '@/lib/allCityPage'
import { ALL_CITY_STATES } from '@/lib/allCityValidate'
import { ALL_CITY_DEPOTS } from '@/lib/data/allCityDepots'
import { LOCATION_PAGE_SLUGS } from '@/lib/data/locationPageSlugs'
import { readAllCityAdminRows, readAllCityDepotState } from '@/services/allCity.service'
import { AllCityDepotEditor } from '../../_components/AllCityDepotEditor'

type Props = { params: Promise<{ key: string }> }

export const metadata: Metadata = { title: 'All City Pages — Depot', robots: { index: false, follow: false } }

export function generateStaticParams() {
  return Object.keys(ALL_CITY_DEPOTS).map((key) => ({ key }))
}

export default function AllCityDepotAdmin({ params }: Props) {
  return (
    <>
      <Link href={ADMIN_ROUTES.ALL_CITY_DEPOTS} className="inline-flex items-center gap-1 text-sm text-theme-muted hover:text-theme-dark dark:text-neutral-400">
        <ArrowLeft className="h-4 w-4" />
        Depots
      </Link>
      <Suspense fallback={<p className="mt-4 text-sm text-theme-muted">Loading…</p>}>
        <Editor params={params} />
      </Suspense>
    </>
  )
}

async function Editor({ params }: Props) {
  const { key } = await params
  const [state, rows] = await Promise.all([readAllCityDepotState(key), readAllCityAdminRows()])
  if (!state) notFound()
  const onDepot = rows.filter((row) => row.page.depotKey === key)
  // Preview on one city page and, where the depot has one, its depot-city page.
  const previewPages = [onDepot.find((row) => row.page.variant === 'city'), onDepot.find((row) => row.page.variant === 'depotCity')]
    .flatMap((row) => (row ? [{ slug: row.page.slug, label: `${row.page.city} (${row.page.variant === 'city' ? 'city page' : 'depot-city page'})` }] : []))

  return (
    <>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">{state.value.depot}</h1>
      <p className="mt-1 mb-5 text-sm text-theme-muted dark:text-neutral-400">{onDepot.length.toLocaleString('en-US')} pages on this depot.</p>
      <AllCityDepotEditor
        label={state.value.depot}
        pageCount={onDepot.length}
        initialValue={toAllCityDepotForm(state.value)}
        stateOptions={ALL_CITY_STATES.map((st) => ({ value: st, label: `${ALL_CITY_STATE_NAMES[st]} (${st})` }))}
        locationOptions={LOCATION_PAGE_SLUGS.map((slug) => ({ value: slug, label: `/where-to-buy-shipping-containers/${slug}` }))}
        hasDraft={state.hasDraft}
        status={editorStatus(state)}
        previewPages={previewPages}
        previewHref={ADMIN_ROUTES.ALL_CITY_PREVIEW(previewPages[0]?.slug ?? 'storage-units-cocoa-beach-fl')}
        save={saveAllCityDepotDraftAction.bind(null, key)}
        publish={publishAllCityDepotAction.bind(null, key)}
        discard={discardAllCityDepotAction.bind(null, key)}
      />
    </>
  )
}
