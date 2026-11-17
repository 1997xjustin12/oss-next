import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { ADMIN_ROUTES } from '@/config/admin'
import { ALL_CITY_DEPOTS } from '@/lib/data/allCityDepots'
import { readAllCityAdminRows, readAllCityDepotState } from '@/services/allCity.service'

export const metadata: Metadata = { title: 'All City Pages — Depots', robots: { index: false, follow: false } }

const BADGE = 'rounded-full px-2 py-0.5 text-[11px] font-bold'

export default function AllCityDepotsAdmin() {
  return (
    <>
      <Link href={ADMIN_ROUTES.ALL_CITY} className="inline-flex items-center gap-1 text-sm text-theme-muted hover:text-theme-dark dark:text-neutral-400">
        <ArrowLeft className="h-4 w-4" />
        All City Pages
      </Link>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Depots</h1>
      <p className="mt-1 mb-5 max-w-3xl text-sm text-theme-muted dark:text-neutral-400">
        What every page on a depot shows of it: the banner, the four product cards and the location buttons. Publishing a depot refreshes its pages.
      </p>
      <Suspense fallback={<p className="text-sm text-theme-muted">Loading…</p>}>
        <DepotList />
      </Suspense>
    </>
  )
}

async function DepotList() {
  const keys = Object.keys(ALL_CITY_DEPOTS)
  const [states, rows] = await Promise.all([Promise.all(keys.map((key) => readAllCityDepotState(key))), readAllCityAdminRows()])
  const pagesOn = (key: string) => rows.filter((row) => row.page.depotKey === key).length

  return (
    <ul className="overflow-hidden rounded-lg border border-theme-border bg-theme-bg dark:border-neutral-800 dark:bg-neutral-900">
      {states
        .flatMap((state) => (state ? [state] : []))
        .sort((a, b) => a.value.depot.localeCompare(b.value.depot))
        .map(({ value: depot, hasDraft, hasPublished }) => (
          <li key={depot.key} className="border-b border-theme-border last:border-b-0 dark:border-neutral-800">
            <Link href={ADMIN_ROUTES.ALL_CITY_DEPOT(depot.key)} className="flex items-center gap-3 p-3 hover:bg-theme-subtle dark:hover:bg-neutral-800/60">
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{depot.depot}</span>
                <span className="block text-xs text-theme-muted dark:text-neutral-500">
                  {pagesOn(depot.key).toLocaleString('en-US')} pages · {depot.specs.length} product cards
                </span>
              </span>
              {hasPublished && <span className={`${BADGE} bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300`}>Edited</span>}
              {hasDraft && <span className={`${BADGE} bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300`}>Draft</span>}
              <ChevronRight className="h-4 w-4 text-theme-muted" aria-hidden />
            </Link>
          </li>
        ))}
    </ul>
  )
}
