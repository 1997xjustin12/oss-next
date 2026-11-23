'use client'

import { useState } from 'react'
import { ArrowRight, ExternalLink, Plus, Trash2 } from 'lucide-react'
import { EditorShell, type AdminActionResult } from '@/components/admin/EditorShell'
import { HELP, INPUT, LABEL } from '@/components/admin/ValueEditor'
import { normalizeAllCityTarget, normalizeOldUrl } from '@/lib/allCityOldUrls'
import type { AllCityOldUrl } from '@/types/allCity'

type Row = { from: string; to: string }

type Props = {
  initialValue: AllCityOldUrl[]
  hasDraft: boolean
  status: { draft?: string; published?: string }
  save: (rows: Row[]) => Promise<AdminActionResult>
  publish: () => Promise<AdminActionResult>
  discard: () => Promise<AdminActionResult>
}

const ICON_BTN =
  'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-theme-border text-theme-mid hover:bg-theme-subtle dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800'
const BTN =
  'inline-flex items-center gap-1.5 rounded-md border border-theme-border px-3 py-2 text-sm font-semibold hover:border-theme-primary dark:border-neutral-700'

/** "old, new" / "old<TAB>new" / "old new", one pair a line (a spreadsheet's two columns pasted). */
function parsePasted(text: string): Row[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim().split(/\s*[,\t]\s*|\s+/))
    .filter((parts) => parts.length >= 2 && parts[0] && parts[1])
    .map(([from, to]) => ({ from, to }))
}

/**
 * The old-URL redirects: one row per old URL, each going to an /all-city/
 * page. Rows are checked as you type (shape only); Save draft checks the
 * pages exist. Publish puts the list live within a minute.
 */
export function AllCityOldUrlsEditor({ initialValue, hasDraft, status, save, publish, discard }: Props) {
  const [query, setQuery] = useState('')
  const [pasted, setPasted] = useState('')

  return (
    <EditorShell<Row[]>
      initialValue={initialValue}
      hasDraft={hasDraft}
      status={status}
      save={save}
      publish={publish}
      discard={discard}
      scope="the old-URL redirects"
    >
      {(rows, setRows) => {
        const q = query.trim().toLowerCase()
        const shown = rows.map((row, index) => ({ row, index })).filter(({ row }) => !q || row.from.toLowerCase().includes(q) || row.to.toLowerCase().includes(q))
        const update = (index: number, patch: Partial<Row>) => setRows(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)))
        const counts = new Map<string, number>()
        for (const row of rows) {
          const from = normalizeOldUrl(row.from)
          if (from) counts.set(from, (counts.get(from) ?? 0) + 1)
        }

        return (
          <div className="space-y-5">
            <section className="rounded-lg border border-theme-border bg-theme-bg p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex flex-wrap items-end gap-3">
                <label className="min-w-0 flex-1 basis-64">
                  <span className={LABEL}>Search</span>
                  <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="kennesaw, /storage-…" className={`mt-1 ${INPUT}`} />
                </label>
                <button type="button" onClick={() => setRows([{ from: '', to: '' }, ...rows])} className={BTN}>
                  <Plus className="h-4 w-4 text-theme-primary" aria-hidden />
                  Add a redirect
                </button>
              </div>
              <p className={HELP}>
                {rows.length} redirect{rows.length === 1 ? '' : 's'}
                {q && ` · ${shown.length} shown`}. Old URL: a path on this site, or a link copied from the old site (the host is dropped). New URL: an /all-city/ page, or just its slug.
              </p>
            </section>

            <ul className="space-y-2" aria-label="Redirects">
              {shown.map(({ row, index }) => {
                const from = normalizeOldUrl(row.from)
                const to = normalizeAllCityTarget(row.to)
                const fromError = row.from.trim() && !from ? 'Not a path on this site.' : from?.startsWith('/all-city') ? 'Already an /all-city/ page.' : from && (counts.get(from) ?? 0) > 1 ? 'Listed more than once.' : ''
                const toError = row.to.trim() && !to ? 'Not an /all-city/ page.' : ''
                return (
                  <li key={index} className="rounded-lg border border-theme-border bg-theme-bg p-3 dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start">
                      <label className="min-w-0 flex-1">
                        <span className="sr-only">Old URL, row {index + 1}</span>
                        <input value={row.from} onChange={(e) => update(index, { from: e.target.value })} placeholder="/old-city-page" aria-invalid={!!fromError} className={`${INPUT} font-mono`} />
                        {fromError && <span className="mt-1 block text-xs text-red-700 dark:text-red-400">{fromError}</span>}
                      </label>
                      <ArrowRight className="mt-2.5 hidden h-4 w-4 shrink-0 text-theme-muted md:block" aria-hidden />
                      <label className="min-w-0 flex-1">
                        <span className="sr-only">New /all-city/ page, row {index + 1}</span>
                        <div className="flex items-center rounded-md">
                          <span className="shrink-0 pr-1 font-mono text-sm whitespace-nowrap text-theme-muted dark:text-neutral-500">/all-city/</span>
                          <input value={row.to} onChange={(e) => update(index, { to: e.target.value })} placeholder="city-page-slug" aria-invalid={!!toError} className={`${INPUT} font-mono`} />
                        </div>
                        {toError && <span className="mt-1 block text-xs text-red-700 dark:text-red-400">{toError}</span>}
                      </label>
                      <div className="flex gap-2">
                        {to && (
                          <a href={`/all-city/${to}`} target="_blank" rel="noreferrer" className={ICON_BTN} aria-label={`Open /all-city/${to}`} title="Open the /all-city/ page">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <button type="button" onClick={() => setRows(rows.filter((_, i) => i !== index))} className={ICON_BTN} aria-label={`Remove row ${index + 1}`} title="Remove">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
              {!shown.length && <li className="text-sm text-theme-muted dark:text-neutral-400">{rows.length ? 'No redirect matches the search.' : 'No redirects yet.'}</li>}
            </ul>

            <section className="rounded-lg border border-theme-border bg-theme-bg p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <label className="block">
                <span className={LABEL}>Add many at once</span>
                <textarea
                  value={pasted}
                  onChange={(e) => setPasted(e.target.value)}
                  rows={4}
                  placeholder={'/old-city-page, new-all-city-slug\n/another-old-page\tanother-slug'}
                  className={`mt-1 ${INPUT} font-mono`}
                />
                <span className={HELP}>One redirect a line: the old URL, then the new page, separated by a comma, a tab or a space (two spreadsheet columns paste as tabs).</span>
              </label>
              <button
                type="button"
                disabled={!parsePasted(pasted).length}
                onClick={() => {
                  setRows([...rows, ...parsePasted(pasted)])
                  setPasted('')
                }}
                className={`mt-2 ${BTN} disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <Plus className="h-4 w-4 text-theme-primary" aria-hidden />
                Add {parsePasted(pasted).length || ''} to the list
              </button>
            </section>
          </div>
        )
      }}
    </EditorShell>
  )
}
