/**
 * Where the visitor wants containers delivered, resolved from one place.
 *
 * The site records a location in three keys — `zipcode`, `zipcode_label` and
 * `zipcode_depot` — written by the homepage lookup, the listing lookup, the
 * PDP's ZIP field, the arrival prompt and the geolocation detector. Reading
 * them is what everything else does, and doing it in five places is how the
 * navbar ends up enriching links with a ZIP the page itself is not using.
 *
 * A plain function rather than a hook because two of its callers are not
 * components: `linkEnrich` rewrites anchors outside React entirely. Components
 * should use `useStoredZip`, which wraps this SSR-safely.
 */

export type VisitorZip = {
  /** Bare postcode, e.g. `30303`. Empty when unknown. */
  postcode: string
  /** Human-readable, e.g. `Atlanta, GA 30303`. Falls back to the postcode. */
  label: string
  /** Nearest depot, e.g. `Atlanta, GA`. Empty when unknown. */
  depot: string
}

export const EMPTY_VISITOR_ZIP: VisitorZip = { postcode: '', label: '', depot: '' }

/**
 * Broadcast when this browser's ZIP changes.
 *
 * The native `storage` event only fires in *other* tabs, so a component in the
 * same document never hears a write made beside it. Everything that reads the
 * visitor's ZIP through a hook was therefore stuck with whatever was there when
 * it mounted — the ZIP prompt could resolve a new location and the delivery
 * field two hundred pixels away would go on showing the old one.
 */
export const VISITOR_ZIP_EVENT = 'oss:visitor-zip-change'

/**
 * Make the address bar agree with a location the visitor has just chosen.
 *
 * {@link readVisitorZip} lets `?zipcode=` beat storage, on purpose: a link
 * someone was sent should win over what this browser remembers. The cost is
 * that a stale parameter also beats a ZIP the visitor has *just typed*. Arrive
 * on `?zipcode=30303`, pick 90001, and storage says 90001 while every reader
 * still resolves 30303 — and drops the depot, because it belongs to a ZIP that
 * no longer matches. Measured: all ten listing links on a product page went to
 * `zipcode=30303` with no `location` at all, straight after choosing 90001.
 *
 * An explicit choice is newer information than the link that brought them, so
 * the parameter is corrected in place. `replaceState`, carrying the existing
 * state object: this is a correction, not a step anyone should press Back
 * through, and the history entries the product page keeps must survive it.
 *
 * Only parameters **already present** are touched. A page that never had
 * `?zipcode=` does not need one to be correct — storage answers there — and
 * growing query strings on the cart or checkout would be a surprise.
 *
 * Call before {@link notifyVisitorZipChange}: readers re-resolve on the
 * signal, so it has to follow the last thing that changes their answer.
 */
export function adoptVisitorZipInUrl(postcode: string, depot: string): void {
  if (typeof window === 'undefined' || !postcode) return

  const url = new URL(window.location.href)
  const params = url.searchParams
  let changed = false

  if (params.has('zipcode') && params.get('zipcode') !== postcode) {
    params.set('zipcode', postcode)
    changed = true
  }
  // The listing carries the depot as `location`. Left stale beside a corrected
  // ZIP it would describe a different yard from the one now in storage.
  if (depot && params.has('location') && params.get('location') !== depot) {
    params.set('location', depot)
    changed = true
  }

  if (changed) window.history.replaceState(window.history.state, '', url)
}

/**
 * Record where the visitor is. **The only place the ZIP keys are written.**
 *
 * Every consequence of a location change hangs off this one call: storage,
 * the address bar, every `PlpLink` and the navbar through `useStoredZip`, and
 * the injected-HTML links through `LinkEnricher` — all of which listen for the
 * broadcast at the end. A component that saves a ZIP any other way skips some
 * of that, which is not hypothetical: two writers here used to set the keys by
 * hand and notify nobody, so a detected location updated no link for the rest
 * of the page's life. An ESLint rule now rejects a direct write to these keys
 * anywhere but this file, so a new ZIP input cannot repeat it by accident.
 *
 * `explicit` separates a choice from a guess. A ZIP the visitor typed or picked
 * is newer information than the link that brought them here, so it corrects a
 * stale `?zipcode=` in the address bar. Geolocation is not a choice — it runs
 * unprompted on page load — and must not overwrite a `?zipcode=` that someone
 * deliberately sent: that is exactly the case `readVisitorZip` lets the URL
 * win for.
 */
