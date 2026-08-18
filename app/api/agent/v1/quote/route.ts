import { connection } from 'next/server'
import { agentError, agentJson, checkRateLimit, rateLimitHeaders } from '@/lib/agentApi'
import { deliverQuoteRequest, type QuoteRequest } from '@/services/quote.service'
import { getProductByHandle } from '@/services/search.service'
import { lookupZipGeo } from '@/lib/zippopotam'
import { findNearestLocation } from '@/lib/locations'
import { SITE } from '@/config/site'

/**
 * POST /api/agent/v1/quote — an agent submits a quote request for a customer.
 *
 * **The only write in the agent API**, and scoped by decision D3: agents may
 * read everything and ask for a quote on a customer's behalf; they may not
 * place an order or pay. For a delivery-constrained product like a container,
 * a human closes the sale — the agent's job is to hand sales a qualified lead
 * with the destination already resolved.
 *
 * ## Why this is treated differently from the read endpoints
 *
 * A read endpoint that gets abused wastes cache. A write endpoint that gets
 * abused fills the sales team's queue with garbage, which is a people problem
 * rather than an infrastructure one. So:
 *
 *   - a much tighter rate limit than the read endpoints (5/min, not 60);
 *   - every field validated and length-capped before it is stored;
 *   - a honeypot field that must be empty;
 *   - the ZIP resolved server-side, so a lead can't arrive undeliverable;
 *   - `source: 'agent_api'` stamped on the record, so sales can see how it
 *     arrived and treat it accordingly.
 *
 * ## Not exposed as an MCP tool
 *
 * Deliberate. `/api/mcp` is unauthenticated because every tool there is
 * read-only; adding a tool that creates records would make an anonymous
 * endpoint a spam vector. If this is ever wanted over MCP, that endpoint needs
 * OAuth first.
 */

const MAX = { name: 120, email: 200, phone: 40, notes: 2000, zip: 20, agentName: 80 } as const

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function field(body: Record<string, unknown>, name: string): string | undefined {
  const value = body[name]
  if (value === undefined || value === null) return undefined
  const text = String(value).trim()
  return text || undefined
}

export async function POST(request: Request) {
  await connection()

  // Rate limited before anything else, and on a separate counter from the read
  // endpoints so a burst of searches can't consume a legitimate submission's
  // budget (or vice versa).
  const limit = await checkRateLimit(request, 'quote')
  const headers = rateLimitHeaders(limit)
  if (!limit.allowed) {
    return agentError(
      'rate_limited',
      `Quote submissions are limited to ${limit.limit} per minute.`,
      429,
      `Wait ${limit.resetSeconds} seconds. This is a low limit on purpose — each submission reaches a human.`,
      { ...headers, 'Retry-After': String(limit.resetSeconds) },
    )
  }

  let body: Record<string, unknown>
  try {
    const parsed = await request.json()
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('not an object')
    body = parsed as Record<string, unknown>
  } catch {
    return agentError('invalid_body', 'Request body must be a JSON object.', 400, undefined, headers)
  }

  // Honeypot. A real agent following the schema never sends this; naive spam
  // that fills every field it finds does. Answer 200 so a bot learns nothing
  // from the response, but store nothing.
  if (field(body, 'website')) {
    return agentJson({ received: true, id: 'discarded' }, { status: 200, extraHeaders: headers })
  }

  // ── Required fields ───────────────────────────────────────────────────────
  const name = field(body, 'name')
  const email = field(body, 'email')
  const zip = field(body, 'zip')

  const missing = [
    !name && 'name',
    !email && 'email',
    !zip && 'zip',
  ].filter(Boolean)

  if (missing.length) {
    return agentError(
      'missing_fields',
      `Missing required field(s): ${missing.join(', ')}.`,
      400,
      'name, email and zip are required. Ask the customer for anything you do not have — do not invent it.',
      headers,
    )
  }

  if (!EMAIL.test(email!)) {
    return agentError('invalid_email', 'The email address is not valid.', 400, 'Use the customer\'s real address.', headers)
  }

  for (const [key, max] of Object.entries(MAX)) {
    const value = field(body, key)
    if (value && value.length > max) {
      return agentError('field_too_long', `\`${key}\` exceeds ${max} characters.`, 400, undefined, headers)
    }
  }

  // ── Resolve the destination before accepting ──────────────────────────────
  // A lead sales can't deliver to is worse than no lead. Rejecting here also
  // gives the agent a chance to correct the ZIP while it still has the customer.
  const geo = await lookupZipGeo(zip!)
  if (!geo) {
    return agentError(
      'unknown_zip',
      `Could not resolve "${zip}" to a serviceable location.`,
      400,
      'Only the USA and Canada are served. Confirm the ZIP or postal code with the customer.',
      headers,
    )
  }
  const depot = findNearestLocation(geo.latitude, geo.longitude)

  // ── Validate the product, when one was named ──────────────────────────────
  const handle = field(body, 'handle')
  if (handle) {
    const product = await getProductByHandle(handle).catch(() => null)
    if (!product) {
      return agentError(
        'unknown_handle',
        `No product with handle "${handle}".`,
        400,
        'Handles come from /api/agent/v1/search. Omit `handle` if the customer has not chosen a product.',
        headers,
      )
    }
  }

  const quantityRaw = body.quantity
  const quantity = quantityRaw === undefined || quantityRaw === null ? undefined : Math.trunc(Number(quantityRaw))
  if (quantity !== undefined && (!Number.isFinite(quantity) || quantity < 1 || quantity > 100)) {
    return agentError('invalid_quantity', 'quantity must be between 1 and 100.', 400, undefined, headers)
  }

  const quote: QuoteRequest = {
    ...(handle ? { handle } : {}),
    zip: zip!,
    ...(quantity !== undefined ? { quantity } : {}),
    name: name!,
    email: email!,
    ...(field(body, 'phone') ? { phone: field(body, 'phone') } : {}),
    ...(field(body, 'notes') ? { notes: field(body, 'notes') } : {}),
    ...(field(body, 'agentName') ? { agentName: field(body, 'agentName') } : {}),
  }

  try {
    const stored = await deliverQuoteRequest(
      quote,
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined,
    )

    return agentJson(
      {
        received: true,
        id: stored.id,
        receivedAt: stored.receivedAt,
        destination: { zip: quote.zip, city: geo.city, state: geo.state, country: geo.countryCode },
        ...(depot ? { nearestDepot: depot.title } : {}),
        nextStep: `A member of the ${SITE.name} sales team will follow up by email, typically within one business day. Give the customer ${SITE.telephoneDisplay} if they need an answer sooner.`,
        // An agent must not imply a price was agreed. Nothing here is a quote.
        note: 'This is a request for a quote, not a quote. No price has been agreed and nothing has been ordered or reserved.',
      },
      { status: 201, cacheSeconds: 0, extraHeaders: { ...headers, 'Cache-Control': 'no-store' } },
    )
  } catch (err) {
    console.error('[agent-api] quote submission failed:', err)
    return agentError(
      'submission_failed',
      'The quote request could not be recorded.',
      503,
      `Do NOT tell the customer it was submitted. Ask them to call ${SITE.telephoneDisplay} instead.`,
      headers,
    )
  }
}

/** GET is a common mistake on a submit endpoint — answer it usefully. */
export async function GET() {
  return agentError(
    'method_not_allowed',
    'Use POST to submit a quote request.',
    405,
    'See /openapi.json for the request body schema.',
  )
}
