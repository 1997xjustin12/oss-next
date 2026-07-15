import { cartItemsToLineItems, userProfileToCart } from '@/lib/cart'
import type { Cart, CartItem } from '@/types/cart'
import type { User } from '@/types/user'
import type { Action } from './CartContext'

type SyncDispatch = (action: Action) => void

// ── Parsing the server's active-cart response ────────────────────────────────
// Confirmed against a real logged-in session (2026-07-14) — the backend does
// NOT echo back the ES hit we sent (no objectID/title/sale_price/images).
// It reshapes every item into its own schema: product_sku/product_title/
// unit_price/product_image_url/custom_fields. product_sku is the only stable
// cross-session identifier it gives back, so restored items are keyed by SKU
// instead of objectID — see the ADD_ITEM dedup fallback in CartContext.tsx.
// There's also no `reference_number` field at all (stays undefined below).

type ParsedServerCart = {
  items: CartItem[]
  cartId?: string
  referenceNumber?: string
  updatedAt?: string
  isAbandoned?: string | null
}

function lineItemToCartItem(raw: Record<string, unknown>): CartItem | null {
  const sku = raw.product_sku
  if (typeof sku !== 'string' || !sku) return null

  const quantity = typeof raw.quantity === 'number' ? raw.quantity : 1
  const title = typeof raw.product_title === 'string' && raw.product_title ? raw.product_title : sku
  const priceStr = typeof raw.unit_price === 'string' ? raw.unit_price : raw.product_price
  const price = typeof priceStr === 'string' ? parseFloat(priceStr) : 0
  const image = typeof raw.product_image_url === 'string' ? raw.product_image_url : undefined
  const customFields = Array.isArray(raw.custom_fields) ? raw.custom_fields : []

  // Not a faithful ES hit — just enough for cartItemsToLineItems() to still
  // include this item in future create/update payloads instead of silently
  // dropping it (it filters out items with no rawHit at all).
  const rawHit = {
    objectID: sku,
    title,
    sale_price: Number.isFinite(price) ? price : 0,
    images: image ? [{ src: image }] : [],
    custom_fields: customFields,
  }

  return {
    id: sku,
    name: title,
    price: Number.isFinite(price) ? price : 0,
    quantity,
    sku,
    image,
    rawHit,
  }
}

export function parseServerCart(data: unknown): ParsedServerCart | null {
  if (!data || typeof data !== 'object') return null
  const d = data as Record<string, unknown>
  const rawItems = Array.isArray(d.items) ? d.items : []

  const items = rawItems
    .filter((raw): raw is Record<string, unknown> => !!raw && typeof raw === 'object')
    .map(lineItemToCartItem)
    .filter((item): item is CartItem => !!item)

  return {
    items,
    cartId: typeof d.cart_id === 'string' ? d.cart_id : undefined,
    referenceNumber: typeof d.reference_number === 'string' ? d.reference_number : undefined,
    updatedAt: typeof d.updated_at === 'string' ? d.updated_at : undefined,
    isAbandoned: typeof d.is_abandoned === 'string' ? d.is_abandoned : null,
  }
}

// ── Core create/update/close sync ────────────────────────────────────────────

async function createServerCart(cart: Cart, token: string, user: User, dispatch: SyncDispatch): Promise<void> {
  const res = await fetch('/api/cart/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ ...userProfileToCart(user), items: cartItemsToLineItems(cart.items) }),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) return

  dispatch({
    type: 'SET_SERVER_META',
    payload: { cartId: data?.cart_id, referenceNumber: data?.reference_number },
  })
}

// Bearer token alone identifies "the" active cart server-side — no cart_id
// needs to travel in the update/close request bodies (confirmed against the
// reference app's own frontend call sites, not from reading Django source).
export async function syncCartToBackend(cart: Cart, token: string, user: User, dispatch: SyncDispatch): Promise<void> {
  try {
    if (cart.items.length === 0) {
      if (cart.cartId) {
        await fetch('/api/cart/close', { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
        dispatch({ type: 'RESET_SERVER_CART' })
      }
      return
    }

    if (cart.isAbandoned) {
      // Resuming a previously abandoned cart — drop the old cart_id and
      // create fresh rather than reviving/updating the flagged one, same as
      // the reference app's resetAbandonedCart.
      dispatch({ type: 'RESET_SERVER_CART' })
      await createServerCart(cart, token, user, dispatch)
      return
    }

    if (!cart.cartId) {
      await createServerCart(cart, token, user, dispatch)
    } else {
      await fetch('/api/cart/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items: cartItemsToLineItems(cart.items) }),
      })
    }
  } catch {
    // Best-effort — the local cart already reflects the user's intent
    // regardless of whether the backend call succeeded.
  }
}

// ── Abandoned-cart notify ────────────────────────────────────────────────────

function buildAbandonedCartPayload(cart: Cart, user: User | null) {
  return {
    cart_id: cart.cartId,
    abandoned_cart_id: cart.cartId,
    items: cartItemsToLineItems(cart.items),
    updated_at: cart.updatedAt,
    ...(user ? userProfileToCart(user) : {}),
  }
}

// Used for the "timed" (inactivity) and "forced" (logout) triggers — awaited,
// regular fetch. Returns the Redis-recorded abandoned-at timestamp on
// success, or null (network/backend failure, or nothing to notify).
export async function notifyAbandonedCart(
  cart: Cart,
  user: User | null,
  trigger: 'timed' | 'forced',
): Promise<string | null> {
  if (cart.items.length === 0) return null

  try {
    const res = await fetch('/api/abandoned-carts/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...buildAbandonedCartPayload(cart, user), trigger }),
    })
    const data = await res.json().catch(() => null)
    return data?.abandonedAt ?? null
  } catch {
    return null
  }
}

// Used for the tab-hide/close trigger — fire-and-forget via sendBeacon so it
// survives page unload. No response is read (or readable).
export function sendAbandonedCartBeacon(cart: Cart, user: User | null): void {
  if (cart.items.length === 0) return
  if (typeof navigator === 'undefined' || !navigator.sendBeacon) return

  const body = JSON.stringify({ ...buildAbandonedCartPayload(cart, user), trigger: 'beacon' })
  const blob = new Blob([body], { type: 'application/json' })
  navigator.sendBeacon('/api/abandoned-carts/create', blob)
}
