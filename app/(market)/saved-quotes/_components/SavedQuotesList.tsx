'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { PlpLink } from '@/components/shared/PlpLink'
import { ChevronDown, FileText, ImageOff, Trash2 } from 'lucide-react'
import { ROUTES } from '@/config/routes'
import {
  getSavedQuotes,
  removeSavedQuote,
  clearSavedQuotes,
  SAVED_QUOTES_EVENT,
} from '@/lib/savedQuotes'
import type { SavedQuote } from '@/lib/savedQuotes'

/**
 * The quotes this browser has saved, newest first.
 *
 * Read after mount rather than during render: `localStorage` does not exist on
 * the server, so reading it inline would render an empty list on the server and
 * a full one on the client — a hydration mismatch React refuses to patch up.
 * `loaded` is what separates "not looked yet" from "none saved", so the empty
 * state does not flash at someone who has ten.
 *
 * Each quote is a drawer. Expanded, one quote is a dozen rows of figures, and
 * ten of them expanded is a page nobody can scan. Collapsed, a row carries the
 * photo, the container, where it was quoted to and the total — enough to find
 * the one you meant — and opens onto the detail. The newest starts open, so the
 * page shows what a quote looks like rather than a stack of closed bars.
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

/**
 * The saved photo, or a placeholder in its place.
 *
 * `onError` matters more here than on a normal product image: these URLs were
 * copied into storage days ago, and the picture behind one can be moved or
 * withdrawn in the meantime. A broken-image glyph in a list of saved quotes
 * reads as the quote itself having gone bad.
 */
function QuoteThumbnail({ src, alt }: { src?: string; alt: string }) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <span className="flex h-14 w-20 shrink-0 items-center justify-center rounded-md border border-theme-border bg-theme-subtle dark:border-neutral-700 dark:bg-neutral-800">
        <ImageOff className="h-5 w-5 text-theme-border" aria-hidden />
      </span>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={80}
      height={56}
      sizes="80px"
      onError={() => setFailed(true)}
      className="h-14 w-20 shrink-0 rounded-md border border-theme-border object-cover dark:border-neutral-700"
    />
  )
}

