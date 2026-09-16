'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Loader2, MapPin } from 'lucide-react'
import { isAbandonedRequest } from '@/lib/pageUnloading'

/**
 * The delivery address, as checkout asks for it.
 *
 * This replaced a single "Complete Delivery Address" text box. One box is
 * quicker to type and useless afterwards: checkout needs a street, a city, a
 * state and a ZIP in separate fields, and no amount of splitting on commas
 * reliably recovers them from one line. Asking here in the shape checkout wants
 * means the visitor types their address once, in this flow, and arrives at
 * checkout with it already filled in.
 *
 * ## Suggestions are help, never a gate
 *
 * The street field suggests addresses from Geoapify, but every field stays
 * typeable and the form submits whatever is in them. That matters for the
 * customers this business actually has: a container goes to a building site, a
 * farm gate or a yard off an unnamed track, and an address picker that insists
 * on a match it has never heard of would turn a lead into an abandoned form.
 *
 * ## Spending as little of the quota as possible
 *
 * Geoapify bills per request against a daily allowance shared with the ZIP
 * lookups on the listing page, so this fires as rarely as it can while still
 * feeling live:
 *
 *   * nothing before 5 characters — "12 M" matches half a state and costs the
 *     same as a good query;
 *   * 450ms after typing stops, not per keystroke;
 *   * every answer kept for the life of the page, so backspacing through a
 *     street name replays from memory rather than asking again;
 *   * the in-flight request is aborted when a newer one starts;
 *   * nothing at all after a suggestion is picked, or while the text is
 *     unchanged.
 *
 * Server-side, the same query is cached for days across all visitors and two
 * guards stand in front of it — see lib/geoapifyGuard.ts. When those refuse,
 * the endpoint answers `limited: true` and this quietly stops asking for a
 * minute; the fields carry on working and the visitor is told suggestions are
 * unavailable rather than left watching a spinner.
 */

type Suggestion = {
  id: string
  line: string
  street: string
  city: string
  state: string
  stateCode: string
  postcode: string
  countryCode: string
}

export type ShippingAddressDefaults = {
  address1?: string
  address2?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}

const MIN_LENGTH = 5
const DEBOUNCE_MS = 450
/** How long to stop asking after the endpoint says it is rate limited. */
const BACK_OFF_MS = 60_000

const FIELD =
  'h-12 w-full rounded-md border border-theme-border bg-theme-bg px-4 text-sm text-theme-dark outline-none transition-colors focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/25 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white'
const LABEL = 'mb-1.5 block text-xs font-semibold text-theme-dark dark:text-neutral-200'

function toSuggestion(feature: unknown): Suggestion | null {
  const properties = (feature as { properties?: Record<string, unknown> })?.properties
  if (!properties) return null

  const line = String(properties.address_line1 ?? properties.formatted ?? '').trim()
  if (!line) return null

  const housenumber = String(properties.housenumber ?? '').trim()
  const street = String(properties.street ?? '').trim()

  return {
    id: String(properties.place_id ?? `${line}-${properties.lat}-${properties.lon}`),
    line,
    // The street line, rebuilt from parts when Geoapify gives them: its own
    // `address_line1` is the house number and street for an address, but just
    // the place name for anything coarser.
    street: [housenumber, street].filter(Boolean).join(' ') || line,
    city: String(properties.city ?? properties.town ?? properties.village ?? '').trim(),
    state: String(properties.state ?? '').trim(),
    stateCode: String(properties.state_code ?? '').trim(),
    postcode: String(properties.postcode ?? '').trim(),
    countryCode: String(properties.country_code ?? '').trim().toUpperCase(),
  }
}

