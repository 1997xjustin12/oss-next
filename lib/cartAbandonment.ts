// Matches the reference app's timeouts exactly (see docs/reference/ABANDONED_CART_EXPLAINER.md).
export const GUEST_ABANDON_TIMEOUT_MS = 5 * 60 * 1000        // 5 minutes
export const USER_ABANDON_TIMEOUT_MS = 24 * 60 * 60 * 1000   // 24 hours

// `updatedAt` is refreshed on every real cart mutation — normal shopping
// activity keeps resetting this clock; only genuine inactivity trips it.
export function isCartTimedOut(updatedAt: string | undefined, isLoggedIn: boolean): boolean {
  if (!updatedAt) return false
  const timeout = isLoggedIn ? USER_ABANDON_TIMEOUT_MS : GUEST_ABANDON_TIMEOUT_MS
  return Date.now() - new Date(updatedAt).getTime() > timeout
}
