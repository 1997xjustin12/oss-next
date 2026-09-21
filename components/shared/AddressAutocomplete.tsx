'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, MapPin } from 'lucide-react'
import { isAbandonedRequest } from '@/lib/pageUnloading'

/**
 * A street-address field that suggests real addresses, used by the delivery
 * quote form and by checkout.
 *
 * ## Suggestions are help, never a gate
 *
 * The field is an ordinary text input that happens to offer a list. Whatever is
 * typed submits, matched or not — containers go to building sites, farm gates
 * and yards off unnamed tracks, and a picker that insisted on an address it had
 * heard of would turn a customer into an abandoned form.
 *
 * ## Results near the visitor
 *
 * `near` is the position of the ZIP in the form beside this field, resolved for
 * free through zippopotam (see useZipPlace), and `country` is that form's own
 * country field. Together they do two different jobs:
 *
 *   * **filter** — `countrycode` and a circle around the ZIP. Geoapify drops
 *     everything outside them, so a Florida street stops appearing for someone
 *     delivering to Atlanta.
 *   * **bias** — ranks what survives, nearest first.
 *
 * The circle is wide on purpose. A hard filter does not fail politely: asked
 * for "350 5th Ave, New York" inside a 25km Atlanta circle, Geoapify returns
 * Atlanta's 5th Avenues rather than nothing, so too tight a radius turns a
 * wrong address into a plausible-looking suggestion. {@link SEARCH_RADIUS_M}
 * is set to cover a metro area and its outskirts, every row shows its own city,
 * state and ZIP, and the fields stay typeable for the address no database
 * knows.
 *
 * Coordinates are rounded to two decimals — about a kilometre — deliberately:
 * it is as precise as a ZIP-level filter can honestly be, and it means everyone
 * typing in the same town shares one cache entry upstream instead of one per
 * visitor.
 *
 * ## Spending as little of the Geoapify quota as possible
 *
 *   * nothing under 5 characters — "12 M" matches half a state and costs the
 *     same as a good query;
 *   * 450ms after typing stops, not per keystroke;
 *   * every answer kept for the life of the page, so backspacing through a
 *     street name replays from memory rather than asking again;
 *   * the in-flight request aborted when a newer one starts;
 *   * nothing at all after a suggestion is picked, or while the text is
 *     unchanged.
 *
 * Server-side the same query is cached for days across all visitors, behind a
 * per-visitor rate limit and a daily budget — see lib/geoapifyGuard.ts. When
 * those refuse, the endpoint answers `limited: true`; this stops asking for a
 * minute and says suggestions are unavailable, rather than showing a spinner
 * over a field that is working perfectly well.
 */

export type AddressSuggestion = {
  id: string
  street: string
  city: string
  state: string
  stateCode: string
  postcode: string
  countryCode: string
}

const MIN_LENGTH = 5
const DEBOUNCE_MS = 450
/** How long to stop asking after the endpoint says it is rate limited. */
const BACK_OFF_MS = 60_000
/**
 * How far from the ZIP a suggested address may be — 50km, about 30 miles.
 *
 * Wide enough for a metro area and the rural edges a container actually goes
 * to, narrow enough to drop the same street name in another state. See the
 * header on why erring wide is the safer direction.
 */
const SEARCH_RADIUS_M = 50_000

function toSuggestion(feature: unknown): AddressSuggestion | null {
  const properties = (feature as { properties?: Record<string, unknown> })?.properties
  if (!properties) return null

  const line = String(properties.address_line1 ?? properties.formatted ?? '').trim()
  if (!line) return null

  const housenumber = String(properties.housenumber ?? '').trim()
  const street = String(properties.street ?? '').trim()

  return {
    id: String(properties.place_id ?? `${line}-${properties.lat}-${properties.lon}`),
    // Rebuilt from parts when Geoapify gives them: its own `address_line1` is
    // the house number and street for an address, but just the place name for
    // anything coarser.
    street: [housenumber, street].filter(Boolean).join(' ') || line,
    city: String(properties.city ?? properties.town ?? properties.village ?? '').trim(),
    state: String(properties.state ?? '').trim(),
    stateCode: String(properties.state_code ?? '').trim(),
    postcode: String(properties.postcode ?? '').trim(),
    countryCode: String(properties.country_code ?? '')
      .trim()
      .toUpperCase(),
  }
}

