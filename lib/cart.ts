import type { Cart, CartItem } from '@/types/cart'

// Shipping containers ship from a physical depot — mixing two locations in
// one order breaks the single-delivery flow, so only one location may be in
// the cart's container line items at a time.
export function findLocationConflict(
  cart: Cart,
  candidate: { isContainer?: boolean; location?: string },
): CartItem | undefined {
  if (!candidate.isContainer || !candidate.location) return undefined
  return cart.items.find(
    (item) => item.isContainer && item.location && item.location !== candidate.location,
  )
}
