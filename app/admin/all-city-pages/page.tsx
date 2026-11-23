import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, CornerDownRight, ExternalLink, Eye, LayoutTemplate, Plus, Warehouse } from 'lucide-react'
import { bulkEditAllCityPagesAction, bulkPublishAllCityPagesAction } from '@/actions/allCityPages'
import { ADMIN_ROUTES } from '@/config/admin'
import { STORE_KEY } from '@/config/store'
import { ALL_CITY_SHOW_LABELS, matchesAllCityFilter, type AllCityFilter } from '@/lib/allCityAdmin'
import { ALL_CITY_STATE_NAMES, allCityPath } from '@/lib/allCityPage'
import { ALL_CITY_SEED_TAKEN_AT } from '@/lib/allCitySeed'
import { ALL_CITY_DEPOTS } from '@/lib/data/allCityDepots'
import { ALL_CITY_STATES } from '@/lib/allCityValidate'
import { readAllCityAdminRows } from '@/services/allCity.service'
import { AllCityBulkPanel } from './_components/AllCityBulkPanel'
import type { AllCityState, AllCityVariant } from '@/types/allCity'

export const metadata: Metadata = { title: 'All City Pages', robots: { index: false, follow: false } }

type SearchParams = Promise<Record<string, string | string[] | undefined>>

const PER_PAGE = 50
const BADGE = 'rounded-full px-2 py-0.5 text-[11px] font-bold'
const SELECT = 'rounded-md border border-theme-border bg-theme-bg px-2 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950'
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ''

const DEPOT_OPTIONS = Object.values(ALL_CITY_DEPOTS)
  .map((depot) => ({ value: depot.key, label: depot.depot }))
  .sort((a, b) => a.label.localeCompare(b.label))

export default function AllCityPagesAdmin({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">All City Pages</h1>
        <p className="mt-2 max-w-3xl text-sm text-theme-muted dark:text-neutral-400">
          WordPress&apos;s /all-city/ pages: one template, 22 depots, one record per city. A page renders its WordPress import (taken{' '}
          {ALL_CITY_SEED_TAKEN_AT}) until it is edited here; every change is a draft until you publish it. Editing{' '}
          <span className="font-semibold text-theme-dark dark:text-neutral-200">{STORE_KEY}</span>.
        </p>
        <nav aria-label="All City Pages screens" className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link href={ADMIN_ROUTES.ALL_CITY_TEMPLATE} className="inline-flex items-center gap-1.5 rounded-md border border-theme-border px-3 py-2 font-semibold hover:border-theme-primary dark:border-neutral-700">
            <LayoutTemplate className="h-4 w-4 text-theme-primary" aria-hidden />
            Template (every page)
          </Link>
          <Link href={ADMIN_ROUTES.ALL_CITY_DEPOTS} className="inline-flex items-center gap-1.5 rounded-md border border-theme-border px-3 py-2 font-semibold hover:border-theme-primary dark:border-neutral-700">
            <Warehouse className="h-4 w-4 text-theme-primary" aria-hidden />
            Depots (22)
          </Link>
          <Link href={ADMIN_ROUTES.ALL_CITY_OLD_URLS} className="inline-flex items-center gap-1.5 rounded-md border border-theme-border px-3 py-2 font-semibold hover:border-theme-primary dark:border-neutral-700">
            <CornerDownRight className="h-4 w-4 text-theme-primary" aria-hidden />
            Old URL redirects
          </Link>
          <Link href={ADMIN_ROUTES.ALL_CITY_NEW} className="inline-flex items-center gap-1.5 rounded-md border border-theme-border px-3 py-2 font-semibold hover:border-theme-primary dark:border-neutral-700">
            <Plus className="h-4 w-4 text-theme-primary" aria-hidden />
            New page
          </Link>
        </nav>
      </header>
      <Suspense fallback={<p className="text-sm text-theme-muted">Loading…</p>}>
        <PageList searchParams={searchParams} />
      </Suspense>
    </>
  )
}

