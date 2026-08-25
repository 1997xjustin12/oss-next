import { connection } from 'next/server'
import { HISTORY_FETCH_LIMIT } from '@/config/chat'
import { withRateLimit } from '@/lib/agentApi'
import { userTokenFrom } from '@/lib/chatAuth'

/**
 * GET /api/chat/history — the conversations the backend has stored.
 *
 * Two shapes, both served by the same backend route:
 *
 *   signed in  ?limit=N            + X-User-Token   → that user's conversations
 *   guest      ?session_id=<id>                     → just that session
 *
 * The user's token reaches us as a normal `Authorization: Bearer` header and is
 * forwarded as `X-User-Token`. It is the visitor's own credential, so passing
 * it through is right — what must never cross is the backend API key, which
 * stays server-side exactly as it does for the chat proxy.
 *
 * **Conversations are attributed at write time, not read time.** A message
 * POSTed without `X-User-Token` is stored against no user and will never appear
 * here, however this endpoint is called — see app/api/chat/route.ts.
 */

const BACKEND = (process.env.NEXT_OSS_BACKEND_URL ?? '').replace(/\/+$/, '')
const API_KEY = process.env.NEXT_OSS_BACKEND_KEY
const STORE_DOMAIN = process.env.NEXT_PUBLIC_STORE_DOMAIN

/** No trailing slash. The backend 404s `/api/chat/history/`. */
const HISTORY_PATH = '/api/chat/history'

const TIMEOUT_MS = 15_000

/** One stored exchange. The backend pairs the question and answer, rather than
 *  emitting two role-tagged messages. */
export type StoredTurn = {
  at: string
  user: string
  assistant: string
  ok?: boolean
}

export type StoredConversation = {
  session_id: string
  store?: string
  started_at: string
  messages: StoredTurn[]
}

export type ChatHistoryResponse = {
  user?: string
  count: number
  conversations: StoredConversation[]
  /** Set when the backend declined rather than returned an empty list. */
  note?: string
}

function empty(note?: string, headers: Record<string, string> = {}): Response {
  return Response.json(
    { count: 0, conversations: [], ...(note ? { note } : {}) } satisfies ChatHistoryResponse,
    { headers: { 'Cache-Control': 'private, no-store', ...headers } },
  )
}

export async function GET(request: Request): Promise<Response> {
  await connection()

  return withRateLimit(
    request,
    async (headers) => {
      if (!BACKEND || !API_KEY || !STORE_DOMAIN) {
        return empty('History is not configured.', headers)
      }

      const query = new URL(request.url).searchParams
      const sessionId = query.get('session_id')?.trim()
      const token = userTokenFrom(request)

      // Nothing to look up: no identity and no session to scope the request to.
      if (!token && !sessionId) return empty(undefined, headers)

      const params = new URLSearchParams()
      if (token) {
        const limit = Number.parseInt(query.get('limit') ?? '', 10)
        params.set('limit', String(Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : HISTORY_FETCH_LIMIT))
      } else {
        params.set('session_id', sessionId!)
      }

      const outbound: Record<string, string> = {
        Accept: 'application/json',
        Authorization: `Api-Key ${API_KEY}`,
        'X-Store-Domain': STORE_DOMAIN,
      }
      if (token) outbound['X-User-Token'] = token

      try {
        const res = await fetch(`${BACKEND}${HISTORY_PATH}?${params}`, {
          headers: outbound,
          signal: AbortSignal.timeout(TIMEOUT_MS),
        })

        if (!res.ok) {
          // The guest lookup currently answers 401 "login required" on this
          // backend — it wants a user regardless of session_id. That is a
          // missing backend branch, not a client error, and history is a
          // convenience: degrade to "nothing stored" so the widget falls back
          // to the browser's own copy instead of showing the visitor an error.
          if (res.status === 401 || res.status === 403) {
            return empty(token ? 'Session expired.' : 'Guest history is not available.', headers)
          }

          console.error(`[chat] history returned ${res.status}`)
          return empty('History is temporarily unavailable.', headers)
        }

        const data = (await res.json()) as ChatHistoryResponse
        const conversations = Array.isArray(data?.conversations) ? data.conversations : []

        return Response.json(
          {
            ...(data?.user ? { user: data.user } : {}),
            count: typeof data?.count === 'number' ? data.count : conversations.length,
            conversations,
          } satisfies ChatHistoryResponse,
          { headers: { 'Cache-Control': 'private, no-store', ...headers } },
        )
      } catch (err) {
        console.error('[chat] history request failed:', err)
        return empty('History is temporarily unavailable.', headers)
      }
    },
    'light',
  )
}
