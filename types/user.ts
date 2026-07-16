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

// Full-object shape for PUT /api/auth/account-details (→ PUT {backend}/api/auth/profile).
// The backend has no `displayName` concept and no partial-patch support — every
// field here is resent on every save, so callers must merge their edits into the
// user's current full profile rather than submitting only the fields they touched.
export interface AccountDetailsPayload {
  firstName: string
  lastName: string
  email: string
  profile?: UserProfile
}

// Wire shape actually sent to the backend — snake_case, profile fields nested.
export interface ProfileUpdatePayload {
  first_name: string
  last_name: string
  email?: string
  profile: {
    phone?: string
    billing_address?: string
    billing_country?: string
    billing_city?: string
    billing_state?: string
    billing_zip?: string
    shipping_address?: string
    shipping_country?: string
    shipping_city?: string
    shipping_state?: string
    shipping_zip?: string
  }
}