async function PageList({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const filter: AllCityFilter = {
    q: one(params.q),
    state: (ALL_CITY_STATES as string[]).includes(one(params.state)) ? (one(params.state) as AllCityState) : '',
    depot: ALL_CITY_DEPOTS[one(params.depot)] ? one(params.depot) : '',
    variant: ['city', 'depotCity'].includes(one(params.variant)) ? (one(params.variant) as AllCityVariant) : '',
    list: (['popular', 'viewAll', 'none'] as const).find((v) => v === one(params.list)) ?? '',
    show: (Object.keys(ALL_CITY_SHOW_LABELS) as NonNullable<AllCityFilter['show']>[]).find((v) => v && v === one(params.show)) ?? '',
  }
  const rows = await readAllCityAdminRows()
  const matches = rows.filter((row) => matchesAllCityFilter(row, filter)).sort((a, b) => a.page.city.localeCompare(b.page.city, 'en') || a.page.slug.localeCompare(b.page.slug))
  const pages = Math.max(1, Math.ceil(matches.length / PER_PAGE))
  const current = Math.min(pages, Math.max(1, Number(one(params.page)) || 1))
  const shown = matches.slice((current - 1) * PER_PAGE, current * PER_PAGE)
  const counts = {
    drafts: rows.filter((r) => r.hasDraft).length,
    edited: rows.filter((r) => r.status === 'edited').length,
    created: rows.filter((r) => r.status === 'new').length,
    issues: rows.filter((r) => r.issues.length).length,
  }
  const pageHref = (n: number) => {
    const q = new URLSearchParams(Object.entries({ ...filter, page: String(n) }).filter(([, v]) => v) as [string, string][])
    return `${ADMIN_ROUTES.ALL_CITY}?${q}`
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-theme-muted dark:text-neutral-400">
        {rows.length.toLocaleString('en-US')} pages · {counts.edited} edited · {counts.created} created here · {counts.drafts} with a draft · {counts.issues} with
        issues
      </p>

      <form method="get" className="flex flex-wrap items-end gap-2 rounded-lg border border-theme-border bg-theme-bg p-3 dark:border-neutral-800 dark:bg-neutral-900">
        <label className="flex min-w-48 flex-1 flex-col gap-1 text-xs font-semibold">
          Search
          <input name="q" defaultValue={filter.q} placeholder="City, URL, heading or title" className={SELECT} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold">
          State
          <select name="state" defaultValue={filter.state} className={SELECT}>
            <option value="">All</option>
            {ALL_CITY_STATES.map((st) => (
              <option key={st} value={st}>
                {ALL_CITY_STATE_NAMES[st]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold">
          Depot
          <select name="depot" defaultValue={filter.depot} className={SELECT}>
            <option value="">All</option>
            {DEPOT_OPTIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold">
          Template
          <select name="variant" defaultValue={filter.variant} className={SELECT}>
            <option value="">Both</option>
            <option value="city">City</option>
            <option value="depotCity">Depot city</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold">
          List
          <select name="list" defaultValue={filter.list} className={SELECT}>
            <option value="">Any</option>
            <option value="popular">Popular</option>
            <option value="viewAll">View all</option>
            <option value="none">Neither</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold">
          Show
          <select name="show" defaultValue={filter.show} className={SELECT}>
            {Object.entries(ALL_CITY_SHOW_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="rounded-md bg-theme-dark px-4 py-2 text-sm font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900">
          Filter
        </button>
        <Link href={ADMIN_ROUTES.ALL_CITY} className="px-2 py-2 text-sm text-theme-muted hover:underline">
          Clear
        </Link>
      </form>

      <AllCityBulkPanel
        filter={filter}
        count={matches.length}
        draftCount={matches.filter((row) => row.hasDraft).length}
        depotOptions={DEPOT_OPTIONS}
        bulkEdit={bulkEditAllCityPagesAction}
        bulkPublish={bulkPublishAllCityPagesAction}
      />

      <section aria-labelledby="all-city-rows">
        <h2 id="all-city-rows" className="mb-2 text-xs font-bold tracking-wider text-theme-muted uppercase dark:text-neutral-500">
          {matches.length.toLocaleString('en-US')} matching · page {current} of {pages}
        </h2>
        <ul className="overflow-hidden rounded-lg border border-theme-border bg-theme-bg dark:border-neutral-800 dark:bg-neutral-900">
          {shown.map(({ page, status, hasDraft, issues }) => (
            <li key={page.slug} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-theme-border p-3 last:border-b-0 dark:border-neutral-800">
              <span className="min-w-0 flex-1">
                <Link href={ADMIN_ROUTES.ALL_CITY_PAGE(page.slug)} className="block font-semibold hover:underline">
                  {page.city}, {page.state} <span className="font-normal text-theme-muted dark:text-neutral-400">· {page.h1}</span>
                </Link>
                <span className="block truncate text-xs text-theme-muted dark:text-neutral-500">
                  {allCityPath(page.slug)} · {ALL_CITY_DEPOTS[page.depotKey]?.depot ?? page.depotKey}
                  {page.variant === 'depotCity' ? ' · depot city' : ''}
                  {page.lists.popular ? ' · Popular' : page.lists.viewAll ? ' · View all' : ' · in no list'}
                </span>
                {issues.length > 0 && (
                  <span className="block text-xs text-amber-800 dark:text-amber-300">{[...new Set(issues.map((issue) => issue.message))].join(' · ')}</span>
                )}
              </span>
              {status === 'new' && <span className={`${BADGE} bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300`}>New</span>}
              {status === 'edited' && <span className={`${BADGE} bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300`}>Edited</span>}
              {hasDraft && <span className={`${BADGE} bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300`}>Draft</span>}
              {page.hidden && <span className={`${BADGE} bg-neutral-200 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200`}>Hidden</span>}
              {page.redirectTo && <span className={`${BADGE} bg-neutral-200 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200`}>301 → {page.redirectTo}</span>}
              {page.seo.noindex && <span className={`${BADGE} bg-neutral-200 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200`}>noindex</span>}
              <span className="flex gap-1 text-sm">
                <Link href={ADMIN_ROUTES.ALL_CITY_PAGE(page.slug)} className="rounded-md px-2 py-1 font-semibold hover:bg-theme-subtle dark:hover:bg-neutral-800">
                  Edit
                </Link>
                <a href={ADMIN_ROUTES.ALL_CITY_PREVIEW(page.slug)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-theme-subtle dark:hover:bg-neutral-800">
                  <Eye className="h-4 w-4" aria-hidden />
                  Preview
                </a>
                {status !== 'new' && (
                  <a href={allCityPath(page.slug)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-theme-subtle dark:hover:bg-neutral-800">
                    <ExternalLink className="h-4 w-4" aria-hidden />
                    Live
                  </a>
                )}
              </span>
            </li>
          ))}
          {shown.length === 0 && <li className="p-4 text-sm text-theme-muted">No page matches.</li>}
        </ul>

        {pages > 1 && (
          <nav aria-label="Pages" className="mt-3 flex items-center justify-between text-sm">
            {current > 1 ? (
              <Link href={pageHref(current - 1)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-semibold hover:bg-theme-subtle dark:hover:bg-neutral-800">
                <ChevronLeft className="h-4 w-4" aria-hidden />
                Previous
              </Link>
            ) : (
              <span />
            )}
            <span className="text-theme-muted">
              {current} / {pages}
            </span>
            {current < pages ? (
              <Link href={pageHref(current + 1)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-semibold hover:bg-theme-subtle dark:hover:bg-neutral-800">
                Next
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </section>
    </div>
  )
}
