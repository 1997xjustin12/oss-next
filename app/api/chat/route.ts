import { connection } from 'next/server'
import { BACKEND_TIMEOUT_MS, MAX_MESSAGE_CHARS, REGION_MESSAGE } from '@/config/chat'
import { allowedCountries, chatRegion } from '@/lib/chatRegion'
import { clientIp } from '@/lib/clientIp'
import { userTokenFrom } from '@/lib/chatAuth'
import { checkRateLimit, rateLimitHeaders } from '@/lib/agentApi'

/**
 * POST /api/chat — proxy to the backend's assistant.
 *
 * The browser never talks to the backend directly: the URL and the API key stay
 * server-side. The backend owns the conversation — it issues `session_id` with
 * the first reply and the client echoes it back on every message after. **Never
 * invent a session id here.** A made-up one either collides with someone else's
 * thread or starts a phantom conversation the backend then has to carry.
 *
 * The backend's response is passed through **unchanged**. Reshaping it in the
 * proxy would create a second contract to keep in step with the first.
 */

const BACKEND = (process.env.NEXT_OSS_BACKEND_URL ?? '').replace(/\/+$/, '')
const API_KEY = process.env.NEXT_OSS_BACKEND_KEY
const STORE_DOMAIN = process.env.NEXT_PUBLIC_STORE_DOMAIN

/**
 * The trailing slash is required. Django routes this as `api/chat/`; a POST to
 * the slashless form is a plain 404 (a GET would get a redirect — a POST does
 * not follow one).
 */
const CHAT_PATH = '/api/chat/'

function fail(message: string, status: number, headers: Record<string, string> = {}): Response {
  return Response.json({ error: true, message }, { status, headers: { 'Cache-Control': 'no-store', ...headers } })
}

export async function POST(request: Request): Promise<Response> {
  await connection()

  // ── 1. Region, before anything else ───────────────────────────────────────
  // Each message costs the backend a model call, so a request we are going to
  // refuse should cost as close to nothing as possible — refuse before reading
  // the body, before touching Redis, before any of it.
  const region = chatRegion(request)
  if (!region.allowed) return fail(REGION_MESSAGE, 403)

  const limit = await checkRateLimit(request, 'chat')
  const headers = rateLimitHeaders(limit)
  if (!limit.allowed) {
    return fail(
      'You are sending messages too quickly. Give it a moment and try again.',
      429,
      { ...headers, 'Retry-After': String(limit.resetSeconds) },
    )
  }

  // ── 2. Body ───────────────────────────────────────────────────────────────
  let body: Record<string, unknown>
  try {
    const parsed = await request.json()
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('not an object')
    body = parsed as Record<string, unknown>
  } catch {
    return fail('Body must be JSON.', 400, headers)
  }

  const message = typeof body.message === 'string' ? body.message.trim() : ''
  if (!message) return fail('A message is required.', 400, headers)
  if (message.length > MAX_MESSAGE_CHARS) {
    return fail(`Messages are limited to ${MAX_MESSAGE_CHARS} characters.`, 400, headers)
  }

  // ── 3. Mock, for UI work with no backend ──────────────────────────────────
  // Refuses to run in production: a mocked assistant that reaches real shoppers
  // is worse than a disabled one.
  if (process.env.CHAT_MOCK === '1' && process.env.NODE_ENV !== 'production') {
    return Response.json(
      {
        reply: `Mock reply to: "${message}". Set CHAT_MOCK=0 to talk to the real assistant.`,
        session_id: typeof body.session_id === 'string' && body.session_id ? body.session_id : 'mock-session',
        took_ms: 0,
      },
      { headers: { 'Cache-Control': 'no-store', ...headers } },
    )
  }

  // ── 4. Configuration ──────────────────────────────────────────────────────
  if (!BACKEND) return fail('The assistant is not configured.', 503, headers)
  if (!STORE_DOMAIN) {
    // Refuse rather than send it blank. The backend picks a store of its own
    // when this is empty, and answering our shoppers from another brand's
    // catalogue is worse than answering nobody.
    console.error('[chat] NEXT_PUBLIC_STORE_DOMAIN is unset — refusing to let the backend choose a store.')
    return fail('The assistant is not configured.', 503, headers)
  }
  if (!API_KEY) return fail('The assistant is not configured.', 503, headers)

  // ── 5. Forward ────────────────────────────────────────────────────────────
  const payload: Record<string, string> = { message }
  // Only from the second message onward, and only when the client actually has
  // one — see the note about never inventing a session id.
  if (typeof body.session_id === 'string' && body.session_id.trim()) {
    payload.session_id = body.session_id.trim()
  }

  const outbound: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Api-Key ${API_KEY}`,
    'X-Store-Domain': STORE_DOMAIN,
  }

  // Attribution happens **here**, at write time — not when history is read.
  // A message sent without this header is stored against no user, and no
  // amount of correct calling on /api/chat/history will ever surface it. A
  // guest simply has no token, and their conversation stays anonymous.
  const userToken = userTokenFrom(request)
  if (userToken) outbound['X-User-Token'] = userToken

  // The backend logs and reasons about the visitor's address. Omitted entirely
  // when unknown — a blank value is not a fallback, it is a wrong answer that
  // looks like one.
  const ip = await clientIp(request)
  if (ip) outbound['X-Client-IP'] = ip

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), BACKEND_TIMEOUT_MS)

  try {
    const res = await fetch(`${BACKEND}${CHAT_PATH}`, {
      method: 'POST',
      headers: outbound,
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    // Read as text first. The backend renders an HTML error page when a route
    // is missing or blows up, so never assume the body is JSON.
    const raw = await res.text()
    let data: unknown = null
    try {
      data = JSON.parse(raw)
    } catch {
      data = null
    }

    if (!res.ok) {
      console.error(`[chat] backend ${res.status}: ${raw.slice(0, 300)}`)
      return fail(
        res.status === 404 ? 'The assistant is not available yet.' : 'The assistant is temporarily unavailable.',
        502,
        headers,
      )
    }

    const reply = (data as { reply?: unknown } | null)?.reply
    if (typeof reply !== 'string') {
      console.error('[chat] backend returned no string `reply`:', raw.slice(0, 300))
      return fail('The assistant is temporarily unavailable.', 502, headers)
    }

    return Response.json(data, { headers: { 'Cache-Control': 'no-store', ...headers } })
  } catch (err) {
    const aborted = err instanceof Error && err.name === 'AbortError'
    if (!aborted) console.error('[chat] request failed:', err)

    return fail(
      aborted
        ? 'The assistant took too long to respond. Try again.'
        : 'The assistant is temporarily unavailable.',
      502,
      headers,
    )
  } finally {
    clearTimeout(timer)
  }
}

/**
 * A discovery aid rather than a 405 — anything that finds this endpoint gets
 * told how to use it instead of a bare rejection.
 */
export async function GET(request: Request): Promise<Response> {
  await connection()
  const region = chatRegion(request)

  return Response.json(
    {
      endpoint: '/api/chat',
      method: 'POST',
      request: {
        message: `string, required, trimmed, ${MAX_MESSAGE_CHARS} characters max`,
        session_id: 'string, optional — echo the value the previous reply returned; never invent one',
      },
      response: { reply: 'string', session_id: 'string', took_ms: 'number' },
      availability: '/api/chat/availability',
      regions: allowedCountries(),
      available: region.allowed,
    },
    { headers: { 'Cache-Control': 'private, no-store' } },
  )
}
