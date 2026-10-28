'use client'

import { useId, useRef, useState, useEffect, type Ref } from 'react'
import { Loader2, LocateFixed, MapPin } from 'lucide-react'
import { useZipLookup, type GeoapifyResult } from '@/hooks/useGeoapify'

type Props = {
  /** Lets "Please enter zip/postal code first" put the cursor here. */
  inputRef?: Ref<HTMLInputElement>
  /** Everything disabled until the configurator has products to show. */
  disabled?: boolean
  /** The configurator is loading the new depot's products. */
  busy?: boolean
}

/**
 * Step 1's ZIP box: the input, "Get My Price" and "Use my current location".
 *
 * Built on useZipLookup like every ZIP box (prefill, typed-only suggestions,
 * the one-depot-per-cart prompt). Unlike the others it never navigates: a pick
 * only saves the location, and the configurator follows the saved location and
 * refetches. So nothing here knows about products.
 */
export function ConfiguratorZipBox({ inputRef, disabled = false, busy = false }: Props) {
  const [open, setOpen] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const {
    value,
    setValue,
    showResult,
    edited,
    results,
    loading,
    error,
    clear,
    selectResult,
    resolveValue,
    locateMe,
    locating,
  } = useZipLookup({ type: 'postcode', countries: 'us,ca', debounceMs: 300, limit: 5 })

  // The suggestion last acted on: `results` gets a new identity on every hook
  // update, and the same pick must not be saved twice.
  const pickedRef = useRef<string | null>(null)

  function handleSelect(result: GeoapifyResult) {
    pickedRef.current = result.placeId
    setOpen(false)
    // Refused when the cart holds another depot's container; the prompt is up.
    if (!selectResult(result, () => handleSelect(result))) return
    showResult(result)
    setNotice(result.nearestLocation ? null : "We don't deliver to that ZIP yet. Call us and we'll help.")
  }

  // One suggestion left for what the visitor typed: take it, as the other boxes do.
  useEffect(() => {
    if (!edited || !open || results.length !== 1) return
    if (pickedRef.current === results[0].placeId) return
    handleSelect(results[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results])

  async function handleSubmit() {
    setNotice(null)
    const match = await resolveValue()
    if (!match) {
      setNotice('Enter a valid ZIP or postal code.')
      return
    }
    if (pickedRef.current !== match.placeId) handleSelect(match)
  }

  async function handleLocate() {
    setNotice(null)
    setOpen(false)
    const outcome = await locateMe()
    if (outcome.result) {
      handleSelect(outcome.result)
      return
    }
    setNotice(
      outcome.reason === 'unknown'
        ? "We don't have your location yet. Enter your ZIP code instead."
        : "We couldn't place your location. Enter your ZIP code instead.",
    )
  }

  const listboxId = useId()
  const showList = open && edited && (results.length > 0 || loading || !!error)
  const working = loading || busy || locating

  return (
    <div className="rounded-sm bg-neutral-200 p-3 sm:p-4 dark:bg-neutral-800">
      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault()
          void handleSubmit()
        }}
      >
        <div className="relative min-w-0 flex-1">
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            value={value}
            disabled={disabled}
            onChange={(e) => {
              setValue(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setOpen(false)
                clear()
              }
            }}
            placeholder="Enter Your Zipcode"
            aria-label="ZIP or postal code"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showList}
            aria-controls={listboxId}
            className="h-12 w-full rounded-sm border border-neutral-400 bg-white px-4 text-base text-theme-dark outline-none transition-colors placeholder:text-neutral-500
                       focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/15 disabled:cursor-not-allowed disabled:opacity-60
                       dark:border-neutral-600 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-400"
          />
          {working && (
            <Loader2 aria-hidden className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-theme-muted" />
          )}

          {showList && (
            <ul
              id={listboxId}
              role="listbox"
              className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-md border border-theme-border bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
            >
              {loading && results.length === 0 && <li className="px-3 py-2.5 text-sm text-theme-muted">Searching…</li>}
              {error && !loading && <li className="px-3 py-2.5 text-sm text-theme-primary">{error}</li>}
              {results.map((r) => (
                <li key={r.placeId} role="option" aria-selected={false}>
                  <button
                    type="button"
                    onMouseDown={() => handleSelect(r)}
                    className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-theme-subtle dark:hover:bg-white/10"
                  >
                    <MapPin aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-theme-primary" />
                    <span>
                      <span className="font-semibold text-theme-dark dark:text-white">{r.formatted}</span>
                      <span className="block text-[11px] text-theme-muted">{r.country}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="submit"
          disabled={disabled}
          className="h-12 shrink-0 rounded-sm bg-theme-primary px-7 text-base font-semibold text-white transition-colors hover:bg-theme-primary-dark
                     focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          Get My Price
        </button>
      </form>

      <button
        type="button"
        onClick={handleLocate}
        disabled={disabled}
        className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-sm bg-[#123d5f] text-base font-semibold text-white transition-colors hover:bg-[#0c2c45]
                   focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#123d5f] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LocateFixed aria-hidden className="h-5 w-5" />
        Use my current location
      </button>

      {notice && (
        <p role="status" className="mt-2 text-sm text-theme-dark dark:text-neutral-200">
          {notice}
        </p>
      )}
    </div>
  )
}
