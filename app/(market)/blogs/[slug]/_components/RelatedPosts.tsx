import Image from 'next/image'
import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import { RELATED_COUNT } from '@/config/blog'
import { ROUTES } from '@/config/routes'
import { formatBlogDate } from '@/lib/blog'
import { getRelatedPosts } from '@/services/blog.service'

// Own async component so it streams behind its own Suspense boundary — the
// article renders without waiting on this second fetch.
//
// Excluded by slug rather than id: the slug is what the route already has, so
// this needs nothing from the article fetch to start.
//
// A compact list (thumbnail, title, date) rather than full cards: from `lg` up
// it is the article's second column, too narrow for a card grid, and below
// `lg` it follows the article in two columns — shorter than stacked cards.
export async function RelatedPosts({ currentSlug }: { currentSlug: string }) {
  const posts = await getRelatedPosts(currentSlug, RELATED_COUNT)
  if (posts.length === 0) return null

  return (
    <section aria-labelledby="related-heading">
      <h2 id="related-heading" className="mb-4 text-xl font-extrabold tracking-tight text-theme-dark dark:text-white">
        More Articles
      </h2>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
        {posts.map((post) => (
          <li key={post.id}>
            <Link
              href={ROUTES.BLOG(post.slug)}
              className="group flex items-start gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary"
            >
              <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-md bg-theme-subtle dark:bg-neutral-800">
                <Image
                  src={post.imageUrl}
                  // The title beside it names the link; repeating it as alt
                  // would make a screen reader read it twice.
                  alt=""
                  fill
                  sizes="112px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="min-w-0">
                <h3 className="line-clamp-3 text-sm font-bold leading-snug text-theme-dark group-hover:text-theme-primary dark:text-neutral-100 dark:group-hover:text-red-400">
                  {post.title}
                </h3>
                {post.date && (
                  <time dateTime={post.date} className="mt-1 block text-xs text-theme-muted dark:text-neutral-400">
                    {formatBlogDate(post.date)}
                  </time>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function RelatedPostsSkeleton() {
  return (
    <div aria-hidden>
      <div className="mb-4 h-7 w-40 animate-pulse rounded bg-theme-subtle dark:bg-neutral-800" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
        {Array.from({ length: RELATED_COUNT }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="aspect-video w-28 shrink-0 animate-pulse rounded-md bg-theme-subtle dark:bg-neutral-800" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-full animate-pulse rounded bg-theme-subtle dark:bg-neutral-800" />
              <div className="h-3.5 w-4/5 animate-pulse rounded bg-theme-subtle dark:bg-neutral-800" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-theme-subtle dark:bg-neutral-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
