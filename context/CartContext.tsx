'use client'

import { createContext, useEffect, useReducer, useRef, useState } from 'react'
import { AddedToCartModal } from '@/components/cart/AddedToCartModal'
import { useAuth } from '@/hooks/useAuth'
import { isCartTimedOut } from '@/lib/cartAbandonment'
import { notifyAbandonedCart, parseServerCart, sendAbandonedCartBeacon, syncCartToBackend } from './cartSync'
import type { Cart, CartItem } from '@/types/cart'

// ── Actions ───────────────────────────────────────────────────────────────────

export type Action =
  | { type: 'ADD_ITEM';     payload: CartItem }
  | { type: 'REMOVE_ITEM';  id: string }
  | { type: 'UPDATE_QTY';   id: string; qty: number }
  | { type: 'CLEAR_CART' }
  | { type: 'RESTORE_CART'; payload: Cart }
  | { type: 'SET_SERVER_META'; payload: { cartId?: string; referenceNumber?: string } }
  | { type: 'SET_ABANDONED'; payload: string | null }
  | { type: 'RESET_SERVER_CART' }

// ── Context shape ─────────────────────────────────────────────────────────────

export interface CartContextValue {
  cart: Cart
  // `showModal` defaults to true — every add-to-cart triggers the global
  // "Added to Cart!" modal (components/cart/AddedToCartModal.tsx) unless a
  // caller explicitly opts out by passing `false`.
  addItem:    (item: CartItem, showModal?: boolean) => void
  removeItem: (id: string) => void
  updateQty:  (id: string, qty: number) => void
  clearCart:  () => void
}

export const CartContext = createContext<CartContextValue | null>(null)

// ── Reducer ───────────────────────────────────────────────────────────────────

function totals(items: CartItem[]) {
  return {
    totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
    totalPrice: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  }
}

const EMPTY_CART: Cart = { items: [], totalItems: 0, totalPrice: 0 }
const STORAGE_KEY = 'oss-cart'
// Batches rapid mutations (repeated qty +/- clicks) into one backend sync
// call instead of firing one per click.
const SYNC_DEBOUNCE_MS = 800

function loadCart(): Cart {
  if (typeof window === 'undefined') return EMPTY_CART
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Cart) : EMPTY_CART
  } catch {
    return EMPTY_CART
  }
}

