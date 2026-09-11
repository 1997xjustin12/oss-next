/**
 * The backend's own reason for refusing a request, for the server log.
 *
 * The services look for `error`, `detail` or `message` on a failed response and
 * fall back to a fixed sentence — "Could not update cart." But the backend also
 * answers with field-level validation errors, `{ items: ["…"] }`, which carry
 * none of those three keys. Those were discarded entirely, so every log line
 * said the request failed and none said why: a signed-in customer's cart was
 * being refused on every save and the only record was "Could not update cart."
 *
 * Log-only by design. The route handlers send the thrown message to the
 * browser, and raw backend validation output is not something to show a
 * customer — the fixed sentence stays the user-facing one.
 */
export function logBackendRejection(where: string, status: number, body: unknown): void {
  let reason: string
  try {
    reason = typeof body === 'string' ? body : JSON.stringify(body)
  } catch {
    reason = String(body)
  }
  console.error(`[${where}] backend refused (HTTP ${status}):`, (reason ?? 'no body').slice(0, 800))
}
