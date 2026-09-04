'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, MapPin } from 'lucide-react'

import { Modal } from '@/components/ui/Modal'
import { ROUTES } from '@/config/routes'
import { useGeoapify } from '@/hooks/useGeoapify'
import type { GeoapifyResult } from '@/hooks/useGeoapify'

/**
 * The summary's Edit control, and the ZIP picker behind it.
 *
 * Delivery is priced per address, so the destination is the one thing on this
 * page a visitor may need to correct before the figure means anything — and
 * until now the only way to change it was to go back to the product page.
 *
 * Choosing a ZIP navigates rather than setting state: this flow keeps its
 * context in the query string so the page can render on the server, so the new
 * destination has to arrive the same way every other parameter does. The price
 * is then recalculated server-side, which is the only place that can do it.
 *
 * `selectResult` also writes the site-wide ZIP keys and re-enriches the sale
 * links, so a location set here is the one the product page and header use
 * next — rather than becoming another way to record where someone lives.
 */

const LISTBOX_ID = 'delivery-zip-suggestions'

type Props = {
  /** Current context, so navigating away does not lose the container. */
  handle: string | null
  zip: string | null
  quantity: number
}

export function DeliveryZipEditor({ handle, zip, quantity }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [listOpen, setListOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { results, loading, selectResult } = useGeoapify(query, {
    type: 'postcode',
    countries: 'us,ca',
    debounceMs: 300,
    limit: 5,
  })

  /**
   * Seeding happens here rather than in an effect keyed on `open`.
   *
   * Setting state from an effect body is a cascading render, and the lint rule
   * that forbids it is right: opening the dialog is an event, and the field's
   * starting value is part of what that event decides.
   *
   * The current ZIP is the seed because the common correction is one wrong
   * digit — an edit, not a retype. The focus effect below selects it, so the
   * first keystroke still replaces the lot.
   */
  function openEditor() {
    setQuery(zip ?? '')
    setListOpen(false)
    setOpen(true)
  }

  // Focus is a DOM side effect, not state, so it does belong in an effect.
  useEffect(() => {
    if (!open) return
    const id = setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 50)
    return () => clearTimeout(id)
  }, [open])

  const busy = loading && query.trim().length > 1
  const showList = listOpen && (results.length > 0 || busy)

  function pick(result: GeoapifyResult) {
    setPending(true)
    setListOpen(false)

    try {
      // The hook's own recorder, rather than writing the keys here: it sets
      // four of them plus the enriched sale links, and a partial copy would
      // leave the site half-moved to the new location.
      selectResult(result)
    } catch {
      // Private mode throws on localStorage. The navigation below still carries
      // the ZIP, so the quote is still right — only "remember it" is lost.
    }

    router.push(
      ROUTES.DELIVERY_QUOTE_FOR({
        handle: handle ?? undefined,
        zip: result.postcode,
        qty: quantity,
      }),
    )
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={openEditor}
        className="text-xs font-medium text-theme-muted underline underline-offset-2 transition-colors hover:text-theme-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
      >
        Edit
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Where is it going?"
        allowOverflow
      >
        <p className="text-sm leading-relaxed text-theme-mid dark:text-gray-300">
          Delivery is priced from the depot nearest you, so the ZIP code changes the
          quote. Enter the one the container is being delivered to.
        </p>

        <div className="relative mt-4">
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setListOpen(true)
            }}
            onFocus={() => setListOpen(true)}
            // Deferred so a click on a suggestion lands before it unmounts.
            onBlur={() => setTimeout(() => setListOpen(false), 150)}
            onKeyDown={(e) => {
              if (e.key === 'Escape' && showList) {
                // Close the list, not the dialog — the modal's own Escape
                // handler would otherwise dismiss the whole thing.
                e.stopPropagation()
                setListOpen(false)
              }
              if (e.key === 'Enter' && showList && results[0]) {
                e.preventDefault()
                pick(results[0])
              }
            }}
            // `combobox`, not the implicit `textbox`: aria-expanded and
            // aria-autocomplete only mean anything on a role that owns a popup.
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showList}
            aria-controls={LISTBOX_ID}
            aria-label="Delivery ZIP or postal code"
            placeholder="Enter delivery zip code"
            className="w-full rounded border border-theme-border bg-theme-bg px-4 py-3 text-[15px] text-theme-dark outline-none transition-colors placeholder:text-theme-muted focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />

          {(busy || pending) && (
            <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-theme-muted" />
          )}

          {showList && (
            <ul
              id={LISTBOX_ID}
              role="listbox"
              className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-md border border-theme-border bg-theme-bg shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
            >
              {busy && results.length === 0 && (
                <li className="px-3 py-2.5 text-sm text-theme-muted">Searching…</li>
              )}
              {results.map((result) => (
                <li key={result.placeId} role="option" aria-selected={false}>
                  <button
                    type="button"
                    // `onMouseDown`, not `onClick`: blur fires first and would
                    // unmount the list before a click could land.
                    onMouseDown={() => pick(result)}
                    className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-theme-subtle dark:hover:bg-white/10"
                  >
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-theme-primary" />
                    <span>
                      <span className="font-semibold text-theme-dark dark:text-white">
                        {result.formatted}
                      </span>
                      <span className="block text-[11px] text-theme-muted">{result.country}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Modal>
    </>
  )
}
