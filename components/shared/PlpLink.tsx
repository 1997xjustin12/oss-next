'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'
import { useStoredZip } from '@/hooks/useStoredZip'
import { applyEnrichParams } from '@/lib/linkEnrich'

/**
 * A link to the product listing that carries the visitor's saved location.
 *
 * Drop-in for `next/link`. Anything pointing at `/sale-shipping-containers`
 * should use this, so a click arrives with `?zipcode=` and `?location=` already
 * set instead of landing on the default region.
 *
 * ## Why a component rather than the DOM sweep
 *
 * `enrichSaleLinks()` rewrites `href` attributes after the fact, and for a
 * `next/link` that does nothing: the router navigates to the `href` **prop**
 * and ignores the attribute. Verified — mutating a footer link's attribute to
 * carry `zipcode=99999` and clicking it landed on the URL without it. The sweep
 * still made hover previews and right-click-copy show the enriched URL, so it
 * looked like it worked while every real click dropped the parameters.
 *
 * The sweep remains correct for plain `<a>` elements in the WordPress-injected
 * HTML, which is what it is scoped to. React-owned links have to be enriched
 * where they are rendered, which is here.
 *
 * ## Why this works in a Server Component
 *
 * The location lives in `localStorage`, which no server render can read — so
 * pages like the footer and the homepage hero could never enrich their own
 * links. This is a client leaf: the page around it stays server-rendered and
 * only the anchor itself hydrates.
 *
 * ## Why there is no hydration mismatch
 *
 * `useStoredZip` returns empty on the first render and the real value after
 * mount, so the server HTML carries the bare href and the client swaps in the
 * enriched one. That is a prop change React performs itself — unlike the sweep,
 * which mutated attributes React believed it owned and produced an unpatchable
 * mismatch on every page load.
 *
 * ## Staying current
 *
 * `useStoredZip` subscribes to `VISITOR_ZIP_EVENT`, so these links update the
 * moment anything calls `notifyVisitorZipChange()` — which `useGeoapify` does
 * on every selection. Nothing has to know this component exists; a new ZIP
 * input built on that hook updates every link on the page for free.
 */
export function PlpLink({ href, ...rest }: ComponentProps<typeof Link> & { href: string }) {
  const { postcode, depot } = useStoredZip()

  return <Link href={applyEnrichParams(href, postcode, depot)} {...rest} />
}
