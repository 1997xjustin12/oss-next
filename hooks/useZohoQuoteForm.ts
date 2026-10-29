'use client'

import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { useGeoapify } from '@/hooks/useGeoapify'
import { getGuestLead, setGuestLead } from '@/lib/guestCapture'
import { readVisitorZip } from '@/lib/visitorZip'
import {
  EMPTY_ZOHO_QUOTE,
  ZOHO_QUOTE_FIELDS,
  initialZohoQuote,
  isCompleteZip,
  trimmed,
  validateZohoQuote,
  writeZohoQuote,
  zohoQuoteToLead,
  type ZohoQuoteField,
  type ZohoQuoteValues,
} from '@/lib/zohoQuoteForm'
import type { GeoapifyResult } from '@/hooks/useGeoapify'

type Options = {
  /**
   * Look ZIPs up only while the form is on screen. The guest lead modal is
   * mounted closed on every product page; without this it would look the saved
   * ZIP up on each view.
   */
  active?: boolean
  /** The place a typed ZIP resolved to, e.g. to re-price delivery for it. */
  onZipResolved?: (place: GeoapifyResult) => void
}

/** How long typing must pause before a complete ZIP is looked up. */
const ZIP_LOOKUP_DELAY_MS = 350

/**
 * The Zoho quote form's state and behaviour, for any area that shows it
 * (lib/zohoQuoteForm.ts). The area brings its own markup and styles, and its own
 * extra steps after a submit; this brings what every copy must do the same:
 *
 *  - opens filled in from the last submission in this browser (or what the
 *    site already knows: the guest lead, the visitor's ZIP);
 *  - fills City and State from the ZIP, once a complete one is typed;
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
  const [zipLooking, setZipLooking] = useState(false)

  // The frame Zoho's response loads into. Named per form, so two copies on one
  // page never post into each other's frame.
  const frameName = `zoho-quote-${useId().replace(/[^a-zA-Z0-9]/g, '')}`

  const { resolveTyped } = useGeoapify('', { type: 'postcode', countries: 'us,ca', limit: 5 })
  // Refs, so the lookup effect runs on the ZIP changing and nothing else:
  // both are new functions on every render.
  const resolveRef = useRef(resolveTyped)
  const onZipResolvedRef = useRef(onZipResolved)
  useEffect(() => {
    resolveRef.current = resolveTyped
    onZipResolvedRef.current = onZipResolved
  })

  /**
   * The last ZIP the city and state were filled from. Starts as the saved ZIP
   * when the saved details already have a city, so opening the form never
   * overwrites a city and state the visitor typed themselves.
   */
  const lookedUp = useRef(values.city.trim() ? values.zip.trim() : '')

  useEffect(() => {
    const zip = values.zip.trim()
    if (!active || !isCompleteZip(zip) || zip === lookedUp.current) return
    const timer = setTimeout(async () => {
      lookedUp.current = zip
      setZipLooking(true)
      const place = await resolveRef.current(zip)
      setZipLooking(false)
      if (!place) return
      // A new ZIP is a new place: the old city and state are wrong for it, so
      // they are replaced, not just filled in. Both stay editable.
      setValues((current) =>
        current.zip.trim() !== zip
          ? current
          : { ...current, city: place.city || current.city, state: place.stateCode || place.state || current.state },
      )
      onZipResolvedRef.current?.(place)
    }, ZIP_LOOKUP_DELAY_MS)
    return () => clearTimeout(timer)
  }, [values.zip, active])

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
