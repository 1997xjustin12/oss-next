import { ROUTES } from '@/config/routes'
import { readVisitorZip } from '@/lib/visitorZip'
import type { CartItem } from '@/types/cart'

/**
 * Where "Checkout" goes for this visitor.
 *
 * Signed in, straight to checkout. A guest is sent through the delivery-quote
 * form first — **every time, since 2026-09-24**, not only on their first order.
 *
 * It used to skip the form once a guest had given their details, on the
 * reasoning that asking twice is friction. In practice the second visit is
 * where the detour earns its keep: the form is the only place a guest confirms
 * the delivery address and the site conditions before an order is priced, and
 * skipping it meant a returning guest could reach Place Order having never seen
 * those questions for *this* order. Since e5cff64 the form arrives prefilled
 * from what they gave last time, so the cost of always showing it is a glance
 * and a click rather than retyping anything.
 *
 * Lives here rather than in either caller because the cart summary and the
 * added-to-cart toast both offer Checkout, and the toast used to link straight
 * past the form — including for a guest who had given nothing at all.
 */
export function checkoutDestination(isAuthenticated: boolean, items: CartItem[]): string {
  if (isAuthenticated) return ROUTES.CHECKOUT

  /**
   * A single-container cart carries its handle so the quote page can price
   * delivery straight away. A mixed cart does not: combined delivery is not the
   * sum of separate rates — it depends on trucks and total length — so quoting
   * one line's rate for the whole order would be a wrong number, confidently
   * displayed.
   */
  const containers = items.filter((item) => item.isContainer)
  const only = containers.length === 1 ? containers[0] : null
  // `rawHit` is the loosely-typed search hit, so every field off it is
  // `unknown` — and it is absent entirely on carts saved before that field
  // existed. Both cases just mean no handle to pass.
  const handle = typeof only?.rawHit?.handle === 'string' ? only.rawHit.handle : undefined
  // The app's own reader rather than the raw key: it prefers a ZIP in the URL
  // over a stored one and handles storage throwing in private mode. It can
  // still come back empty — a visitor whose ZIP only ever arrived as a query
  // parameter has nothing stored — in which case the quote page shows
  // "Not set yet" and its Edit control is how they set one.
  const zip = readVisitorZip().postcode || undefined

  return ROUTES.DELIVERY_QUOTE_FOR({ handle, zip, qty: only?.quantity })
}
