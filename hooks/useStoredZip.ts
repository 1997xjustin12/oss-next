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
}

const EMPTY: StoredZip = { postcode: '', label: '' }

export function useStoredZip(): StoredZip {
  const [stored, setStored] = useState<StoredZip>(EMPTY)

  useEffect(() => {
    try {
      const postcode = localStorage.getItem('zipcode') ?? ''
      const label = localStorage.getItem('zipcode_label') ?? ''
      if (!postcode && !label) return
      // Reading a browser-only store on mount. See the note above for why this
      // cannot be a lazy initialiser without breaking hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStored({ postcode, label })
    } catch {
      // Safari private mode throws outright — the field just starts empty.
    }
  }, [])

  return stored
}
