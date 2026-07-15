// Nested under `profile` in the raw /api/auth/profile response — field names
// mirror the backend's raw keys (e.g. `billing_state`, not `billing_province`
// like /api/cart/create expects — see userProfileToCart in cart.service.ts).
export interface UserProfile {
  billingAddress?: string
  billingCity?: string
  billingCountry?: string
  billingState?: string
  billingZip?: string
  shippingAddress?: string
  shippingCity?: string
  shippingCountry?: string
  shippingState?: string
  shippingZip?: string
  phone?: string
}

export interface User {
  id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  displayName?: string
  profile?: UserProfile
}

export interface AuthSession {
  user: User
  token: string
  // Not present on every backend auth flow — only used for the background
  // refresh cycle (POST /api/refresh) when the backend issues one.
  refreshToken?: string
}

export interface RegisterPayload {
  firstName: string
  lastName: string
  contactNumber: string
  companyName?: string
  email: string
  password: string
}

export interface AccountDetailsPayload {
  firstName: string
  lastName: string
  displayName?: string
  email: string
}
