'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Trash2 } from 'lucide-react'
import { ROUTES } from '@/config/routes'
import { getSavedQuotes, removeSavedQuote, clearSavedQuotes } from '@/lib/savedQuotes'
import type { SavedQuote } from '@/lib/savedQuotes'

/**
 * The quotes this browser has saved, newest first.
 *
 * Read after mount rather than during render: `localStorage` does not exist on
 * the server, so reading it inline would render an empty list on the server and
 * a full one on the client — a hydration mismatch React refuses to patch up.
 * `loaded` is what separates "not looked yet" from "none saved", so the empty
 * state does not flash at someone who has ten.
 */

function savedOn(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function SavedQuotesList() {
  const [quotes, setQuotes] = useState<SavedQuote[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuotes(getSavedQuotes())
    setLoaded(true)
  }, [])

  function remove(id: string) {
    removeSavedQuote(id)
    setQuotes(getSavedQuotes())
  }

  function clearAll() {
    clearSavedQuotes()
    setQuotes([])
  }

  if (!loaded) {
    return (
      <div className="space-y-3" aria-hidden>
        {[0, 1].map((i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-lg border border-theme-border bg-theme-subtle"
          />
        ))}
      </div>
    )
  }

  if (quotes.length === 0) {
    return (
      <div className="rounded-lg border border-theme-border bg-theme-subtle px-6 py-14 text-center">
        <FileText className="mx-auto h-10 w-10 text-theme-border" aria-hidden />
        <h2 className="mt-4 text-xl font-bold text-theme-dark dark:text-white">
          No saved quotes yet
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-theme-muted">
          Save a quote from any container page and it will be kept here, with the
          price and delivery it had at the time.
        </p>
        <Link
          href={ROUTES.PLP}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-theme-primary px-6 text-sm font-bold text-white transition-colors hover:bg-theme-primary-dark"
        >
          Browse containers
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-sm text-theme-muted">
          {quotes.length} saved {quotes.length === 1 ? 'quote' : 'quotes'}, newest
          first.
        </p>
        <button
          type="button"
          onClick={clearAll}
          className="text-[13px] font-semibold text-theme-muted underline underline-offset-2 transition-colors hover:text-theme-primary"
        >
          Clear all
        </button>
      </div>

      <ul className="flex flex-col gap-4">
        {quotes.map((quote) => (
          <li
            key={quote.id}
            className="overflow-hidden rounded-lg border border-theme-border bg-theme-bg dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-theme-border bg-theme-subtle px-4 py-3 dark:border-neutral-800 dark:bg-neutral-800/60">
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-theme-dark dark:text-white">
                  {quote.handle ? (
                    <Link
                      href={ROUTES.PRODUCT(quote.handle)}
                      className="hover:text-theme-primary hover:underline"
                    >
                      {quote.productTitle}
                    </Link>
                  ) : (
                    quote.productTitle
                  )}
                </h2>
                <p className="mt-0.5 text-[11px] text-theme-muted">
                  Saved {savedOn(quote.savedAt)} · for {quote.lead.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(quote.id)}
                aria-label={`Delete the saved quote for ${quote.productTitle}`}
                className="shrink-0 rounded-md p-1.5 text-theme-muted transition-colors hover:bg-theme-bg hover:text-theme-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary dark:hover:bg-white/10"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <ul className="divide-y divide-theme-border px-4 text-sm dark:divide-neutral-800">
              {quote.lines.map((line) => (
                <li
                  key={line.label}
                  className="flex items-baseline justify-between gap-6 py-2.5"
                >
                  <span className="shrink-0 text-theme-muted">{line.label}</span>
                  <span className="text-right font-medium tabular-nums text-theme-dark dark:text-white">
                    {line.value}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-theme-border bg-theme-subtle px-4 py-3 dark:border-neutral-800 dark:bg-neutral-800/60">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-theme-muted">
                Quoted total
              </span>
              <span className="text-xl font-bold leading-none tabular-nums text-theme-dark dark:text-white">
                {quote.total}
                {quote.totalSuffix && (
                  <span className="ml-0.5 text-xs font-semibold text-theme-muted">
                    {quote.totalSuffix}
                  </span>
                )}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-xs leading-relaxed text-theme-muted">
        Each quote is a snapshot of the price and delivery at the time it was
        saved, kept in this browser only — clearing site data removes them, and
        they do not follow you to another device. Delivery remains an estimate
        until we confirm site access.
      </p>
    </>
  )
}
