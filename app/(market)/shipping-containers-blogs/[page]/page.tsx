import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { WP_BLOG_LIST_PAGE_COUNT } from '@/lib/data/wpBlogListPageCount'
import { parseWpBlogListPage } from '@/services/wpBlogList.service'
import { WpBlogListPage, wpBlogListMetadata } from '../_components/WpBlogListPage'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ page: string }>
}

/**
 * /shipping-containers-blogs/2 … /N: the numbered pages of WordPress's blog
 * listing, which the backend never converted. All built at deploy time. Any
 * other path under /shipping-containers-blogs gets the proxy's real 404:
 * config/routes.ts claims only these exact paths.
 */
export function generateStaticParams() {
  return Array.from({ length: WP_BLOG_LIST_PAGE_COUNT - 1 }, (_, i) => ({ page: String(i + 2) }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = parseWpBlogListPage((await params).page)
  if (page === null) return { title: 'Not Found' }
  return wpBlogListMetadata(page)
}

async function Content({ params }: Props) {
  const page = parseWpBlogListPage((await params).page)
  if (page === null) notFound()
  return <WpBlogListPage page={page} />
}

/** `params` is request-time data, so under cacheComponents it sits behind a Suspense boundary. */
export default function Page(props: Props) {
  return (
    <Suspense fallback={<div className="min-h-screen animate-pulse bg-gray-100" />}>
      <Content {...props} />
    </Suspense>
  )
}
