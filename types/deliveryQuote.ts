/**
 * Shapes for the delivery-quote flow.
 *
 * Separate from `lib/deliveryQuote.ts` because that module carries `'use cache'`
 * — and a module with that directive cannot be imported by a Client Component
 * at all. The summary panel is a client component (it reads the cart), so the
 * types it needs have to live somewhere a client can reach. Type-only imports
 * are erased, but the boundary is worth making explicit rather than relying on
 * that: the failure mode is a build error with no line number.
 */

export type QuoteLine = {
  label: string
  value: string
  /** Rendered quieter — an estimate or a note rather than a figure. */
  muted?: boolean
}

export type DeliveryQuoteContext = {
  /** Product handle from the URL, if one was passed. */
  handle: string | null
  productTitle: string
  /** Present only when the handle resolved to a real product. */
  productImage: string | null
  priceLabel: string | null
  zip: string | null
  quantity: number
  /** The container price, before delivery. */
  subtotal: string | null
  /**
   * Where it is going, in words: "New York, NY 10001".
   *
   * A bare postcode is a poor confirmation — a visitor cannot tell 90003 from
   * 90030 at a glance, and where the container is going is half of what this
   * page asks them to check. Resolved by `resolveZipLabel`, which uses the same
   * source and format as the `zipcode_label` the rest of the site stores, so the
   * destination reads the same wherever it was set.
   */
  deliveryLabel: string | null
  /** Formatted charge, or a note when nothing can be quoted yet. */
  deliveryCharge: string | null
  /** True when `deliveryCharge` is a note rather than a figure. */
  deliveryPending: boolean
  lines: QuoteLine[]
  total: string | null
  /** Where Back goes: the product page when we know it, else the listing. */
  backHref: string
  /** True when the handle resolved — the summary is describing a real product. */
  resolved: boolean
}
