import { getPageMarkdown } from '@/services/pageMarkdown.service'

/**
 * Markdown view of any page. Never linked directly — proxy.ts rewrites both
 * `/{path}.md` and `Accept: text/markdown` requests here, so the public surface
 * stays on the canonical paths and this stays an implementation detail.
 *
 * `text/markdown` for real: this endpoint is only ever reached by something that
 * asked for Markdown, so there is no browser-rendering argument for `text/plain`
 * the way there is on /llms.txt.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug?: string[] }> },
) {
  // Optional catch-all: `/api/md` (no segments) is the homepage.
  const { slug } = await params
  const page = await getPageMarkdown(slug ?? [])

  if (!page) {
    return new Response('Not Found\n', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    })
  }

  return new Response(page.markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      // Points a consumer that landed here at the page's real URL, the same way
      // the HTML view's <link rel="canonical"> does.
      Link: `<${page.canonical}>; rel="canonical"`,
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
