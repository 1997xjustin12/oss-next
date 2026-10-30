'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useZipPlace } from '@/hooks/useZipPlace'
import { getGuestLead, setGuestLead } from '@/lib/guestCapture'
import { CONTACT_NUMBER } from '@/lib/helpers'
import { completeZip } from '@/lib/shippingQuote'
import { readVisitorZip } from '@/lib/visitorZip'
import {
  EMPTY_ZOHO_QUOTE,
  ZOHO_HONEYPOT,
  ZOHO_QUOTE_FIELDS,
  initialZohoQuote,
  trimmed,
  validateZohoQuote,
  writeZohoQuote,
  zohoQuoteToLead,
  type ZohoQuoteField,
  type ZohoQuoteResult,
  type ZohoQuoteValues,
} from '@/lib/zohoQuoteForm'

/** When the send fails with no message from the server (offline, timed out). */
const SEND_FAILED = `We couldn't send your details just now. Please check your connection and try again, or call us at ${CONTACT_NUMBER}.`

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
 *  - on submit, checks the fields Zoho requires and sends them to Zoho
 *    (app/api/zoho-quote, which reads Zoho's answer); only once Zoho has
 *    accepted them are they saved to this browser (and the site-wide guest
 *    lead). A refusal or no answer is an error on the form, and nothing moves on.
 *
 * Reads the browser's storage on first render, so it belongs in a component
 * rendered in the browser only (behind an `open` flag, or `ssr: false`).
 */
export function useZohoQuoteForm({ active = true, onZipResolved }: Options = {}) {
  const [values, setValues] = useState<ZohoQuoteValues>(() =>
    typeof window === 'undefined' ? EMPTY_ZOHO_QUOTE : initialZohoQuote(getGuestLead(), readVisitorZip().postcode || ''),
  )
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

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
   * The form's onSubmit: checks the fields, sends them to Zoho through
   * app/api/zoho-quote, and resolves to the submitted values once Zoho has
   * accepted them, or to null (the error is set, and nothing is saved). Only
   * then is anything saved here, so a failed send leaves no trace.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<ZohoQuoteValues | null> {
    event.preventDefault()
    if (sending) return null
    const problem = validateZohoQuote(values)
    if (problem) {
      setError(problem)
      return null
    }
    setError(null)
    setSending(true)
    const clean = trimmed(values)
    const honeypot = event.currentTarget.elements.namedItem(ZOHO_HONEYPOT)
    try {
      const res = await fetch('/api/zoho-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...clean, [ZOHO_HONEYPOT]: honeypot instanceof HTMLInputElement ? honeypot.value : '' }),
        signal: AbortSignal.timeout(25_000),
      })
      const result = (await res.json().catch(() => null)) as ZohoQuoteResult | null
      if (!res.ok || !result?.ok) {
        setError(result && !result.ok ? result.error : SEND_FAILED)
        return null
      }
    } catch {
      // Offline, or no answer in time.
      setError(SEND_FAILED)
      return null
    } finally {
      setSending(false)
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

  return { values, setField, fieldProps, error, zipLooking, sending, handleSubmit, fillBlanks }
}
