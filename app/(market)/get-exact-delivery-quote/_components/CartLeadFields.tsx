'use client'

import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/formatters'

/**
 * Puts the cart into the submission.
 *
 * Without this the lead reaching sales would name whatever single container the
 * URL happened to carry, while the summary beside the form listed three — and
 * the person calling back would quote the wrong order. A hidden field is enough:
 * the form posts to a Server Action, and this is the only part of the payload
 * that has to come from the browser.
 *
 * Plain text rather than JSON. It lands in the notes of a record a human reads
 * in the admin, and a human reading "2 x 20ft Standard — $1,399.00" is better
 * served than one reading an escaped object.
 */
export function CartLeadFields() {
  const { cart } = useCart()

  if (cart.items.length === 0) return null

  const summary = cart.items
    .map((item) => `${item.quantity} x ${item.name} — $${formatPrice(item.price * item.quantity)}`)
    .join('\n')

  return (
    <>
      <input type="hidden" name="cartSummary" value={summary} />
      <input type="hidden" name="cartTotal" value={`$${formatPrice(cart.totalPrice)}`} />
    </>
  )
}
