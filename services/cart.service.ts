import type { CreateCartPayload } from '@/types/cart'
import type { User } from '@/types/user'

const BACKEND_URL = process.env.NEXT_OSS_BACKEND_URL
const STORE_DOMAIN = process.env.NEXT_PUBLIC_STORE_DOMAIN

const ACTIVE_CART_URL = `${BACKEND_URL}api/cart/active`
const CREATE_CART_URL = `${BACKEND_URL}api/cart/create`
const CLOSE_CART_URL = `${BACKEND_URL}api/cart/close`
const UPDATE_CART_URL = `${BACKEND_URL}api/cart/update`

// Maps a normalized User (with its nested profile) onto /api/cart/create's
// billing_*/shipping_* fields — same field mapping as the other app's
// userProfileToCart, just reading from our already-normalized User/UserProfile
// shape instead of the raw backend object directly.
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

// TODO: response shape not yet confirmed — passed through raw for now until
// /api/cart/create and /api/cart/update are wired up and the full cart data
// model (items, totals, cart id/token) is known.
export async function getActiveCart(token?: string): Promise<unknown> {
  const res = await fetch(ACTIVE_CART_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Store-Domain': STORE_DOMAIN ?? '',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.error ?? data?.detail ?? data?.message ?? 'Could not load cart.')
  }

  return data
}

// TODO: response shape + exact `items` entry contract not yet confirmed.
export async function createCart(payload: CreateCartPayload, token?: string): Promise<unknown> {
  const res = await fetch(CREATE_CART_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Store-Domain': STORE_DOMAIN ?? '',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.error ?? data?.detail ?? data?.message ?? 'Could not create cart.')
  }

  return data
}

// No request body — matches the reference proxy behavior (body sending is
// commented out there too). TODO: confirm what triggers this (checkout
// completion vs. cart abandonment) and its response shape.
export async function closeCart(token?: string): Promise<unknown> {
  const res = await fetch(CLOSE_CART_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Store-Domain': STORE_DOMAIN ?? '',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.error ?? data?.detail ?? data?.message ?? 'Could not close cart.')
  }

  return data
}

// TODO: request/response shape not yet confirmed — payload passed through
// as-is for now, matching the reference proxy behavior.
export async function updateCart(payload: unknown, token?: string): Promise<unknown> {
  const res = await fetch(UPDATE_CART_URL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Store-Domain': STORE_DOMAIN ?? '',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.error ?? data?.detail ?? data?.message ?? 'Could not update cart.')
  }

  return data
}
