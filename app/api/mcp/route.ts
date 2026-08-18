import { connection } from 'next/server'
import { recordMcpToolCall } from '@/lib/agentLog'
import { withRateLimit } from '@/lib/agentApi'
import { SITE } from '@/config/site'
import {
  ASSUMED_PROTOCOL_VERSION,
  LATEST_PROTOCOL_VERSION,
  RPC,
  SUPPORTED_PROTOCOL_VERSIONS,
  isNotification,
  isRequest,
  isSupportedProtocolVersion,
  rpcError,
  rpcResult,
  type JsonRpcId,
  type JsonRpcMessage,
} from '@/lib/mcp'
import { MCP_TOOLS, MCP_TOOLS_BY_NAME } from '@/services/mcpTools.service'

/**
 * Remote MCP endpoint — Streamable HTTP transport, stateless.
 *
 *   POST /api/mcp    JSON-RPC in, one JSON-RPC response out
 *   GET  /api/mcp    405 — this server never initiates messages, so it offers
 *                    no SSE stream (the spec explicitly allows 405 here)
 *   DELETE           405 — there are no sessions to terminate
 *
 * Connect from Claude or ChatGPT by adding this URL as a custom connector; see
 * xml.md for the instructions we publish.
 *
 * ## Auth posture (T5.3)
 *
 * **None.** Every tool is read-only and returns data that is already public on
 * the storefront, in `/llms.txt`, and in the Merchant feed — the same decision
 * recorded as D2 for the agent API. Requests are rate-limited on the shared
 * Upstash counter so a runaway client can't hammer Elasticsearch.
 *
 * **If a write tool is ever added here — the quote submission in Phase 6 is the
 * obvious candidate — this endpoint needs OAuth first.** An unauthenticated
 * endpoint that can create records is a spam vector, and the fact that the read
 * tools need no auth is not an argument that a write tool wouldn't.
 */

const SERVER_INFO = {
  name: 'onsite-storage',
  title: `${SITE.name} — catalog and delivery`,
  version: '1.0.0',
} as const

const INSTRUCTIONS = [
  `Tools for ${SITE.name}, a shipping container retailer serving the USA and Canada.`,
  '',
  'Containers are delivered by truck from a depot network, so availability depends on the customer location, not just the catalog. For any question involving a place, call `check_delivery` — `search_containers` does not know where the customer is.',
  '',
  'Prices: roughly 8,000 of the ~10,000 products are rental or rent-to-own and are priced PER MONTH. Every price carries a `basis` field and a plain-English `description`. Quote the description, never the bare amount.',
].join('\n')

/** CORS + the protocol version, on every response. */
function baseHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, MCP-Protocol-Version, Mcp-Session-Id, Authorization',
    'Access-Control-Expose-Headers': 'MCP-Protocol-Version',
    'MCP-Protocol-Version': LATEST_PROTOCOL_VERSION,
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...baseHeaders() },
  })
}

/**
 * DNS-rebinding guard (spec § Security Warning).
 *
 * The attack it names is a webpage resolving a hostname to 127.0.0.1 to reach
 * an MCP server bound to loopback. This server is public and read-only, so the
 * realistic blast radius is nil — but the check is cheap and the spec is a MUST,
 * so: reject a browser Origin that is itself a loopback or private address, and
 * allow everything else, including a missing Origin (non-browser clients such
 * as Claude and ChatGPT connectors send none). Blocking all cross-origin
 * requests instead would lock out legitimate browser-based MCP clients for no
 * security gain on public data.
 */
function originRejected(request: Request): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return false
  try {
    const host = new URL(origin).hostname.toLowerCase()
    return (
      host === 'localhost' ||
      host === '::1' ||
      /^127\./.test(host) ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host)
    )
  } catch {
    return true // unparseable Origin — not something a real browser sends
  }
}

/**
 * Spec: absent header means assume 2025-03-26; an unsupported value is a 400.
 * Returns an error message when the request must be rejected.
 */
function protocolVersionError(request: Request): string | null {
  const header = request.headers.get('mcp-protocol-version')
  if (!header) return null // assumed = ASSUMED_PROTOCOL_VERSION
  if (isSupportedProtocolVersion(header)) return null
  return `Unsupported MCP-Protocol-Version "${header}". Supported: ${SUPPORTED_PROTOCOL_VERSIONS.join(', ')}.`
}

// ─── JSON-RPC method dispatch ────────────────────────────────────────────────

