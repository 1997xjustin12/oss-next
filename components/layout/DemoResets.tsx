'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { resetGuestCapture } from '@/lib/guestCapture'
import { clearSavedQuotes } from '@/lib/savedQuotes'
import { clearVisitorZip, clearDetectedLocation } from '@/lib/visitorZip'

/**
 * Lets a demo rewind the state that only builds up once.
 *
 * Both the lead capture and the ZIP prompt are deliberately one-shot — the
 * first stops asking once a visitor gives their details, the second once any
 * ZIP is known — which makes either awkward to show twice. Saved quotes are
 * the same problem from the other end: a demo that has been run a few times
 * arrives at /saved-quotes with a pile of them. Each has a URL parameter and a
 * console function:
 *
 *   ?reset-guest=1   resetGuestCapture()   forget the captured lead
 *   ?reset-zip=1     resetVisitorZip()     forget where the visitor is
 *   ?reset-quotes=1  resetSavedQuotes()    empty the saved quotes list
 *   ?reset-all=1     resetDemoState()      all three
 *
 * The parameters work on a phone, on a preview deploy, and in front of an
 * audience — none of which suit opening DevTools — and strip themselves from
 * the URL afterwards, so a link pasted into chat does not reset on every open.
 *
 * Everything here only clears this browser's own storage. Nothing server-side
 * is touched, which is why none of it is gated to non-production: the worst it
 * can do is make the site ask for something it already knew.
 */

const RESET_GUEST = 'reset-guest'
const RESET_ZIP = 'reset-zip'
const RESET_QUOTES = 'reset-quotes'
const RESET_ALL = 'reset-all'

declare global {
  interface Window {
    resetGuestCapture?: () => void
    resetVisitorZip?: (options?: { includeGeolocation?: boolean }) => void
    resetSavedQuotes?: () => void
    resetDemoState?: () => void
  }
}

function forgetGuest() {
  resetGuestCapture()
  console.info('[demo] guest capture reset — the modal asks again on the next add to cart')
}

/**
 * Empties the list. `clearSavedQuotes` announces the change, so a
 * /saved-quotes page open in this tab empties with it rather than showing
 * quotes that are no longer stored.
 */
function forgetQuotes() {
  clearSavedQuotes()
  console.info('[demo] saved quotes cleared')
}

/**
 * `includeGeolocation` also drops the detector's cache, which re-arms the
 * browser's location prompt on the next load. Off by default: in a browser
 * that has already granted permission, clearing it lets the ZIP be re-detected
 * within a second and the prompt never appears.
 */
function forgetZip(options?: { includeGeolocation?: boolean }) {
  clearVisitorZip()
  if (options?.includeGeolocation) clearDetectedLocation()
  console.info('[demo] visitor ZIP cleared — the ZIP prompt asks again on the next load')
}

export function DemoResets() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    window.resetGuestCapture = forgetGuest
    window.resetVisitorZip = forgetZip
    window.resetSavedQuotes = forgetQuotes
    window.resetDemoState = () => {
      forgetGuest()
      forgetZip()
      forgetQuotes()
    }
    return () => {
      delete window.resetGuestCapture
      delete window.resetVisitorZip
      delete window.resetSavedQuotes
      delete window.resetDemoState
    }
  }, [])

  useEffect(() => {
    const all = searchParams.get(RESET_ALL) !== null
    const guest = all || searchParams.get(RESET_GUEST) !== null
    const zip = all || searchParams.get(RESET_ZIP) !== null
    const quotes = all || searchParams.get(RESET_QUOTES) !== null
    if (!guest && !zip && !quotes) return

    if (guest) forgetGuest()
    if (zip) forgetZip()
    if (quotes) forgetQuotes()

    // Drop the parameters so a reload, a shared link or a back-navigation does
    // not reset again. replaceState rather than router.replace: this is not a
    // navigation and should not cost a history entry or a re-render.
    const next = new URLSearchParams(searchParams.toString())
    next.delete(RESET_GUEST)
    next.delete(RESET_ZIP)
    next.delete(RESET_QUOTES)
    next.delete(RESET_ALL)
    const query = next.toString()
    window.history.replaceState(null, '', query ? `${pathname}?${query}` : pathname)
  }, [pathname, searchParams])

  return null
}
