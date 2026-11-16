import { notFound } from 'next/navigation'
import { WordPressPageView } from '@/components/wp/WordPressPage'
import { ROUTES } from '@/config/routes'
import { absoluteUrl } from '@/config/site'
import { WP_BLOG_LIST_PAGE_COUNT } from '@/lib/data/wpBlogListPageCount'
import { wordPressPageMetadata } from '@/lib/wpPageMetadata'
import { getWpBlogListPage, WP_BLOG_LIST_SLUG } from '@/services/wpBlogList.service'
import type { Metadata } from 'next'

/** One page of WordPress's blog listing (services/wpBlogList.service.ts). */
export async function WpBlogListPage({ page }: { page: number }) {
  const content = await getWpBlogListPage(page)
  if (!content) notFound()
  return <WordPressPageView page={content} slug={WP_BLOG_LIST_SLUG} path={ROUTES.WP_BLOG_LIST_PAGE(page)} />
}

/**
 * Page 1's own head, as the catch-all served it. A numbered page says which
 * page it is, and is its own canonical: each lists different posts, so
 * pointing them all at page 1 would tell search engines to drop the posts
 * only they link to.
 */
export async function wpBlogListMetadata(page: number): Promise<Metadata> {
  const base = await wordPressPageMetadata(WP_BLOG_LIST_SLUG)
  // The backend's record for the page has no canonical_url.
  if (page <= 1) return { ...base, alternates: { canonical: absoluteUrl(ROUTES.WP_BLOG_LIST) } }

  const suffix = ` – Page ${page} of ${WP_BLOG_LIST_PAGE_COUNT}`
  const title =
    typeof base.title === 'object' && base.title && 'absolute' in base.title
      ? { absolute: `${base.title.absolute}${suffix}` }
      : `${base.title ?? 'Shipping Container Blogs'}${suffix}`
  const url = absoluteUrl(ROUTES.WP_BLOG_LIST_PAGE(page))
  return {
    ...base,
    title,
    alternates: { canonical: url },
    openGraph: { ...base.openGraph, url },
  }
}
