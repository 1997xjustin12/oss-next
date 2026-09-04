import { getRedisClient } from '@/lib/redis'
import { STORE_KEY } from '@/config/store'

/**
 * Agent-submitted quote requests.
 *
 * ## Where these go, and what is still missing
 *
 * This app has **no sales pipeline integration**. The homepage `QuoteForm` sets
 * local state and posts nowhere; there is no CRM client, no Zoho endpoint, no
 * lead table. So rather than invent an integration or drop the data, a request
 * is written to Redis and surfaced in the admin — durable, inspectable, and
 * obviously a staging area rather than a destination.
 *
 * **The remaining step is wiring `deliverQuoteRequest()` to the real sales
 * pipeline.** Until that happens these leads are only visible to someone who
 * opens the admin, which is not a process anyone should rely on. This is called
 * out in docs/audits/AGENTIC_READINESS.md rather than left to be discovered.
 *
 * Keys (namespaced per store, same convention as the other Redis writers):
 *
 *   oss-next:<store>:quotes            list  newest-first JSON records
 *   oss-next:<store>:quotecount:<day>  string  submissions per day, for the admin
 */

const KEY_PREFIX = 'oss-next'

/** Keep the most recent N in the list; older ones fall off. */
const MAX_STORED = 500

const RETENTION_SECONDS = 180 * 24 * 60 * 60

export type QuoteRequest = {
  /** Product the customer is asking about, when they named one. */
  handle?: string
  /** Delivery destination. The one field sales genuinely cannot proceed without. */
  zip: string
  quantity?: number
  name: string
  email: string
  phone?: string
  notes?: string
  /**
   * Which assistant submitted this, from the request's own claim.
   *
   * Unverified by definition — anything can put a string here. It is recorded
   * for triage, never for trust: the record is flagged agent-originated because
   * it arrived on this endpoint at all, not because of what this field says.
   */
  agentName?: string
}

/**
 * How a request reached us. Set by the server, never by the payload — an agent
 * that could name its own source could claim to be the web form.
 */
export type QuoteRequestSource = 'agent_api' | 'delivery_quote_form'

export type StoredQuoteRequest = QuoteRequest & {
  id: string
  receivedAt: string
  source: QuoteRequestSource
  /** Never shown to the submitter; for rate-limit forensics only. */
  clientId?: string
}

function quotesKey(): string {
  return `${KEY_PREFIX}:${STORE_KEY}:quotes`
}

function countKey(day: string): string {
  return `${KEY_PREFIX}:${STORE_KEY}:quotecount:${day}`
}

/**
 * Persist a quote request.
 *
 * Throws on failure — unlike the analytics writers, which swallow errors. A
 * lead that vanished because Redis blipped is a lost sale, so the endpoint must
 * be able to tell the caller it failed rather than returning a false success.
 */
export async function deliverQuoteRequest(
  request: QuoteRequest,
  clientId: string | undefined,
  now: Date = new Date(),
  source: QuoteRequestSource = 'agent_api',
): Promise<StoredQuoteRequest> {
  const stored: StoredQuoteRequest = {
    ...request,
    id: `q_${now.getTime().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    receivedAt: now.toISOString(),
    source,
    ...(clientId ? { clientId } : {}),
  }

  const redis = getRedisClient()
  const day = now.toISOString().slice(0, 10)

  await redis.lpush(quotesKey(), JSON.stringify(stored))
  // Best-effort trimming and counting — the lead itself is already safe, so a
  // failure here must not surface as a failed submission.
  await Promise.all([
    redis.ltrim(quotesKey(), 0, MAX_STORED - 1).catch(() => {}),
    redis.incr(countKey(day)).catch(() => {}),
    redis.expire(countKey(day), RETENTION_SECONDS).catch(() => {}),
  ])

  return stored
}

/** Newest-first, for the admin. Empty on any failure. */
export async function readQuoteRequests(limit = 50): Promise<StoredQuoteRequest[]> {
  try {
    const redis = getRedisClient()
    const rows = await redis.lrange<string | StoredQuoteRequest>(quotesKey(), 0, limit - 1)
    return rows
      .map((row) => {
        // Upstash deserialises JSON strings automatically in some SDK versions
        // and returns the raw string in others — handle both rather than
        // depending on which one is installed.
        if (typeof row !== 'string') return row
        try {
          return JSON.parse(row) as StoredQuoteRequest
        } catch {
          return null
        }
      })
      .filter((row): row is StoredQuoteRequest => Boolean(row))
  } catch {
    return []
  }
}
