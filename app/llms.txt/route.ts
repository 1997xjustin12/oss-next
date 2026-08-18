import { buildLlmsTxt } from '@/services/llms.service'

/**
 * `/llms.txt` — the curated Markdown index of this site, for models.
 *
 * A directory in the same spirit as robots.txt: short, hand-shaped, and
 * pointing at the things worth reading. The content and its curation rules live
 * in services/llms.service.ts.
 *
 * `text/plain` rather than `text/markdown` — the convention, and it means the
 * file renders in a browser instead of downloading, which is what makes it
 * checkable by a human.
 */
export async function GET() {
  const body = await buildLlmsTxt()

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
