'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useZipPlace } from '@/hooks/useZipPlace'
import { getGuestLead } from '@/lib/guestCapture'
import { readVisitorZip } from '@/lib/visitorZip'

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
 * Three things fill themselves, so the fields the visitor actually has to type
 * are the street and their contact details:
 *
 *   * the ZIP starts from the quote's own ZIP, and failing that from the one
 *     stored in this browser — by the time anybody reaches step 3 they have
 *     given it at least once already;
 *   * City, State and Country follow the ZIP whenever it changes, through the
 *     free zippopotam lookup rather than the metered one (see useZipPlace).
 *
 * The street line is typed, not suggested. An address autocomplete lived here
 * until 2026-09-22 and was removed: it was the only thing spending metered
 * Geoapify quota on keystrokes, and for a field people know the answer to it
 * bought little — the ZIP is what the rest of the form is built from, and that
 * lookup is free.
 *
 * The ZIP is read in an effect rather than during render: it lives in
 * localStorage, which does not exist on the server, and reading it inline would
 * render one value on the server and another in the browser.
 */

export type ShippingAddressDefaults = {
  address1?: string
  address2?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}

const FIELD =
  'h-12 w-full rounded-md border border-theme-border bg-theme-bg px-4 text-sm text-theme-dark outline-none transition-colors focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/25 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white'
const LABEL = 'mb-1.5 block text-xs font-semibold text-theme-dark dark:text-neutral-200'

export function ShippingAddressFields({
  defaults,
  quotedZip,
}: {
  defaults: ShippingAddressDefaults
  /** The ZIP the quote is priced against, so the field starts where the quote is. */
  quotedZip?: string
}) {
  /**
   * What the guest-lead modal stored, for the blanks the draft does not fill.
   *
   * Only the parts: a lead captured from the modal has a one-line `address`
   * that is really a ZIP, and splitting that into a street would put something
   * plausible and wrong in the street box.
   */
  const lead = useState(() => getGuestLead())[0]

  const [address1, setAddress1] = useState(defaults.address1 || lead?.address1 || '')
  const [address2, setAddress2] = useState(defaults.address2 || lead?.address2 || '')
  const [city, setCity] = useState(defaults.city || lead?.city || '')
  const [state, setState] = useState(defaults.state || lead?.state || '')
  const [zip, setZip] = useState(defaults.zip || quotedZip || lead?.zip || '')
  const [country, setCountry] = useState(defaults.country || lead?.country || 'US')

  // The ZIP this browser already knows, when the form started without one.
  useEffect(() => {
    if (zip) return
    const stored = readVisitorZip().postcode
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setZip(stored)
    // Only ever on first mount: after that the field belongs to the visitor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { place } = useZipPlace(zip, country)

  // City, State and Country follow the ZIP. Blank fields are filled always; a
  // ZIP the visitor edited overwrites them, because a city left over from the
  // previous ZIP is simply wrong. Each resolved ZIP is applied once, so
  // anything typed afterwards stands.
  const appliedZip = useRef('')
  useEffect(() => {
    if (!place) return
    const key = `${place.countryCode}:${place.latitude},${place.longitude}`
    if (appliedZip.current === key) return
    const first = appliedZip.current === ''
    appliedZip.current = key

    setCity((current) => (first && current ? current : place.city || current))
    setState((current) => (first && current ? current : place.state || current))
    setCountry((current) => (place.countryCode === 'CA' || place.countryCode === 'US' ? place.countryCode : current))
  }, [place])

  const zipDiffers = useMemo(
    () => !!quotedZip && !!zip && zip.trim().slice(0, 5) !== quotedZip.trim().slice(0, 5),
    [quotedZip, zip],
  )

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold text-theme-primary sm:text-xl">Delivery Address:</h3>
      <p className="mt-1 text-xs text-theme-muted">
        Where the container is going. We use this to price the delivery and to fill in your checkout.
      </p>

      <div className="mt-3 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
        <div>
          <label htmlFor="address1" className={LABEL}>
            Address <span className="text-theme-primary">*</span>
          </label>
          <input
            id="address1"
            name="address1"
            value={address1}
            onChange={(e) => setAddress1(e.target.value)}
            required
            autoComplete="street-address"
            placeholder="Address"
            className={FIELD}
          />
        </div>

        <div>
          <label htmlFor="address2" className={LABEL}>
            Apartment <span className="font-normal text-theme-muted">(optional)</span>
          </label>
          <input
            id="address2"
            name="address2"
            value={address2}
            onChange={(e) => setAddress2(e.target.value)}
            autoComplete="address-line2"
            placeholder="Apartment"
            className={FIELD}
          />
        </div>

        <div>
          <label htmlFor="city" className={LABEL}>
            City <span className="text-theme-primary">*</span>
          </label>
          <input
            id="city"
            name="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            autoComplete="address-level2"
            placeholder="City"
            className={FIELD}
          />
        </div>

        <div>
          <label htmlFor="state" className={LABEL}>
            State <span className="text-theme-primary">*</span>
          </label>
          <input
            id="state"
            name="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
            autoComplete="address-level1"
            placeholder="State"
            className={FIELD}
          />
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

        <div>
          <label htmlFor="addressZip" className={LABEL}>
            Zipcode <span className="text-theme-primary">*</span>
          </label>
          <input
            id="addressZip"
            name="addressZip"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            required
            inputMode="text"
            autoComplete="postal-code"
            placeholder="Zipcode"
            className={FIELD}
          />
          {zipDiffers && (
            <p className="mt-1.5 text-xs font-medium text-theme-primary">
              Your quote will be priced to {zip.trim()} instead of {quotedZip}.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
