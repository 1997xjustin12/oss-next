import type { Cart, CartItem } from '@/types/cart'

/**
 * Every message the cart reducer understands.
 *
 * Its own module to break an import cycle: `cartSync` dispatches these, and
 * `CartContext` imports `cartSync`'s functions, so defining the type in the
 * context made the two depend on each other.
 *
 * `import type` is erased, so nothing was broken at runtime — but a cycle that
 * is only safe because of *how* it is imported stops being safe the moment
 * someone needs a value across it. That is not hypothetical here: this exact
 * module pair produced two bugs on 2026-09-23, when a component rendered by
 * `CartProvider` imported `useCart` and left the context half-initialised at
 * hydration. Both were fixed by passing data down instead; this removes the
 * remaining edge so the next one cannot start the same way.
 */
export type Action =
  | { type: 'ADD_ITEM';     payload: CartItem; guest?: boolean }
  | { type: 'REMOVE_ITEM';  id: string }
  | { type: 'UPDATE_QTY';   id: string; qty: number; guest?: boolean }
  | { type: 'CLEAR_CART' }
  | { type: 'RESTORE_CART'; payload: Cart }
  | { type: 'SET_SERVER_META'; payload: { cartId?: string; referenceNumber?: string } }
  | { type: 'SET_ABANDONED'; payload: string | null }
  | { type: 'RESET_SERVER_CART' }