async function handleRequest(method: string, params: Record<string, unknown>, id: JsonRpcId) {
  switch (method) {
    case 'initialize': {
      // Version negotiation: echo the client's version when we support it,
      // otherwise answer with our latest and let the client decide.
      const requested = typeof params.protocolVersion === 'string' ? params.protocolVersion : ASSUMED_PROTOCOL_VERSION
      const agreed = isSupportedProtocolVersion(requested) ? requested : LATEST_PROTOCOL_VERSION

      return rpcResult(id, {
        protocolVersion: agreed,
        // `tools` only — no prompts, resources, logging or completions here.
        // `listChanged: false` because the tool list is static in the build.
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions: INSTRUCTIONS,
      })
    }

    case 'ping':
      // Spec: an empty result object.
      return rpcResult(id, {})

    case 'tools/list':
      // Four tools — well under any page size, so no `nextCursor`.
      return rpcResult(id, {
        tools: MCP_TOOLS.map(({ name, title, description, inputSchema, annotations }) => ({
          name,
          title,
          description,
          inputSchema,
          ...(annotations ? { annotations } : {}),
        })),
      })

    case 'tools/call': {
      const name = typeof params.name === 'string' ? params.name : ''
      const tool = MCP_TOOLS_BY_NAME.get(name)

      // Unknown tool is a *protocol* error — the call was malformed and never
      // ran. A tool that ran and failed returns isError instead.
      if (!tool) {
        return rpcError(id, RPC.INVALID_PARAMS, `Unknown tool: ${name || '(missing name)'}`, {
          available: MCP_TOOLS.map((t) => t.name),
        })
      }

      const args =
        params.arguments && typeof params.arguments === 'object' && !Array.isArray(params.arguments)
          ? (params.arguments as Record<string, unknown>)
          : {}

      try {
        const result = await tool.handler(args)
        await recordMcpToolCall(name, Boolean(result.isError))
        return rpcResult(id, result)
      } catch (err) {
        // An unexpected throw is still a tool execution failure, not a
        // protocol error — return it as a readable result so the model can
        // react rather than seeing the transport break.
        console.error(`[mcp] tool ${name} threw:`, err)
        await recordMcpToolCall(name, true)
        return rpcResult(id, {
          content: [{ type: 'text', text: `The ${name} tool failed unexpectedly. Retry shortly.` }],
          isError: true,
        })
      }
    }

    default:
      return rpcError(id, RPC.METHOD_NOT_FOUND, `Method not found: ${method}`)
  }
}

// ─── HTTP ────────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  await connection()

  if (originRejected(request)) {
    return json(rpcError(null, RPC.INVALID_REQUEST, 'Origin not allowed.'), 403)
  }

  const versionError = protocolVersionError(request)
  if (versionError) {
    return json(rpcError(null, RPC.INVALID_REQUEST, versionError), 400)
  }

  return withRateLimit(request, async () => {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return json(rpcError(null, RPC.PARSE_ERROR, 'Invalid JSON.'), 400)
    }

    // The spec's Streamable HTTP transport says the POST body is a SINGLE
    // message, but JSON-RPC batching exists in the wild — accept an array and
    // answer with an array so a batching client isn't silently broken.
    const messages: JsonRpcMessage[] = Array.isArray(body) ? (body as JsonRpcMessage[]) : [body as JsonRpcMessage]

    if (messages.length === 0) {
      return json(rpcError(null, RPC.INVALID_REQUEST, 'Empty batch.'), 400)
    }

    const responses = []
    for (const message of messages) {
      if (!message || typeof message !== 'object') {
        responses.push(rpcError(null, RPC.INVALID_REQUEST, 'Message must be an object.'))
        continue
      }

      if (isRequest(message)) {
        const params =
          message.params && typeof message.params === 'object' && !Array.isArray(message.params)
            ? (message.params as Record<string, unknown>)
            : {}
        responses.push(await handleRequest(message.method, params, message.id))
        continue
      }

      // Notifications (notifications/initialized, notifications/cancelled) and
      // stray responses produce nothing — see the 202 below.
      if (isNotification(message) || message.result !== undefined || message.error !== undefined) continue

      responses.push(rpcError(null, RPC.INVALID_REQUEST, 'Message is neither a request nor a notification.'))
    }

    // Spec § Sending Messages (4): a POST carrying only notifications and/or
    // responses MUST get 202 Accepted with no body. Returning `{}` here instead
    // makes strict clients treat the notification as a failed request.
    if (responses.length === 0) {
      return new Response(null, { status: 202, headers: baseHeaders() })
    }

    return json(Array.isArray(body) ? responses : responses[0])
  })
}

/**
 * Spec § Listening for Messages (3): a server that does not offer an SSE stream
 * at this endpoint MUST return 405 here. This server is stateless and never
 * initiates messages, so there is nothing to stream.
 */
export async function GET() {
  return json(
    rpcError(null, RPC.METHOD_NOT_FOUND, 'This MCP endpoint is stateless and does not offer an SSE stream. Use POST.'),
    405,
  )
}

/** No sessions exist, so there is none to terminate. The spec allows 405. */
export async function DELETE() {
  return json(rpcError(null, RPC.METHOD_NOT_FOUND, 'This MCP endpoint is stateless; there is no session to delete.'), 405)
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: baseHeaders() })
}
