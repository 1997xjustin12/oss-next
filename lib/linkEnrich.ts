import { readVisitorZip } from '@/lib/visitorZip'

const ENRICHED_PREFIXES = ['/sale-shipping-containers']

function getPathAndParams(href: string): { path: string; params: URLSearchParams; isAbsolute: boolean } | null {
  if (href.startsWith('http') || href.startsWith('//')) {
    try {
      const url = new URL(href)
      return { path: url.pathname, params: url.searchParams, isAbsolute: true }
    } catch {
      return null
    }
  }
  const [p, search] = href.split('?')
  return { path: p, params: new URLSearchParams(search ?? ''), isAbsolute: false }
}

// Pure helper — used by React components to compute enriched hrefs during render
export function applyEnrichParams(href: string, zipcode: string, location: string): string {
  if (!zipcode && !location) return href

  const parsed = getPathAndParams(href)
  if (!parsed) return href

  const { params, isAbsolute } = parsed
  // Collapsed before matching, and the collapsed form is what gets returned.
  // A doubled slash — `${origin}/` joined onto a path that starts with `/` —
  // made `//sale-shipping-containers/` fail the prefix test, so the link was
  // silently left without the ZIP. Returning the clean path also saves the
  // redirect Next would otherwise answer a doubled slash with.
  const path = parsed.path.replace(/\/{2,}/g, '/')

  const matches = ENRICHED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(prefix + '/'),
  )
  if (!matches) return href
  if (params.get('location')) return href

  if (zipcode)  params.set('zipcode',  zipcode)
  if (location) params.set('location', location)

  if (isAbsolute) {
    const url = new URL(href)
    url.pathname = path
    url.search = params.toString()
    return url.toString()
  }
  return `${path}?${params}`
}

/**
 * Marks a container whose HTML came from outside React — the converted
 * WordPress pages and blog article bodies, both injected with
 * `dangerouslySetInnerHTML`. Those anchors are plain `<a>` elements that React
 * does not manage, and they are the only ones this sweep may touch.
 */
export const EXTERNAL_HTML_ATTR = 'data-external-html'

/**
 * DOM mutation version — for non-React HTML only (WP proxy pages, article
 * bodies). React-rendered links enrich themselves during render instead; see
 * `applyEnrichParams`'s callers.
 *
 * Scoped rather than document-wide, which is how it started. Sweeping every
 * anchor rewrote the `href` of React-owned `<Link>`s too, and doing that before
 * hydration finished made the DOM disagree with the server HTML React was
 * hydrating against — "some attributes of the server rendered HTML didn't match
 * the client properties. This won't be patched up." Reproducible: with a ZIP in
 * storage the mismatch fired on every product-page load, and with no ZIP (this
 * function returns early) it never fired once.
 *
 * Nothing was gained for the cost, either. `next/link` navigates to its own
 * `href` prop and ignores the DOM attribute, so rewriting a `<Link>`'s anchor
 * never changed where it went — it only corrupted hydration. The nav bar is
 * unaffected because it enriches its hrefs in render, which is the fix the
 * footer's links want too if they should carry the ZIP (they currently do not).
 */
export function enrichSaleLinks() {
  if (typeof window === 'undefined') return

  const containers = document.querySelectorAll<HTMLElement>(`[${EXTERNAL_HTML_ATTR}]`)
  if (containers.length === 0) return

  // Same resolution as everything else, so a page reached with ?zipcode= has
  // its links enriched with that ZIP rather than the one this browser happens
  // to remember from an earlier visit.
  const { postcode: zipcode, depot: location } = readVisitorZip()
  if (!zipcode && !location) return

  containers.forEach((container) => {
    container.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((a) => {
      // Always enrich from the href the page was authored with, never from the
      // one a previous sweep wrote. `applyEnrichParams` leaves a link that
      // already names a `location` alone — right for a link written to point at
      // one depot, but after our own first pass *every* link names one, so a
      // second ZIP change updated none of them. Remembering the original keeps
      // both: authored locations are still respected, our own are replaced.
      const original = a.dataset.enrichOriginal ?? a.getAttribute('href') ?? ''
      if (!original) return
      a.dataset.enrichOriginal = original

      const enriched = applyEnrichParams(original, zipcode, location)
      if (enriched !== a.getAttribute('href')) a.setAttribute('href', enriched)
    })
  })
}
