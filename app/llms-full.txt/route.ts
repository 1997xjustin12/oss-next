import { buildLlmsFullTxt } from '@/services/llms.service'

/**
 * `/llms-full.txt` — the index from /llms.txt plus the full Markdown text of
 * the highest-value content pages, so a model can answer from one fetch.
 *
 * Larger and slower to build than /llms.txt (it converts each inlined page's
 * HTML), which is why both exist: a consumer that only needs the map should not
 * pay for the territory.
 */
export async function GET() {
  const body = await buildLlmsFullTxt()

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