export function ShippingAddressFields({
  defaults,
  quotedZip,
}: {
  defaults: ShippingAddressDefaults
  /** The ZIP the quote is priced against, so the field starts where the quote is. */
  quotedZip?: string
}) {
  const [address1, setAddress1] = useState(defaults.address1 ?? '')
  const [city, setCity] = useState(defaults.city ?? '')
  const [state, setState] = useState(defaults.state ?? '')
  const [zip, setZip] = useState(defaults.zip || quotedZip || '')
  const [country, setCountry] = useState(defaults.country || 'US')

  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const [active, setActive] = useState(-1)

  // Everything below survives re-renders without causing them.
  const cache = useRef(new Map<string, Suggestion[]>())
  const abort = useRef<AbortController | null>(null)
  const lastQuery = useRef('')
  const backOffUntil = useRef(0)
  const boxRef = useRef<HTMLDivElement | null>(null)

  const query = address1.trim()

  useEffect(() => {
    if (query.length < MIN_LENGTH || query === lastQuery.current) return
    if (Date.now() < backOffUntil.current) return

    const cached = cache.current.get(query.toLowerCase())
    if (cached) {
      setSuggestions(cached)
      setOpen(cached.length > 0)
      return
    }

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
          filter: 'countrycode:us,ca',
        })
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

        const list = (json.features ?? []).map(toSuggestion).filter((s): s is Suggestion => !!s)
        cache.current.set(query.toLowerCase(), list)
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
  }, [query])

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

  function pick(suggestion: Suggestion) {
    setAddress1(suggestion.street)
    if (suggestion.city) setCity(suggestion.city)
    if (suggestion.stateCode || suggestion.state) setState(suggestion.stateCode || suggestion.state)
    if (suggestion.postcode) setZip(suggestion.postcode)
    if (suggestion.countryCode === 'US' || suggestion.countryCode === 'CA') {
      setCountry(suggestion.countryCode)
    }
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
      // belongs to the form, and swallowing it would break submitting by keyboard.
      event.preventDefault()
      pick(suggestions[active])
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  const zipDiffers = useMemo(
    () => !!quotedZip && !!zip && zip.trim().slice(0, 5) !== quotedZip.trim().slice(0, 5),
    [quotedZip, zip],
  )

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-theme-dark dark:text-white">
        Delivery Address{' '}
        <span className="text-theme-primary" aria-hidden>
          *
        </span>
      </h3>
      <p className="mt-1 text-xs text-theme-muted">
        Where the container is going. We use this to price the delivery and to fill in your checkout.
      </p>

      <div className="mt-3 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
        <div className="relative sm:col-span-2" ref={boxRef}>
          <label htmlFor="address1" className={LABEL}>
            Street Address
          </label>
          <div className="relative">
            <input
              id="address1"
              name="address1"
              value={address1}
              onChange={(e) => {
                setAddress1(e.target.value)
                setActive(-1)
              }}
              onKeyDown={onKeyDown}
              onFocus={() => suggestions.length > 0 && setOpen(true)}
              required
              autoComplete="street-address"
              placeholder="123 Peachtree St NE"
              className={`${FIELD} pr-10`}
              role="combobox"
              aria-expanded={open}
              aria-controls="address-suggestions"
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
              id="address-suggestions"
              role="listbox"
              className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-theme-border bg-theme-bg shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
            >
              {suggestions.map((suggestion, index) => (
                <li key={suggestion.id} role="option" aria-selected={index === active}>
                  <button
                    type="button"
                    onClick={() => pick(suggestion)}
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

          <p className="mt-1.5 text-xs text-theme-muted">
            {unavailable
              ? 'Address suggestions are unavailable right now — type the address and carry on.'
              : 'Start typing and pick your address, or type it in full if it is not listed.'}
          </p>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="address2" className={LABEL}>
            Apartment, Suite, Gate Code{' '}
            <span className="font-normal text-theme-muted">(optional)</span>
          </label>
          <input
            id="address2"
            name="address2"
            defaultValue={defaults.address2}
            autoComplete="address-line2"
            placeholder="Unit 4, or how to reach the site"
            className={FIELD}
          />
        </div>

        <div>
          <label htmlFor="city" className={LABEL}>
            City
          </label>
          <input
            id="city"
            name="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            autoComplete="address-level2"
            className={FIELD}
          />
        </div>

        <div>
          <label htmlFor="state" className={LABEL}>
            State / Province
          </label>
          <input
            id="state"
            name="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
            autoComplete="address-level1"
            className={FIELD}
          />
        </div>

        <div>
          <label htmlFor="addressZip" className={LABEL}>
            ZIP / Postal Code
          </label>
          <input
            id="addressZip"
            name="addressZip"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            required
            inputMode="text"
            autoComplete="postal-code"
            className={FIELD}
          />
          {zipDiffers && (
            <p className="mt-1.5 text-xs font-medium text-theme-primary">
              Your quote will be priced to {zip.trim()} instead of {quotedZip}.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="country" className={LABEL}>
            Country
          </label>
          <select
            id="country"
            name="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className={FIELD}
          >
            <option value="US">United States (US)</option>
            <option value="CA">Canada (CA)</option>
          </select>
        </div>
      </div>
    </div>
  )
}
