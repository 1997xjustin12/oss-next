'use client'

import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { useZipPlace } from '@/hooks/useZipPlace'
import { getGuestLead, setGuestLead } from '@/lib/guestCapture'
import { completeZip } from '@/lib/shippingQuote'
import { readVisitorZip } from '@/lib/visitorZip'
import {
  EMPTY_ZOHO_QUOTE,
  ZOHO_QUOTE_FIELDS,
  initialZohoQuote,
  trimmed,
  validateZohoQuote,
  writeZohoQuote,
  zohoQuoteToLead,
  type ZohoQuoteField,
  type ZohoQuoteValues,
} from '@/lib/zohoQuoteForm'

type Options = {
  /**
   * Look ZIPs up only while the form is on screen. The guest lead modal is
   * mounted closed on every product page; without this it would look the saved
   * ZIP up on each view.
   */
  active?: boolean
  /** A typed ZIP that resolved to a place (complete, e.g. "30303"), e.g. to re-price delivery for it. */
  onZipResolved?: (zip: string) => void
}

/**
 * The Zoho quote form's state and behaviour, for any area that shows it
 * (lib/zohoQuoteForm.ts). The area brings its own markup and styles, and its own
 * extra steps after a submit; this brings what every copy must do the same:
 *
 *  - opens filled in from the last submission in this browser (or what the
 *    site already knows: the guest lead, the visitor's ZIP);
 *  - fills City and State from the ZIP, once a complete one is typed
 *    (zippopotam, via useZipPlace);
 *  - on submit, checks the fields Zoho requires, saves the details to this
 *    browser (and the site-wide guest lead), then lets the browser post the
 *    form to Zoho in a hidden frame, so the visitor stays on the page.
 *
 * Reads the browser's storage on first render, so it belongs in a component
 * rendered in the browser only (behind an `open` flag, or `ssr: false`).
 */
export function useZohoQuoteForm({ active = true, onZipResolved }: Options = {}) {
  const [values, setValues] = useState<ZohoQuoteValues>(() =>
    typeof window === 'undefined' ? EMPTY_ZOHO_QUOTE : initialZohoQuote(getGuestLead(), readVisitorZip().postcode || ''),
  )
  const [error, setError] = useState<string | null>(null)

  // The frame Zoho's response loads into. Named per form, so two copies on one
  // page never post into each other's frame.
  const frameName = `zoho-quote-${useId().replace(/[^a-zA-Z0-9]/g, '')}`

  // City and State from the ZIP, through zippopotam: free and unmetered, the
  // same lookup checkout and the delivery-quote form use (useZipPlace). It
  // waits for a complete ZIP and a pause in typing, caches answers for the tab,
  // and drops a late answer for a ZIP since edited.
  const { place, loading: zipLooking } = useZipPlace(active ? values.zip : '')

  const onZipResolvedRef = useRef(onZipResolved)
  useEffect(() => {
    onZipResolvedRef.current = onZipResolved
  })

  // Applied once per resolved ZIP, so anything typed afterwards stands. The
  // first answer only fills blanks: the saved details' own city and state are
  // kept when the form opens. After that a changed ZIP overwrites them, because
  // a city left over from the previous ZIP is simply wrong. Both stay editable.
  const appliedZip = useRef('')
  useEffect(() => {
    if (!place) return
    const zip = completeZip(values.zip, undefined)
    if (!zip || appliedZip.current === zip) return
    const first = appliedZip.current === ''
    appliedZip.current = zip
    setValues((current) => ({
      ...current,
      city: first && current.city.trim() ? current.city : place.city || current.city,
      state: first && current.state.trim() ? current.state : place.state || current.state,
    }))
    onZipResolvedRef.current?.(zip)
    // `place` changes exactly when a new ZIP resolves; the ZIP it is for is read
    // with it, not watched.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place])

  function setField(field: ZohoQuoteField, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  /**
   * Fill the empty fields from storage again, keeping whatever is typed.
   * For a form that stays mounted while hidden: call it as it opens, so a
   * submission made in another area since shows up here.
   */
  function fillBlanks() {
    const stored = initialZohoQuote(getGuestLead(), readVisitorZip().postcode || '')
    setValues((current) => {
      const next = { ...current }
      for (const field of Object.keys(next) as ZohoQuoteField[]) if (!next[field].trim()) next[field] = stored[field]
      return next
    })
  }

  /**
   * The form's onSubmit. Returns the submitted values when the browser may go
   * on posting to Zoho, or null when it was stopped (the error is set).
   */
  function handleSubmit(event: FormEvent<HTMLFormElement>): ZohoQuoteValues | null {
    const problem = validateZohoQuote(values)
    if (problem) {
      event.preventDefault()
      setError(problem)
      return null
    }
    setError(null)
    const clean = trimmed(values)
    // The browser posts what the inputs hold at this moment, so the trimmed
    // values go into them now, not on the next render.
    const elements = event.currentTarget.elements
    for (const field of Object.keys(clean) as ZohoQuoteField[]) {
      const input = elements.namedItem(ZOHO_QUOTE_FIELDS[field].name)
      if (input instanceof HTMLInputElement) input.value = clean[field]
    }
    setValues(clean)
    writeZohoQuote(clean)
    setGuestLead(zohoQuoteToLead(clean))
    return clean
  }

  /** Name, limit, value and change handler for one field's input. */
  function fieldProps(field: ZohoQuoteField) {
    return {
      name: ZOHO_QUOTE_FIELDS[field].name,
      maxLength: ZOHO_QUOTE_FIELDS[field].maxLength,
      value: values[field],
      onChange: (event: { target: { value: string } }) => setField(field, event.target.value),
    }
  }

  return { values, setField, fieldProps, error, zipLooking, frameName, handleSubmit, fillBlanks }
}
