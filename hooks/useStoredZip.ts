'use client'

import { useEffect, useState } from 'react'
import { readVisitorZip, EMPTY_VISITOR_ZIP, type VisitorZip } from '@/lib/visitorZip'

/**
 * The visitor's ZIP, for components.
 *
 * A thin SSR-safe wrapper around {@link readVisitorZip}, which resolves the
 * URL parameter ahead of storage. This adds the part React needs: reading it
 * after mount rather than during render.
 *
 * `localStorage` does not exist on the server, so a lazy `useState`
 * initialiser would render an empty field on the server and a filled one on
 * the client — a hydration mismatch React refuses to patch up. Components that
 * only ever mount client-side can call `readVisitorZip()` directly.
 *
 * Values arrive rather than being present on first paint — see `resolved`.
 */

export type StoredZip = VisitorZip & {
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

const EMPTY: StoredZip = { ...EMPTY_VISITOR_ZIP, resolved: false }

export function useStoredZip(): StoredZip {
  const [stored, setStored] = useState<StoredZip>(EMPTY)

  useEffect(() => {
    // Set even when nothing was found, so `resolved` flips either way.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStored({ ...readVisitorZip(), resolved: true })
  }, [])

  return stored
}
