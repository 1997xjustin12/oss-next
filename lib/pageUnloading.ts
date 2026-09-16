/**
 * Whether this page is on its way out, and whether an error is a fetch that
 * never got a response.
 *
 * A browser cancels in-flight requests when a navigation commits, and they
 * reject with a bare `TypeError: Failed to fetch` — the same error a real
 * network failure gives, so the error alone cannot tell them apart. Components
 * that are about to be torn down were reporting those as failures: the console
 * filled with "[useDeliveryRates] Failed to fetch" whenever a visitor clicked
 * away while a price was loading, and it failed the e2e suite's error guard on
 * a journey that had actually passed (2026-09-15).
 *
 * An abort through an AbortController is already distinguishable; this covers
 * the case where nothing in the app did the cancelling.
 */

let unloading = false

if (typeof window !== 'undefined') {
  // Fires for every way of leaving, including into the back/forward cache —
  // unlike `beforeunload`, which also makes a page ineligible for that cache.
  window.addEventListener('pagehide', () => {
    unloading = true
  })
  // Coming back from the back/forward cache makes the page live again.
  window.addEventListener('pageshow', () => {
    unloading = false
  })
}

export function isPageUnloading(): boolean {
  return unloading
}

/** A fetch that never reached a response: cancelled, offline, or DNS-level. */
export function isNetworkAbort(error: unknown): boolean {
  return error instanceof TypeError && /failed to fetch|networkerror|load failed/i.test(error.message)
}

/**
 * True when an error is only the page being left: worth ignoring rather than
 * reporting, because nothing is wrong and nobody is there to see the result.
 */
export function isAbandonedRequest(error: unknown): boolean {
  return isPageUnloading() && isNetworkAbort(error)
}
