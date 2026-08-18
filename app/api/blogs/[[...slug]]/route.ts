import { connection } from 'next/server'
import {
  BLOG_ORDERING,
  DEFAULT_ORDERING,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from '@/config/blog'
import { STORE_KEY } from '@/config/store'
import { agentError, agentJson, withRateLimit } from '@/lib/agentApi'
import { getBlog, getBlogs } from '@/services/blog.service'

/**
 * Public JSON API for the blog.
 *
 *   GET /api/blogs            — list, with ?category ?search ?page ?page_size ?ordering
 *   GET /api/blogs/{slug}     — one post, with its body
 *
 * One optional catch-all rather than two route files, because the two cases
 * differ only by whether a slug is present. Both delegate to the same service
 * the pages render from — which is what stops the listing page and its API
 * disagreeing about what "latest" means.
 *
 * `store` is never read from the query string. See services/blog.service.ts.
 */

type Params = { params: Promise<{ slug?: string[] }> }

export async function GET(request: Request, { params }: Params): Promise<Response> {
  // Reads the query string per request, so it cannot be prerendered. Under
  // cacheComponents this is `connection()` — `export const dynamic` is rejected.
  await connection()

  return withRateLimit(request, async (headers) => {
    const segments = (await params).slug ?? []

    if (segments.length > 1) {
      return agentError(
        'not_found',
        'Not found.',
        404,
        'Valid shapes are /api/blogs and /api/blogs/{slug}.',
        headers,
      )
    }

    if (segments.length === 1) {
      const post = await getBlog(segments[0])
      if (!post) {
        return agentError(
          'post_not_found',
          'Post not found.',
          404,
          'The slug does not exist. List available posts at /api/blogs.',
          headers,
        )
      }
      return agentJson({ store: STORE_KEY, post }, { cacheSeconds: 3600, extraHeaders: headers })
    }

    const url = new URL(request.url)
    const query = url.searchParams

    const { posts, count, page, pageSize, totalPages } = await getBlogs({
      page: query.get('page') ?? undefined,
      // Both spellings: `page_size` matches the backend, `pageSize` is what a
      // JavaScript caller reaches for first.
      pageSize: query.get('page_size') ?? query.get('pageSize') ?? undefined,
      ordering: query.get('ordering') ?? undefined,
      category: query.get('category') ?? undefined,
      search: query.get('search') ?? undefined,
    })

    return agentJson(
      {
        store: STORE_KEY,
        count,
        results: posts,
        page,
        pageSize,
        totalPages,
        // Deliberate: this tells an agent or third-party client what it is
        // allowed to ask for without needing our documentation.
        meta: {
          defaultPageSize: DEFAULT_PAGE_SIZE,
          maxPageSize: MAX_PAGE_SIZE,
          ordering: BLOG_ORDERING,
          defaultOrdering: DEFAULT_ORDERING,
        },
      },
      {
        // A search is not cached upstream, so it must not be cached at the edge
        // either — otherwise one visitor's search term is served to the next.
        cacheSeconds: query.get('search') ? 0 : 3600,
        extraHeaders: headers,
      },
    )
  })
}