export function saveVisitorZip(
  zip: { postcode: string; label: string; depot: string },
  { explicit = true }: { explicit?: boolean } = {},
): void {
  if (typeof window === 'undefined' || !zip.postcode) return

  try {
    localStorage.setItem('zipcode', zip.postcode)
    // Falls back to the postcode rather than storing an empty label, which
    // every reader would otherwise render as a blank location.
    localStorage.setItem('zipcode_label', zip.label || zip.postcode)
    localStorage.setItem('zipcode_depot', zip.depot)
  } catch {
    // Storage unavailable (Safari private mode). The URL fix and the broadcast
    // below still help this page, so carry on rather than returning.
  }

  if (explicit) adoptVisitorZipInUrl(zip.postcode, zip.depot)

  // Last, so every reader re-resolves against the final storage *and* URL.
  notifyVisitorZipChange()
}

/** Call after writing any of the ZIP keys, so readers in this tab re-read. */
export function notifyVisitorZipChange(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(VISITOR_ZIP_EVENT))
}

/**
 * Forget where the visitor is, so the ZIP prompt asks again.
 *
 * Clears the three keys {@link readVisitorZip} reads, plus the gallery redirect
 * built from them. Only ever touches this browser's own storage.
 *
 * Deliberately leaves `userZipCode`, which is the geolocation detector's cache.
 * `ZipAutoDetect` skips itself whenever that key is set, so leaving it is what
 * makes this reset hold: clear it too and, in any browser that has already
 * granted location permission, the ZIP is silently re-detected within a second
 * and the prompt never appears — which is exactly the thing this exists to
 * avoid. Clearing it is still available via `clearDetectedLocation`.
 */
export function clearVisitorZip(): void {
  try {
    localStorage.removeItem('zipcode')
    localStorage.removeItem('zipcode_label')
    localStorage.removeItem('zipcode_depot')
    localStorage.removeItem('gallery_redirect')
  } catch {
    // Storage unavailable — nothing was stored to begin with.
  }
}

/**
 * Also drop the geolocation cache.
 *
 * Separate because it re-arms the browser's location prompt on the next page
 * load, which is rarely what you want mid-demo.
 */
export function clearDetectedLocation(): void {
  try {
    localStorage.removeItem('userZipCode')
  } catch {
    // Storage unavailable — nothing was stored to begin with.
  }
}

/**
 * Read the visitor's ZIP. Browser-only — returns empties on the server.
 *
 * The URL wins over storage: a link carrying `?zipcode=` was built for a
 * specific destination, by link enrichment, an ad or someone sharing a page,
 * and it should beat whatever this browser remembers from a previous visit.
 */
export function readVisitorZip(): VisitorZip {
  if (typeof window === 'undefined') return EMPTY_VISITOR_ZIP

  let urlZip = ''
  try {
    urlZip = new URLSearchParams(window.location.search).get('zipcode')?.trim() ?? ''
  } catch {
    // Malformed query string — fall through to storage.
  }

  try {
    const storedZip = localStorage.getItem('zipcode') ?? ''
    const storedLabel = localStorage.getItem('zipcode_label') ?? ''
    const storedDepot = localStorage.getItem('zipcode_depot') ?? ''

    const postcode = urlZip || storedZip
    // Only reuse the stored label when it actually describes the ZIP in play,
    // or a URL ZIP would be shown under the previous visit's city name.
    const label = urlZip
      ? storedLabel.includes(urlZip)
        ? storedLabel
        : urlZip
      : storedLabel || storedZip
    // Likewise the depot: it belongs to the stored ZIP, so it only applies when
    // the URL agrees with it. A wrong depot is worse than none — it is what
    // delivery would be priced from.
    const depot = !urlZip || urlZip === storedZip ? storedDepot : ''

    return { postcode, label, depot }
  } catch {
    // Safari private mode throws outright — the URL is all we have.
    return { postcode: urlZip, label: urlZip, depot: '' }
  }
}
