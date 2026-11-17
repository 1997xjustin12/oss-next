'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Layers, Send } from 'lucide-react'
import { ALL_CITY_BULK_LIMIT, type AllCityBulkChange, type AllCityFilter } from '@/lib/allCityAdmin'
import type { AdminActionResult } from '@/components/admin/EditorShell'
import type { AllCityBulkTarget } from '@/actions/allCityPages'

type Result = AdminActionResult & { count?: number }

type Props = {
  filter: AllCityFilter
  /** How many pages the filter matches now. */
  count: number
  draftCount: number
  depotOptions: readonly { value: string; label: string }[]
  bulkEdit: (target: AllCityBulkTarget, change: AllCityBulkChange) => Promise<Result>
  bulkPublish: (target: AllCityBulkTarget) => Promise<Result>
}

type Tri = '' | 'on' | 'off'
const tri = (v: Tri): boolean | undefined => (v === '' ? undefined : v === 'on')

const FIELD = 'rounded-md border border-theme-border bg-theme-bg px-2 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950'
const BTN = 'inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50'

/**
 * Bulk edit: one change saved as a draft on every page the filter matches
 * (validated like a single save), then "Publish drafts" puts them live. The
 * server re-applies the filter, so what is edited is what the list shows.
 */
export function AllCityBulkPanel({ filter, count, draftCount, depotOptions, bulkEdit, bulkPublish }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)
  const [depotKey, setDepotKey] = useState('')
  const [popular, setPopular] = useState<Tri>('')
  const [viewAll, setViewAll] = useState<Tri>('')
  const [noindex, setNoindex] = useState<Tri>('')
  const [hidden, setHidden] = useState<Tri>('')
  const [field, setField] = useState<'title' | 'h1' | 'description'>('title')
  const [find, setFind] = useState('')
  const [replaceWith, setReplaceWith] = useState('')

  const change: AllCityBulkChange = {
    ...(depotKey ? { depotKey } : {}),
    ...(tri(popular) !== undefined ? { popular: tri(popular) } : {}),
    ...(tri(viewAll) !== undefined ? { viewAll: tri(viewAll) } : {}),
    ...(tri(noindex) !== undefined ? { noindex: tri(noindex) } : {}),
    ...(tri(hidden) !== undefined ? { hidden: tri(hidden) } : {}),
    ...(find ? { replace: { field, find, with: replaceWith } } : {}),
  }
  const hasChange = Object.keys(change).length > 0
  const tooMany = count > ALL_CITY_BULK_LIMIT

  const run = (fn: () => Promise<Result>, done: (n: number) => string) =>
    startTransition(async () => {
      const result = await fn()
      if (!result.ok) return setMessage({ tone: 'error', text: result.error })
      setMessage({ tone: 'ok', text: done(result.count ?? 0) })
      router.refresh()
    })

  const triSelect = (label: string, value: Tri, set: (v: Tri) => void) => (
    <label className="flex flex-col gap-1 text-xs font-semibold">
      {label}
      <select value={value} onChange={(e) => set(e.target.value as Tri)} className={FIELD}>
        <option value="">Leave</option>
        <option value="on">Yes</option>
        <option value="off">No</option>
      </select>
    </label>
  )

  return (
    <details className="rounded-lg border border-theme-border bg-theme-bg p-3 dark:border-neutral-800 dark:bg-neutral-900">
      <summary className="cursor-pointer text-sm font-semibold">
        <Layers className="mr-1.5 inline h-4 w-4 text-theme-primary" aria-hidden />
        Bulk edit the {count.toLocaleString('en-US')} matching pages
      </summary>
      <div className="mt-3 space-y-3">
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-xs font-semibold">
            Depot
            <select value={depotKey} onChange={(e) => setDepotKey(e.target.value)} className={FIELD}>
              <option value="">Leave</option>
              {depotOptions.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
          {triSelect('Popular list', popular, setPopular)}
          {triSelect('View-all list', viewAll, setViewAll)}
          {triSelect('noindex', noindex, setNoindex)}
          {triSelect('Hidden (404)', hidden, setHidden)}
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-xs font-semibold">
            Replace in
            <select value={field} onChange={(e) => setField(e.target.value as typeof field)} className={FIELD}>
              <option value="title">SEO title</option>
              <option value="h1">h1</option>
              <option value="description">SEO description</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold">
            Find (exact)
            <input value={find} onChange={(e) => setFind(e.target.value)} placeholder="Lowest Price Shipping Containers" className={FIELD} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold">
            Replace with
            <input value={replaceWith} onChange={(e) => setReplaceWith(e.target.value)} className={FIELD} />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={!hasChange || pending || tooMany || count === 0}
            onClick={() => run(() => bulkEdit({ filter }, change), (n) => `Draft saved on ${n} page${n === 1 ? '' : 's'}. Check one in its preview, then publish the drafts.`)}
            className={`${BTN} bg-theme-dark text-white dark:bg-neutral-100 dark:text-neutral-900`}
          >
            Save as drafts
          </button>
          <button
            type="button"
            disabled={pending || draftCount === 0 || tooMany}
            onClick={() => {
              if (!window.confirm(`Publish the drafts of ${draftCount} matching page${draftCount === 1 ? '' : 's'}? Visitors will see them right away.`)) return
              run(() => bulkPublish({ filter }), (n) => `Published ${n} page${n === 1 ? '' : 's'}.`)
            }}
            className={`${BTN} bg-[#C60C29] text-white hover:brightness-90`}
          >
            <Send className="h-4 w-4" aria-hidden />
            Publish drafts ({draftCount})
          </button>
          {tooMany && <span className="text-xs text-amber-800 dark:text-amber-300">At most {ALL_CITY_BULK_LIMIT} pages at a time: narrow the filter.</span>}
        </div>
        {message && (
          <p role={message.tone === 'error' ? 'alert' : 'status'} className={`text-sm ${message.tone === 'error' ? 'text-red-700 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
            {message.text}
          </p>
        )}
      </div>
    </details>
  )
}