function reducer(state: Cart, action: Action): Cart {
  switch (action.type) {
    case 'ADD_ITEM': {
      // Falls back to matching by sku because an item restored from the
      // backend is keyed by sku (product_sku is the only stable identifier
      // it echoes back — see context/cartSync.ts), while a freshly-added
      // item from a PDP/PLP is keyed by its ES objectID. Without this,
      // re-adding a product already in a restored cart would create a
      // duplicate line instead of incrementing the existing one.
      const exists = state.items.find(i =>
        i.id === action.payload.id || (!!i.sku && !!action.payload.sku && i.sku === action.payload.sku),
      )
      const items = exists
        ? state.items.map(i =>
            i === exists
              ? { ...i, quantity: i.quantity + action.payload.quantity }
              : i,
          )
        : [...state.items, action.payload]
      return { ...state, items, ...totals(items), updatedAt: new Date().toISOString() }
    }
    case 'REMOVE_ITEM': {
      const items = state.items.filter(i => i.id !== action.id)
      return { ...state, items, ...totals(items), updatedAt: new Date().toISOString() }
    }
    case 'UPDATE_QTY': {
      const items = action.qty <= 0
        ? state.items.filter(i => i.id !== action.id)
        : state.items.map(i => i.id === action.id ? { ...i, quantity: action.qty } : i)
      return { ...state, items, ...totals(items), updatedAt: new Date().toISOString() }
    }
    case 'CLEAR_CART':
      return { ...EMPTY_CART, updatedAt: new Date().toISOString() }
    case 'RESTORE_CART':
      return action.payload
    case 'SET_SERVER_META':
      return { ...state, ...action.payload }
    case 'SET_ABANDONED':
      return { ...state, isAbandoned: action.payload }
    case 'RESET_SERVER_CART':
      return { ...state, cartId: undefined, referenceNumber: undefined, isAbandoned: null }
    default:
      return state
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, token, isAuthenticated } = useAuth()
  const [cart, dispatch] = useReducer(reducer, EMPTY_CART)
  // Drives the global AddedToCartModal — set on every addItem() call unless
  // the caller passes showModal=false. Rendered once here so it's available
  // on every page without each call site mounting its own modal.
  const [addedItem, setAddedItem] = useState<CartItem | null>(null)

  // Effects below read the *latest* cart without needing to be torn down
  // and rebuilt every time it changes (same pattern as AuthContext's
  // sessionRef) — the debounce/interval/listener setups only need to run
  // once per relevant dependency change, not on every keystroke of cart state.
  const cartRef = useRef(cart)
  useEffect(() => { cartRef.current = cart }, [cart])

  const wasAuthenticatedRef = useRef(isAuthenticated)
  const beaconSentRef = useRef(false)
  // AuthContext clears `user` in the same update that flips `isAuthenticated`
  // to false, so the logout-triggered abandon notify below needs this to
  // still have the billing/shipping info at the moment it fires.
  const lastUserRef = useRef(user)
  useEffect(() => { if (user) lastUserRef.current = user }, [user])

  // ── restore local cart on mount ──
  useEffect(() => {
    const stored = loadCart()
    if (stored.items.length > 0) dispatch({ type: 'RESTORE_CART', payload: stored })
  }, [])

  // ── persist to localStorage ──
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
  }, [cart])

  // ── load the server's active cart once the user is authenticated ──
  // Server cart wins when it has items (matches the reference app: Django is
  // the source of truth for a logged-in user's cart). If the server cart is
  // empty but the guest had local items, there's nothing to merge from the
  // server — the sync effect below creates one from what's already local.
  useEffect(() => {
    if (!isAuthenticated || !token) return
    let cancelled = false

    fetch('/api/cart/active', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: unknown) => {
        if (cancelled || !data) return
        const server = parseServerCart(data)
        if (!server) return

        if (server.items.length > 0) {
          dispatch({ type: 'RESTORE_CART', payload: { ...server, ...totals(server.items) } })
        } else {
          dispatch({ type: 'SET_SERVER_META', payload: { cartId: server.cartId, referenceNumber: server.referenceNumber } })
          dispatch({ type: 'SET_ABANDONED', payload: server.isAbandoned ?? null })
        }
      })
      .catch(() => {
        // Best-effort — the local cart still works even if this fails.
      })

    return () => { cancelled = true }
  }, [isAuthenticated, token])

  // ── sync mutations to the backend (debounced, logged-in only) ──
  // Depends on cart.items (not the whole cart) so this doesn't re-fire from
  // its own SET_SERVER_META/SET_ABANDONED/RESET_SERVER_CART dispatches below,
  // none of which produce a new items array reference.
  useEffect(() => {
    if (!isAuthenticated || !token || !user) return

    const handle = setTimeout(() => {
      syncCartToBackend(cartRef.current, token, user, dispatch)
    }, SYNC_DEBOUNCE_MS)

    return () => clearTimeout(handle)
  }, [cart.items, isAuthenticated, token, user])

  // ── abandoned-cart: "forced" trigger on logout ──
  useEffect(() => {
    const wasAuthenticated = wasAuthenticatedRef.current
    wasAuthenticatedRef.current = isAuthenticated

    if (wasAuthenticated && !isAuthenticated && cartRef.current.items.length > 0) {
      notifyAbandonedCart(cartRef.current, lastUserRef.current, 'forced')
      dispatch({ type: 'RESET_SERVER_CART' })
    }
  }, [isAuthenticated])

  // ── abandoned-cart: debounced activity ("timed") + tab hide/close ("beacon") ──
  useEffect(() => {
    if (cart.items.length === 0) return

    let debounceHandle: ReturnType<typeof setTimeout> | undefined

    function onActivity() {
      clearTimeout(debounceHandle)
      debounceHandle = setTimeout(() => {
        const current = cartRef.current
        if (current.items.length === 0 || current.isAbandoned) return
        if (isCartTimedOut(current.updatedAt, isAuthenticated)) {
          notifyAbandonedCart(current, user, 'timed').then((abandonedAt) => {
            if (abandonedAt) dispatch({ type: 'SET_ABANDONED', payload: abandonedAt })
          })
        }
      }, 2000)
    }

    function onVisibilityOrUnload() {
      if (document.visibilityState !== 'hidden' && document.visibilityState !== undefined) {
        // Tab became visible again — allow another beacon next time it hides.
        if (document.visibilityState === 'visible') beaconSentRef.current = false
        return
      }
      const current = cartRef.current
      if (beaconSentRef.current || current.items.length === 0 || current.isAbandoned) return
      beaconSentRef.current = true
      sendAbandonedCartBeacon(current, user)
    }

    document.addEventListener('click', onActivity)
    document.addEventListener('keydown', onActivity)
    document.addEventListener('scroll', onActivity)
    document.addEventListener('visibilitychange', onVisibilityOrUnload)
    window.addEventListener('beforeunload', onVisibilityOrUnload)

    return () => {
      clearTimeout(debounceHandle)
      document.removeEventListener('click', onActivity)
      document.removeEventListener('keydown', onActivity)
      document.removeEventListener('scroll', onActivity)
      document.removeEventListener('visibilitychange', onVisibilityOrUnload)
      window.removeEventListener('beforeunload', onVisibilityOrUnload)
    }
  }, [cart.items.length, isAuthenticated, user])

  const value: CartContextValue = {
    cart,
    addItem: (item, showModal = true) => {
      dispatch({ type: 'ADD_ITEM', payload: item })
      if (showModal) setAddedItem(item)
    },
    removeItem: (id)   => dispatch({ type: 'REMOVE_ITEM', id }),
    updateQty:  (id, qty) => dispatch({ type: 'UPDATE_QTY', id, qty }),
    clearCart:  ()     => dispatch({ type: 'CLEAR_CART' }),
  }

  return (
    <CartContext value={value}>
      {children}
      <AddedToCartModal item={addedItem} onClose={() => setAddedItem(null)} />
    </CartContext>
  )
}
