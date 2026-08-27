'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { resetGuestCapture } from '@/lib/guestCapture'

/**
 * Lets a demo forget the guest it just captured.
 *
 * The lead capture is one-shot by design — once a visitor gives their details
 * the modal never interrupts them again — which makes it awkward to show more
 * than once. Two ways to rewind it:
 *
 *   - Add `?reset-guest=1` to any URL. Works on a phone, on a preview deploy,
 *     and in front of an audience, none of which suit opening DevTools.
 *   - Call `resetGuestCapture()` in the console.
 *
 * Both only ever clear this browser's own storage: the captured lead, the
 * email the exit-intent prompt reads, and its dismissal cooldown. Nothing
 * server-side is touched, which is why this is not gated to non-production —
 * the worst it can do is make the site ask a visitor for details it already
 * had.
 *
 * The parameter strips itself from the URL afterwards, so a link pasted into
 * chat does not silently reset on every open.
 */

const RESET_PARAM = 'reset-guest'

declare global {
  interface Window {
    resetGuestCapture?: () => void
  }
}

export function GuestCaptureReset() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    window.resetGuestCapture = () => {
      resetGuestCapture()
      console.info('[guest] capture reset — the modal will ask again on the next add to cart')
    }
    return () => {
      delete window.resetGuestCapture
    }
  }, [])

  useEffect(() => {
    if (searchParams.get(RESET_PARAM) === null) return

    resetGuestCapture()

    // Drop the parameter so a reload, a shared link or a back-navigation does
    // not reset again. replaceState rather than router.replace: this is not a
    // navigation and should not cost a history entry or a re-render.
    const next = new URLSearchParams(searchParams.toString())
    next.delete(RESET_PARAM)
    const query = next.toString()
    window.history.replaceState(null, '', query ? `${pathname}?${query}` : pathname)

    console.info('[guest] capture reset — the modal will ask again on the next add to cart')
  }, [pathname, searchParams])

  return null
}
