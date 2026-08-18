import { buildOpenApiSpec } from '@/config/openapi'

/**
 * GET /openapi.json — the machine-readable description of the agent API.
 *
 * At the site root rather than under /api, because that is where tools look for
 * it and it describes the whole API rather than being part of it.
 *
 * Advertised from /llms.txt and from the root layout, so an agent can find the
 * API without being told it exists.
 */
export function GET() {
  return new Response(JSON.stringify(buildOpenApiSpec(), null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
