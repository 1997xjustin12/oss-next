/**
 * Who is asking.
 *
 * One definition, used both to throttle a caller and to tell the backend where
 * a conversation came from. Two definitions would eventually disagree, and then
 * the address in the backend's log would not be the one we rate-limited.
 *
 * Normalisation matters more than it looks: without it the same visitor arrives
 * as `::1`, `[::1]`, `::ffff:203.0.113.42` and `203.0.113.42:54321` depending on
 * the hop, which splits their rate-limit bucket several ways and muddies the
 * log.
 */

/** The left-most `x-forwarded-for` entry is the client; the rest is proxy chain. */
export function clientIdentity(request: Request): string | null {
  const headers = request.headers
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const raw = forwarded || headers.get('x-real-ip')?.trim()

  return raw ? normalizeIp(raw) : null
}

export function normalizeIp(value: string): string | null {
  let ip = value.trim()
  if (!ip) return null

  // `[::1]:8080` or `[::1]` — bracketed IPv6, optionally with a port.
  const bracketed = ip.match(/^\[([^\]]+)\](?::\d+)?$/)
  if (bracketed) {
    ip = bracketed[1]
  } else {
    // `1.2.3.4:5678` — a port on an IPv4 address. A bare IPv6 address is also
    // full of colons, so only strip when there is exactly one.
    const colons = ip.split(':').length - 1
    if (colons === 1) ip = ip.split(':')[0]
  }

  // IPv4-mapped IPv6: `::ffff:203.0.113.42` is the same host as `203.0.113.42`.
  const mapped = ip.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i)
  if (mapped) ip = mapped[1]

  return ip || null
}

function isLoopback(ip: string): boolean {
  return ip === '::1' || ip === '0.0.0.0' || ip.startsWith('127.')
}

// Memoised for the life of the process — one lookup per dev server, not one
// per message.
let devPublicIp: string | null | undefined

/**
 * On a dev box every request arrives from loopback, which tells the backend
 * nothing. Swap in the machine's real public address so the development
 * experience matches production.
 *
 * Hard-guarded on NODE_ENV: on a deployed build this would log every visitor
 * under the server's own address, which is worse than sending nothing.
 */
async function resolveDevPublicIp(): Promise<string | null> {
  if (process.env.NODE_ENV === 'production') return null
  if (devPublicIp !== undefined) return devPublicIp

  try {
    const res = await fetch('https://api.ipify.org?format=json', {
      signal: AbortSignal.timeout(3_000),
    })
    const data = res.ok ? ((await res.json()) as { ip?: string }) : null
    devPublicIp = data?.ip ? normalizeIp(data.ip) : null
  } catch {
    devPublicIp = null
  }

  return devPublicIp
}

/**
 * The visitor's address to forward to the backend, or null.
 *
 * Null means **omit the header**. A blank value is not a fallback.
 */
export async function clientIp(request: Request): Promise<string | null> {
  const identity = clientIdentity(request)
  if (identity && !isLoopback(identity)) return identity

  return resolveDevPublicIp()
}
