import { cacheLife } from 'next/cache'
import { fetchProduct } from '@/services/product.service'
import { cachedGeoapifyAutocomplete } from '@/services/geoapify.service'
import { getDeliveryRates } from '@/services/delivery.service'
import { cheapestDeliveryOption, hasQuotedDelivery } from '@/lib/delivery'
import { formatPrice, toNumber } from '@/lib/formatters'
// Shapes live in types/ so the client-side summary panel can import them
// without pulling in this module's `'use cache'` directive.
import type { DeliveryQuoteContext, QuoteLine } from '@/types/deliveryQuote'
export type { DeliveryQuoteContext, QuoteLine } from '@/types/deliveryQuote'

/**
 * The quote a visitor is asking about, resolved on the server from the URL.
 *
 * The flow's state lives in the query string rather than a session because the
 * page has to be server-rendered for SEO, and a server render cannot read
 * localStorage — where the rest of the app keeps the visitor's ZIP and cart.
 * A link is also the only thing a visitor can send to a colleague, bookmark, or
 * come back to a day later.
 *
 * Every field is optional. Someone can land here from an ad with no parameters
 * at all, and that is a legitimate way to arrive: the form still works, the
 * summary just describes what it does not yet know instead of inventing a
 * container. Nothing here throws — a dead handle or a delivery lookup that
 * times out degrades to a thinner summary, never to an error page.
 */

const FALLBACK_TITLE = 'Your shipping container'

/**
 * `formatPrice` deliberately returns a bare figure — see its own doc comment —
 * so the symbol belongs here, the same way the product panel adds it.
 */
function money(amount: number): string {
  return '$' + formatPrice(amount)
}

/**
 * A postcode as a place: "New York, NY 10001".
 *
 * Deliberately the same source and the same join as `zipcode_label`, the key
 * `useGeoapify.selectResult` writes — so the destination reads identically
 * whether the visitor set it here, on the product page, or in the header. The
 * delivery lookup also names the ZIP, but names it worse: it answers "South Los
 * Angeles" and "Manhattan" where geoapify says "Los Angeles" and "New York".
 *
 * The `String(… ?? '')` guards matter. Geoapify returns some postcodes with no
 * city at all — 30345 is one — and interpolating that directly renders the
 * literal text "undefined, GA 30345", which is exactly the bug this join was
 * written to avoid on the client.
 *
 * Never throws: an unresolvable ZIP falls back to the caller's own fallback.
 */
async function resolveZipLabel(zip: string): Promise<string | null> {
  'use cache'
  cacheLife('days')

  try {
    const data = await cachedGeoapifyAutocomplete({
      text: zip,
      limit: '1',
      type: 'postcode',
      filter: 'countrycode:us,ca',
    })

    const properties = (data.features?.[0] as { properties?: Record<string, unknown> } | undefined)
      ?.properties
    if (!properties) return null

    const city = String(properties.city ?? '')
    const stateCode = String(properties.state_code ?? '')
    const postcode = String(properties.postcode ?? '') || zip
    const place = [city, stateCode].filter(Boolean).join(', ')
    return [place, postcode].filter(Boolean).join(' ') || null
  } catch {
    return null
  }
}

function readQuantity(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? '', 10)
  // A quantity from a URL is untrusted input, and the summary multiplies by it.
  // Clamped rather than rejected: a nonsense value should not 500 the page.
  if (!Number.isFinite(n) || n < 1) return 1
  return Math.min(n, 99)
}

export async function resolveDeliveryQuote(params: {
  handle?: string
  zip?: string
  qty?: string
}): Promise<DeliveryQuoteContext> {
  'use cache'

  const handle = params.handle?.trim() || null
  const zip = params.zip?.trim() || null
  const quantity = readQuantity(params.qty)

  const response = handle ? await fetchProduct(handle) : null
  const product = response?.product ?? null

  // `toNumber`, not `parseFloat`: the catalogue sends prices as formatted
  // strings, and `parseFloat('1,399.00')` is 1 — a wrong number that looks like
  // a real one, which is the worst kind to put in a quote.
  const unitPrice = toNumber(product?.product_price) ?? 0
  const hasPrice = unitPrice > 0

  const lines: QuoteLine[] = []
  let runningTotal = hasPrice ? unitPrice * quantity : 0
  let deliveryLabel: string | null = zip
  let deliveryCharge: string | null = null
  let deliveryPending = true

  if (hasPrice) {
    // A rent-to-own row's price is the contract total, not a purchase price.
    // Saying so on the label is the difference between an accurate quote and a
    // number the customer reads as something else entirely.
    const isRto = String(product?.payment_type ?? '').toLowerCase() === 'rto'
    const term = product?.payment_term?.[0]
    const base = isRto
      ? `Container (rent-to-own${term ? `, ${term} months` : ''})`
      : 'Container'
    lines.push({
      label: quantity > 1 ? `${base} x ${quantity}` : base,
      value: money(unitPrice * quantity),
    })
  }

  // Delivery is the number this whole page exists to pin down, so it is worth
  // asking for even when we only have a ZIP and no product — but a miss here is
  // expected, not exceptional. Most depots quote nothing until a real address
  // is confirmed, which is exactly what the visitor is here to give us.
  if (zip) {
    // Both calls only need the ZIP, so they go together — the label must not
    // wait on a delivery lookup that can take seconds or time out entirely.
    const [result, geoLabel] = await Promise.all([
      getDeliveryRates({ zipcode: zip, ...(handle ? { slug: handle } : {}) }),
      resolveZipLabel(zip),
    ])

    // Delivery's own destination is the fallback, not the first choice — see
    // `resolveZipLabel`. Either way the visitor gets a place rather than five
    // digits they cannot check at a glance.
    if (geoLabel) {
      deliveryLabel = geoLabel
    } else if (result.ok) {
      const { label, city, state } = result.rates.destination
      const place = [city, state].filter(Boolean).join(', ')
      deliveryLabel = [place, zip].filter(Boolean).join(' ') || label || zip
    }

    if (result.ok && hasQuotedDelivery(result.rates)) {
      const cheapest = cheapestDeliveryOption(result.rates)
      // `rate` is null whenever there is no quotable number — no depot on the
      // route, or a price over the ceiling upstream will not publish. Prefer
      // upstream's own formatting so this page and the PDP read the same.
      if (cheapest?.rate != null) {
        deliveryCharge = cheapest.rate_formatted || money(cheapest.rate)
        deliveryPending = false
        lines.push({ label: 'Estimated delivery', value: deliveryCharge })
        runningTotal += cheapest.rate
      }
    } else {
      deliveryCharge = 'Quoted after we confirm your address'
      lines.push({ label: 'Delivery', value: deliveryCharge, muted: true })
    }
  }

  return {
    handle,
    productTitle: product?.container_title ?? FALLBACK_TITLE,
    productImage: product?.thumbnail_url ?? null,
    priceLabel: hasPrice ? money(unitPrice) : null,
    zip,
    quantity,
    subtotal: hasPrice ? money(unitPrice * quantity) : null,
    deliveryLabel,
    deliveryCharge,
    deliveryPending,
    lines,
    total: runningTotal > 0 ? money(runningTotal) : null,
    backHref: handle ? `/product/${handle}` : '/sale-shipping-containers',
    resolved: product !== null,
  }
}