export function AddressAutocomplete({
  id,
  name,
  value,
  onChange,
  onPick,
  near,
  country,
  required = false,
  placeholder = '123 Peachtree St NE',
  className,
  hintClassName = 'mt-1.5 text-xs text-theme-muted',
  showHint = true,
}: {
  id: string
  name?: string
  value: string
  onChange: (value: string) => void
  onPick: (suggestion: AddressSuggestion) => void
  /**
   * The ZIP field's position, from useZipPlace. Filters suggestions to its
   * surroundings and ranks the survivors nearest-first.
   */
  near?: { latitude: number; longitude: number } | null
  /** The form's country field, as 'US' or 'CA'. Narrows the search to it. */
  country?: string
  required?: boolean
  placeholder?: string
  className: string
  hintClassName?: string
  showHint?: boolean
}) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const [active, setActive] = useState(-1)

  // Everything below survives re-renders without causing them.
  const cache = useRef(new Map<string, AddressSuggestion[]>())
  const abort = useRef<AbortController | null>(null)
  const lastQuery = useRef('')
  const backOffUntil = useRef(0)
  const boxRef = useRef<HTMLDivElement | null>(null)

  const query = value.trim()

  // Both are part of the cache key as well as the request: the same text in two
  // different towns, or two different countries, is two different questions.
  const point = near ? `${near.longitude.toFixed(2)},${near.latitude.toFixed(2)}` : ''
  const biasParam = point ? `proximity:${point}` : ''
  const filterParam = [
    // Falls back to both markets until the form's country is known, which is
    // the state the field starts in.
    `countrycode:${(country || 'us,ca').toLowerCase()}`,
    point ? `circle:${point},${SEARCH_RADIUS_M}` : '',
  ]
    .filter(Boolean)
    .join('|')

  useEffect(() => {
    const key = `${filterParam}|${biasParam}|${query.toLowerCase()}`
    if (query.length < MIN_LENGTH) return
    if (Date.now() < backOffUntil.current) return

    const cached = cache.current.get(key)
    if (cached) {
      setSuggestions(cached)
      setOpen(cached.length > 0 && lastQuery.current !== query)
      return
    }
    if (query === lastQuery.current) return

    const timer = setTimeout(async () => {
      abort.current?.abort()
      const controller = new AbortController()
      abort.current = controller
      setLoading(true)

      try {
        const params = new URLSearchParams({
          text: query,
          limit: '5',
          // Streets and buildings, not just postcodes — see the route.
          type: 'any',
          filter: filterParam,
        })
        if (biasParam) params.set('bias', biasParam)

        const res = await fetch(`/api/geoapify?${params}`, { signal: controller.signal })
        if (!res.ok) return

        const json = (await res.json()) as { features?: unknown[]; limited?: boolean }
        if (json.limited) {
          backOffUntil.current = Date.now() + BACK_OFF_MS
          setUnavailable(true)
          setSuggestions([])
          setOpen(false)
          return
        }

        const list = (json.features ?? [])
          .map(toSuggestion)
          .filter((s): s is AddressSuggestion => !!s)
        cache.current.set(key, list)
        lastQuery.current = query
        setUnavailable(false)
        setSuggestions(list)
        setOpen(list.length > 0)
        setActive(-1)
      } catch (err) {
        // A cancelled request is this component working correctly, not a fault.
        if (!isAbandonedRequest(err)) console.error('[address] lookup failed', err)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [query, biasParam, filterParam])

  // Close when the visitor moves on, without stealing the click that picks a
  // suggestion — pointerdown outside the box is the one event that means "not
  // this list".
  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  function choose(suggestion: AddressSuggestion) {
    onPick(suggestion)
    // Stops the effect above asking about the text it just wrote.
    lastQuery.current = suggestion.street
    setOpen(false)
    setSuggestions([])
    setActive(-1)
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((i) => (i + 1) % suggestions.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
    } else if (event.key === 'Enter' && active >= 0) {
      // Only when a suggestion is highlighted: Enter with the list merely open
      // belongs to the form, and swallowing it would break submitting by
      // keyboard.
      event.preventDefault()
      choose(suggestions[active])
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  const listId = `${id}-suggestions`

  return (
    <div className="relative" ref={boxRef}>
      <div className="relative">
        <input
          id={id}
          name={name}
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setActive(-1)
          }}
          onKeyDown={onKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          required={required}
          autoComplete="street-address"
          placeholder={placeholder}
          className={className}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
        />
        {loading && (
          <Loader2
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-theme-muted"
            aria-hidden
          />
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-theme-border bg-theme-bg shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
        >
          {suggestions.map((suggestion, index) => (
            <li key={suggestion.id} role="option" aria-selected={index === active}>
              <button
                type="button"
                onClick={() => choose(suggestion)}
                onMouseEnter={() => setActive(index)}
                className={`flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm transition-colors ${
                  index === active
                    ? 'bg-theme-primary/10 text-theme-dark dark:text-white'
                    : 'text-theme-mid dark:text-neutral-300'
                }`}
              >
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-theme-primary" aria-hidden />
                <span className="min-w-0">
                  <span className="block font-medium">{suggestion.street}</span>
                  <span className="block text-xs text-theme-muted">
                    {[suggestion.city, suggestion.stateCode || suggestion.state, suggestion.postcode]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {showHint && (
        <p className={hintClassName}>
          {unavailable
            ? 'Address suggestions are unavailable right now — type the address and carry on.'
            : 'Start typing and pick your address, or type it in full if it is not listed.'}
        </p>
      )}
    </div>
  )
}
