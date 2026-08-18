import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getBlogs, getCachedBlogs } from '@/services/blog.service'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { ROUTES } from '@/config/routes'
import { PAGE_SEO_DEFAULTS } from '@/config/pageSeoDefaults'
import { resolvePageMetadata } from '@/lib/seo'
import { BlogCard } from './_components/BlogCard'
import { Pager } from './_components/Pager'
import { BlogSearch } from './_components/BlogSearch'
import { BlogListSkeleton } from './_components/BlogListSkeleton'

// Also the visible <h1> and intro copy below — one source, so the page heading
// can't drift from what the configurator shows as the default.
const { title: TITLE, description: DESCRIPTION } = PAGE_SEO_DEFAULTS[ROUTES.BLOGS]

// `per_page` is accepted as an alias for `page_size` so links and bookmarks
// built against the WordPress-era URLs keep resolving to the same page.
type Props = {
  searchParams: Promise<{
    page?: string
    page_size?: string
    per_page?: string
    search?: string
    category?: string
    ordering?: string
  }>
}

/**
 * Read the list for a set of URL params, taking the cached path unless there is
 * a search term.
 *
 * A search is never cached: the cache keys on its arguments, so one entry per
 * search term would fill up with single-use records.
 */
async function readBlogList(params: Awaited<Props['searchParams']>) {
  const query = {
    page: params.page,
    pageSize: params.page_size ?? params.per_page,
    category: params.category,
    ordering: params.ordering,
  }

  return params.search?.trim()
    ? getBlogs({ ...query, search: params.search })
    : getCachedBlogs(query)
}

// The title varies with the search term, so this page computes its own defaults
// rather than taking the static ones. An admin override still wins.
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  const { search } = params
  // A list page should carry its own title, not a post's. We borrow the newest
  // post's image purely so shares have a picture — one post is all that needs
  // fetching for it.
  const first = (await getCachedBlogs({ pageSize: 1 }).catch(() => null))?.posts[0]
  const title = search ? `Search: ${search} — ${TITLE}` : TITLE
  return resolvePageMetadata(ROUTES.BLOGS, {
    title,
    description: DESCRIPTION,
    canonical: ROUTES.BLOGS,
    openGraph: {
      title,
      description: DESCRIPTION,
      type: 'website',
      images: first?.imageUrl ? [{ url: first.imageUrl }] : undefined,
    },
  })
}

export default function BlogsPage({ searchParams }: Props) {
  // The (market) layout already provides the page's single <main> landmark, so
  // this is a <div>, not a nested <main>.
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <PageHeadScripts path={ROUTES.BLOGS} />
      <header className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-theme-dark sm:text-4xl dark:text-white">
            {TITLE}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-theme-muted dark:text-neutral-400">{DESCRIPTION}</p>
        </div>
        <Suspense fallback={<div className="h-11 w-full max-w-sm" />}>
          <SearchBox searchParams={searchParams} />
        </Suspense>
      </header>

      <Suspense fallback={<BlogListSkeleton />}>
        <BlogListContent searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

async function SearchBox({ searchParams }: Props) {
  const { search } = await searchParams
  return <BlogSearch initial={search ?? ''} />
}

async function BlogListContent({ searchParams }: Props) {
  const params = await searchParams
  const { search } = params
  const { posts, page, totalPages } = await readBlogList(params)

  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-theme-border py-20 text-center dark:border-neutral-700">
        <p className="text-lg font-bold text-theme-dark dark:text-neutral-100">
          {search ? `No articles found for “${search}”.` : 'No articles yet.'}
        </p>
        <p className="mt-1 text-sm text-theme-muted dark:text-neutral-400">
          {search ? 'Try a different search.' : 'Check back soon for new posts.'}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, i) => (
          <BlogCard key={post.id} post={post} priority={i === 0} />
        ))}
      </div>
      <Pager page={page} totalPages={totalPages} search={search} />
    </>
  )
}
