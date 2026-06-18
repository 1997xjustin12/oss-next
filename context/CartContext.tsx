'use client'

import { createContext, useReducer } from 'react'
import type { Cart, CartItem } from '@/types/cart'

// ── Actions ───────────────────────────────────────────────────────────────────

type Action =
  | { type: 'ADD_ITEM';    payload: CartItem }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'UPDATE_QTY';  id: string; qty: number }
  | { type: 'CLEAR_CART' }

// ── Context shape ─────────────────────────────────────────────────────────────

export interface CartContextValue {
  cart: Cart
  addItem:    (item: CartItem) => void
  removeItem: (id: string) => void
  updateQty:  (id: string, qty: number) => void
  clearCart:  () => void
}

export const CartContext = createContext<CartContextValue | null>(null)

// ── Reducer ───────────────────────────────────────────────────────────────────

function derive(items: CartItem[]): Cart {
  return {
    items,
    totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
    totalPrice: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  }
}

const EMPTY_CART: Cart = { items: [], totalItems: 0, totalPrice: 0 }

function reducer(state: Cart, action: Action): Cart {
  switch (action.type) {
    case 'ADD_ITEM': {
      const exists = state.items.find(i => i.id === action.payload.id)
      const items = exists
        ? state.items.map(i =>
            i.id === action.payload.id
              ? { ...i, quantity: i.quantity + action.payload.quantity }
              : i,
          )
        : [...state.items, action.payload]
      return derive(items)
    }
    case 'REMOVE_ITEM':
      return derive(state.items.filter(i => i.id !== action.id))
    case 'UPDATE_QTY': {
      const items = action.qty <= 0
        ? state.items.filter(i => i.id !== action.id)
        : state.items.map(i => i.id === action.id ? { ...i, quantity: action.qty } : i)
      return derive(items)
    }
    case 'CLEAR_CART':
      return EMPTY_CART
    default:
      return state
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, dispatch] = useReducer(reducer, EMPTY_CART)

  const value: CartContextValue = {
    cart,
    addItem:    (item) => dispatch({ type: 'ADD_ITEM', payload: item }),
    removeItem: (id)   => dispatch({ type: 'REMOVE_ITEM', id }),
    updateQty:  (id, qty) => dispatch({ type: 'UPDATE_QTY', id, qty }),
    clearCart:  ()     => dispatch({ type: 'CLEAR_CART' }),
  }

  return <CartContext value={value}>{children}</CartContext>
}
