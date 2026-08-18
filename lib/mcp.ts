/**
 * Minimal Model Context Protocol server — JSON-RPC layer.
 *
 * Implements the **Streamable HTTP** transport (spec revision 2025-06-18) for a
 * *stateless, read-only* server. That combination is a much smaller surface
 * than MCP in general, and it is the reason this is hand-written rather than
 * built on `@modelcontextprotocol/sdk`:
 *
 *   - The SDK's `StreamableHTTPServerTransport` is written against Node's
 *     `IncomingMessage`/`ServerResponse`. A Next.js route handler receives a
 *     Web `Request` and returns a Web `Response`, so using it means shimming
 *     one interface onto the other — more moving parts than the protocol we
 *     actually need.
 *   - Statelessness removes most of the spec: no sessions, no `Mcp-Session-Id`,
 *     no SSE streams, no resumability, no server-initiated messages.
 *
 * What the spec requires of us, and where each is handled:
 *
 *   POST carrying a JSON-RPC request      -> one `application/json` response (§ Sending Messages, 5)
 *   POST carrying only a notification     -> 202 Accepted, empty body        (§ Sending Messages, 4)
 *   GET (no SSE stream offered)           -> 405 Method Not Allowed          (§ Listening, 3)
 *   DELETE (no sessions to end)           -> 405 Method Not Allowed          (§ Session Management, 5)
 *   `Origin` header                       -> validated                       (§ Security Warning, 1)
 *   `MCP-Protocol-Version` header         -> unsupported value is a 400      (§ Protocol Version Header)
 *
 * The route handler in app/api/mcp/route.ts owns the HTTP side; this module
 * owns the JSON-RPC side and the tool registry.
 */

// ─── Protocol versions ───────────────────────────────────────────────────────

/** Newest first. The head is what we advertise when we can't honour a request. */
export const SUPPORTED_PROTOCOL_VERSIONS = ['2025-06-18', '2025-03-26', '2024-11-05'] as const

export const LATEST_PROTOCOL_VERSION = SUPPORTED_PROTOCOL_VERSIONS[0]

/**
 * Spec: "if the server does not receive an `MCP-Protocol-Version` header ...
 * the server SHOULD assume protocol version 2025-03-26."
 */
export const ASSUMED_PROTOCOL_VERSION = '2025-03-26'

export function isSupportedProtocolVersion(version: string): boolean {
  return (SUPPORTED_PROTOCOL_VERSIONS as readonly string[]).includes(version)
}

// ─── JSON-RPC 2.0 ────────────────────────────────────────────────────────────

export type JsonRpcId = string | number

export type JsonRpcMessage = {
  jsonrpc?: unknown
  id?: unknown
  method?: unknown
  params?: unknown
  result?: unknown
  error?: unknown
}

/** JSON-RPC 2.0 reserved error codes, plus the ones MCP leans on. */
export const RPC = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
} as const

export function rpcResult(id: JsonRpcId, result: unknown) {
  return { jsonrpc: '2.0' as const, id, result }
}

export function rpcError(id: JsonRpcId | null, code: number, message: string, data?: unknown) {
  return { jsonrpc: '2.0' as const, id, error: { code, message, ...(data !== undefined ? { data } : {}) } }
}

/**
 * A message carrying `method` is a request when it also has an `id`, and a
 * notification when it doesn't. Anything with `result`/`error` is a response to
 * something we sent — which, for a server that never sends requests, means the
 * client is confused; we still 202 it rather than erroring, per the spec.
 */
export function isRequest(message: JsonRpcMessage): message is JsonRpcMessage & { method: string; id: JsonRpcId } {
  return typeof message.method === 'string' && message.id !== undefined && message.id !== null
}

export function isNotification(message: JsonRpcMessage): boolean {
  return typeof message.method === 'string' && (message.id === undefined || message.id === null)
}

// ─── Tools ───────────────────────────────────────────────────────────────────

/** MCP content block. Only text is needed here — no images or embedded resources. */
export type McpContent = { type: 'text'; text: string }

export type McpToolResult = {
  content: McpContent[]
  /**
   * Structured payload alongside the text. The spec asks that a tool returning
   * structured content ALSO serialise it into a text block, because not every
   * client reads `structuredContent` — `toolResult()` does both.
   */
  structuredContent?: Record<string, unknown>
  /**
   * Tool *execution* failure — a well-formed result the model can read and
   * react to. Distinct from a JSON-RPC error, which means the call itself was
   * malformed (unknown tool, bad arguments) and never ran.
   */
  isError?: boolean
}

export type McpTool = {
  name: string
  /** Human-readable label for client UIs. */
  title: string
  /**
   * Read by a model deciding *whether to call this*. Says what the tool is for,
   * and — as important — when not to reach for it.
   */
  description: string
  inputSchema: Record<string, unknown>
  /** Behavioural hints. Every tool here is read-only and side-effect free. */
  annotations?: Record<string, unknown>
  handler: (args: Record<string, unknown>) => Promise<McpToolResult>
}

/** Text + structured content in the shape the spec prefers. */
export function toolResult(data: Record<string, unknown>): McpToolResult {
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    structuredContent: data,
  }
}

/** An execution failure the model should see and can act on. */
export function toolError(message: string, hint?: string): McpToolResult {
  return {
    content: [{ type: 'text', text: hint ? `${message}\n\n${hint}` : message }],
    isError: true,
  }
}

// ─── Argument helpers ────────────────────────────────────────────────────────
//
// Arguments arrive as untrusted JSON. Coerce rather than trust: a model may
// send a number where the schema says string, or omit an optional entirely.

export function argString(args: Record<string, unknown>, name: string): string | undefined {
  const value = args[name]
  if (value === undefined || value === null) return undefined
  const text = String(value).trim()
  return text || undefined
}

export function argInt(
  args: Record<string, unknown>,
  name: string,
  fallback: number,
  min: number,
  max: number,
): number {
  const value = args[name]
  if (value === undefined || value === null) return fallback
  const n = Math.trunc(Number(value))
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, n))
}
