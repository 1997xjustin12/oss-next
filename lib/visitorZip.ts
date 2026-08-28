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
