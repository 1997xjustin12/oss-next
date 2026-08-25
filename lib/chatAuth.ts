/**
 * The visitor's own backend token, as it reaches our chat routes.
 *
 * The storefront session lives in localStorage, so the widget has to hand the
 * token to us explicitly; it arrives as a normal `Authorization: Bearer`
 * header and is forwarded to the backend as `X-User-Token`.
 *
 * Forwarding it is right — it is the visitor's credential, and the backend
 * needs it to attribute a conversation to them. What must never cross in the
 * other direction is the backend API key, which stays server-side.
 */
export function userTokenFrom(request: Request): string | null {
  const header = request.headers.get('authorization')?.trim()
  if (!header) return null

  const match = /^Bearer\s+(.+)$/i.exec(header)
  const token = match?.[1]?.trim()

  // A token long enough to plausibly be one. Anything shorter is a client bug
  // or a probe, and sending it on would just earn a 401 from the backend.
  return token && token.length >= 16 ? token : null
}