export function SavedQuotesList() {
  const [quotes, setQuotes] = useState<SavedQuote[]>([])
  const [loaded, setLoaded] = useState(false)
  const [openIds, setOpenIds] = useState<string[]>([])

  useEffect(() => {
    const load = () => {
      const saved = getSavedQuotes()
      setQuotes(saved)
      // Only ever adds: a drawer the visitor opened stays open when the list
      // reloads, and a newly saved quote arrives open.
      setOpenIds((current) =>
        saved[0] && !current.includes(saved[0].id) ? [saved[0].id, ...current] : current,
      )
      setLoaded(true)
    }

    load()
    // Keeps the page honest when something else changes the list — ?reset-all=1
    // on this very page, or a quote saved in another tab.
    window.addEventListener(SAVED_QUOTES_EVENT, load)
    window.addEventListener('storage', load)
    return () => {
      window.removeEventListener(SAVED_QUOTES_EVENT, load)
      window.removeEventListener('storage', load)
    }
  }, [])

  function toggle(id: string) {
    setOpenIds((current) =>
      current.includes(id) ? current.filter((open) => open !== id) : [...current, id],
    )
  }

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
            className="h-24 animate-pulse rounded-lg border border-theme-border bg-theme-subtle"
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
          No Saved Quotes Yet
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-theme-muted">
          Save a quote from any container page and it will be kept here, with the
          price and delivery it had at the time.
        </p>
        <PlpLink
          href={ROUTES.PLP}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-theme-primary px-6 text-sm font-bold text-white transition-colors hover:bg-theme-primary-dark"
        >
          Browse containers
        </PlpLink>
      </div>
    )
  }

  const allOpen = quotes.every((quote) => openIds.includes(quote.id))

  return (
    <>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-sm text-theme-muted">
          {quotes.length} saved {quotes.length === 1 ? 'quote' : 'quotes'}, newest
          first.
        </p>
        <div className="flex items-baseline gap-4">
          {quotes.length > 1 && (
            <button
              type="button"
              onClick={() => setOpenIds(allOpen ? [] : quotes.map((quote) => quote.id))}
              className="text-[13px] font-semibold text-theme-muted underline underline-offset-2 transition-colors hover:text-theme-primary"
            >
              {allOpen ? 'Collapse All' : 'Expand All'}
            </button>
          )}
          <button
            type="button"
            onClick={clearAll}
            className="text-[13px] font-semibold text-theme-muted underline underline-offset-2 transition-colors hover:text-theme-primary"
          >
            Clear All
          </button>
        </div>
      </div>

      <ul className="flex flex-col gap-3">
        {quotes.map((quote) => {
          const open = openIds.includes(quote.id)
          const panelId = `quote-panel-${quote.id}`

          return (
            <li
              key={quote.id}
              className="overflow-hidden rounded-lg border border-theme-border bg-theme-bg dark:border-neutral-800 dark:bg-neutral-900"
            >
              {/* The toggle and the delete control are siblings, not nested: a
                  button inside a button is invalid markup, and the inner one
                  stops being reachable. */}
              <div
                className={`flex items-stretch gap-1 ${
                  open ? 'border-b border-theme-border dark:border-neutral-800' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(quote.id)}
                  aria-expanded={open}
                  aria-controls={panelId}
                  className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-theme-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-theme-primary sm:px-4 dark:hover:bg-neutral-800/60"
                >
                  <QuoteThumbnail src={quote.image} alt={quote.productTitle} />

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-theme-dark dark:text-white">
                      {quote.productTitle}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-theme-muted">
                      Saved {savedOn(quote.savedAt)}
                      {quote.zip ? ` · to ${quote.zip}` : ''}
                    </span>
                    {/* The total sits under the title on phones, where there is
                        no room for it beside them. */}
                    <span className="mt-1 block text-sm font-bold tabular-nums text-theme-dark sm:hidden dark:text-white">
                      {quote.total}
                      {quote.totalSuffix && (
                        <span className="ml-0.5 text-[11px] font-semibold text-theme-muted">
                          {quote.totalSuffix}
                        </span>
                      )}
                    </span>
                  </span>

                  <span className="hidden shrink-0 text-right sm:block">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-theme-muted">
                      Quoted Total
                    </span>
                    <span className="block text-lg font-bold leading-tight tabular-nums text-theme-dark dark:text-white">
                      {quote.total}
                      {quote.totalSuffix && (
                        <span className="ml-0.5 text-xs font-semibold text-theme-muted">
                          {quote.totalSuffix}
                        </span>
                      )}
                    </span>
                  </span>

                  <ChevronDown
                    aria-hidden
                    className={`h-4 w-4 shrink-0 text-theme-muted transition-transform duration-200 ${
                      open ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => remove(quote.id)}
                  aria-label={`Delete the saved quote for ${quote.productTitle}`}
                  className="my-2 mr-2 shrink-0 self-start rounded-md p-1.5 text-theme-muted transition-colors hover:bg-theme-subtle hover:text-theme-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary dark:hover:bg-white/10"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </div>

              {/* Kept in the DOM and hidden rather than unmounted: the figures
                  are already in memory, and `hidden` leaves them findable by
                  the browser's own find-in-page. */}
              <div id={panelId} hidden={!open}>
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
                  <span className="text-[11px] text-theme-muted">
                    Quoted for {quote.lead.email}
                  </span>
                  {quote.handle && (
                    <Link
                      href={ROUTES.PRODUCT(quote.handle)}
                      className="text-[13px] font-bold text-theme-primary underline-offset-2 hover:underline"
                    >
                      View this container →
                    </Link>
                  )}
                </div>
              </div>
            </li>
          )
        })}
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
