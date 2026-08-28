'use client'

import { useEffect, useState } from 'react'

/**
 * The ZIP the visitor has already given elsewhere on the site.
 *
 * Written by the homepage lookup, the PLP lookup, the navbar and the
 * geolocation prompt; read here so the PDP does not ask again for something
 * the visitor has already told us.
 *
 * Read after mount rather than during render. `localStorage` does not exist on
 * the server, so a lazy `useState` initialiser would render an empty field on
 * the server and a filled one on the client — a hydration mismatch React
 * refuses to patch up. Components that only ever mount client-side can read it
 * inline; this one is inside the server-rendered PDP tree and cannot.
 *
 * Returns empty strings until the effect runs, so callers should treat this as
 * a value that arrives, not one that is present on first paint.
 */

export type StoredZip = {
  /** Bare postcode, e.g. `30303` — what the delivery endpoint wants. */
  postcode: string
  /** Human-readable, e.g. `Atlanta, GA, 30303` — what a field should show. */
  label: string
  /**
   * Whether the lookup has run.
   *
   * False on the first render and true forever after, including when nothing
   * was found. Callers that act on the *absence* of a ZIP need this: an empty
   * postcode means "we haven't looked yet" before the effect fires and "there
   * is none" after, and treating the first as the second shows a prompt to
   * every visitor for a frame.
   */
  resolved: boolean
}

const EMPTY: StoredZip = { postcode: '', label: '', resolved: false }

export function useStoredZip(): StoredZip {
  const [stored, setStored] = useState<StoredZip>(EMPTY)

  useEffect(() => {
    // The URL wins over storage. A link carrying ?zipcode= was built for a
    // specific destination — by linkEnrich, an ad, or someone sharing a page —
    // and it should beat whatever this browser happens to remember from a
    // previous visit.
    //
    // Read from window rather than useSearchParams so this hook stays usable
    // from any client component without dragging a Suspense boundary along
    // with it. It only runs on mount, which is the same moment useSearchParams
    // would first resolve anyway.
    let urlZip = ''
    try {
      urlZip = new URLSearchParams(window.location.search).get('zipcode')?.trim() ?? ''
    } catch {
      // Malformed query string — fall through to storage.
    }

    try {
      const postcode = urlZip || localStorage.getItem('zipcode') || ''
      // A ZIP from the URL has no label stored alongside it, so fall back to
      // the bare code rather than showing the previous visit's city.
      const stored = localStorage.getItem('zipcode_label') ?? ''
      const label = urlZip ? (stored.includes(urlZip) ? stored : urlZip) : stored

      // Set even when both are empty, so `resolved` flips either way.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStored({ postcode, label, resolved: true })
    } catch {
      // Safari private mode throws outright — fall back to the URL alone.
      setStored({ postcode: urlZip, label: urlZip, resolved: true })
    }
  }, [])

  return stored
}
