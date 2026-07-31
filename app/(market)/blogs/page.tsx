import { Suspense } from 'react'
import type { Metadata } from 'next'
import { fetchBlogList } from '@/services/blog.service'
import { ROUTES } from '@/config/routes'
import { BlogCard } from './_components/BlogCard'
import { Pager } from './_components/Pager'
import { BlogSearch } from './_components/BlogSearch'
import { BlogListSkeleton } from './_components/BlogListSkeleton'

const TITLE = 'Blog'
const DESCRIPTION =
  'Guides, tips, and updates on shipping containers, storage, and delivery from On-Site Storage Solutions.'

type Props = {
  searchParams: Promise<{ page?: string; search?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { search } = await searchParams
  // A list page should carry its own title, not a post's. We borrow the first
  // post's OG image (via the list fetch) purely so shares have a picture.
  const first = (await fetchBlogList(1, search).catch(() => null))?.posts[0]
  const title = search ? `Search: ${search} — ${TITLE}` : TITLE
  return {
    title,
    description: DESCRIPTION,
    alternates: { canonical: ROUTES.BLOGS },
    openGraph: {
      title,
      description: DESCRIPTION,
      type: 'website',
      images: first?.imageUrl ? [{ url: first.imageUrl }] : undefined,
    },
  }
}

export default function BlogsPage({ searchParams }: Props) {
  // The (market) layout already provides the page's single <main> landmark, so
  // this is a <div>, not a nested <main>.
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
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
  const { page: pageParam, search } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const { posts, totalPages } = await fetchBlogList(page, search)

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
