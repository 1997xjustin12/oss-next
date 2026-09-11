import type { Cart, CartItem, CartLineItem, CreateCartPayload } from '@/types/cart'
import type { User } from '@/types/user'

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

// ── Location conflict prompt ─────────────────────────────────────────────────
//
// One modal, mounted once inside CartProvider, answers every attempt to break
// the rule above — adding a container from another depot, or moving the
// visitor's ZIP to another depot while the cart holds one. Triggered by event
// rather than rendered per page, so nothing that can cause a conflict has to
// know how to show one: the ZIP inputs never did, and two add-to-cart surfaces
// each carried their own copy of the modal.

export const CART_LOCATION_CONFLICT_EVENT = 'oss:cart-location-conflict'

export type CartLocationConflictRequest = {
  /** The depot the cart's containers ship from. */
  currentLocation: string
  /** The depot the blocked action would have moved to. */
  newLocation: string
  /** What was blocked — the modal words itself, and offers actions, to fit. */
  reason: 'add' | 'zip'
  /**
   * Finish the blocked action once the cart has been cleared. The prompt runs
   * it only after the cleared cart has actually rendered, so a guard that reads
   * the cart sees it empty rather than the stale copy that blocked it.
   */
  retry?: () => void
}

export function requestCartLocationConflict(request: CartLocationConflictRequest): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(CART_LOCATION_CONFLICT_EVENT, { detail: request }))
}

// Backend create/update expect the full raw hit + quantity per item
// (CartLineItem), not the simplified shape CartContext keeps for display.
// Items missing rawHit (legacy localStorage carts saved before that field
// existed) are dropped — they sync correctly once removed and re-added.
//
// `product_id` is required by /api/cart/update specifically — confirmed
// against a real 400 ("This field is required.") on 2026-07-14; /api/cart/create
// doesn't enforce it, but sending it on both keeps the two payloads consistent.
export function cartItemsToLineItems(items: CartItem[]): CartLineItem[] {
  return items
    .filter((item): item is CartItem & { rawHit: NonNullable<CartItem['rawHit']> } => !!item.rawHit)
    .map((item) => ({ ...item.rawHit, product_id: item.rawHit.objectID, quantity: item.quantity }))
}

// Maps a normalized User (with its nested profile) onto /api/cart/create's
// billing_*/shipping_* fields — same field mapping as the reference app's
// own userProfileToCart, just reading from our already-normalized
// User/UserProfile shape instead of the raw backend object directly.
// Client-safe (no server-only env vars) since CartContext calls this too.
export function userProfileToCart(user: User): Omit<CreateCartPayload, 'items'> {
  const profile = user.profile ?? {}

  return {
    billing_address: profile.billingAddress ?? '',
    billing_city: profile.billingCity ?? '',
    billing_country: profile.billingCountry ?? '',
    billing_email: user.email,
    billing_first_name: user.firstName ?? '',
    billing_last_name: user.lastName ?? '',
    billing_phone: profile.phone ?? '',
    billing_province: profile.billingState ?? '',
    billing_zip_code: profile.billingZip ?? '',
    shipping_address: profile.shippingAddress ?? '',
    shipping_city: profile.shippingCity ?? '',
    shipping_country: profile.shippingCountry ?? '',
    shipping_email: user.email,
    shipping_first_name: user.firstName ?? '',
    shipping_last_name: user.lastName ?? '',
    shipping_phone: profile.phone ?? '',
    shipping_province: profile.shippingState ?? '',
    shipping_zip_code: profile.shippingZip ?? '',
  }
}
