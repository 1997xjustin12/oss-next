import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
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
// Small cards: full-width image, date, title, a three-line excerpt and a
// "Read more" button. One column as the article's sidebar from `lg`, two
// columns under the article from `sm`, one on a phone.
//
// The whole card is the link; "Read more" is a span styled as a button inside
// it, not a <button>. A button inside an anchor is invalid markup, and two
// controls per card would mean two tab stops to the same place.
export async function RelatedPosts({ currentSlug }: { currentSlug: string }) {
  const posts = await getRelatedPosts(currentSlug, RELATED_COUNT)
  if (posts.length === 0) return null

  return (
    <section aria-labelledby="related-heading">
      <h2 id="related-heading" className="mb-4 text-xl font-extrabold tracking-tight text-theme-dark dark:text-white">
        More Articles
      </h2>
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-1">
        {posts.map((post) => (
          <li key={post.id} className="flex">
            <Link
              href={ROUTES.BLOG(post.slug)}
              className="group flex w-full flex-col overflow-hidden rounded-lg border border-theme-border bg-theme-bg transition-shadow
                         hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary
                         dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-theme-subtle dark:bg-neutral-800">
                <Image
                  src={post.imageUrl}
                  // The title below names the link; repeating it as alt would
                  // make a screen reader read it twice.
                  alt=""
                  fill
                  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 360px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-4">
                {post.date && (
                  <time dateTime={post.date} className="text-xs font-semibold uppercase tracking-wider text-theme-muted dark:text-neutral-400">
                    {formatBlogDate(post.date)}
                  </time>
                )}
                <h3 className="mt-1.5 line-clamp-2 text-base font-extrabold leading-snug text-theme-dark group-hover:text-theme-primary dark:text-neutral-100 dark:group-hover:text-red-400">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="mt-2 line-clamp-3 text-sm text-theme-muted dark:text-neutral-400">{post.excerpt}</p>
                )}
                {/* `mt-auto` keeps the buttons on one line across cards whose
                    excerpts differ in length; `pt-4` is the space above it. */}
                <div className="mt-auto pt-4">
                  <span
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-md bg-theme-primary px-4 text-sm font-bold text-white
                               transition-colors group-hover:bg-theme-primary-dark"
                  >
                    Read more
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </span>
                </div>
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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-1">
        {Array.from({ length: RELATED_COUNT }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg border border-theme-border dark:border-neutral-800">
            <div className="aspect-video w-full animate-pulse bg-theme-subtle dark:bg-neutral-800" />
            <div className="space-y-2.5 p-4">
              <div className="h-3 w-1/3 animate-pulse rounded bg-theme-subtle dark:bg-neutral-800" />
              <div className="h-4 w-full animate-pulse rounded bg-theme-subtle dark:bg-neutral-800" />
              <div className="h-3.5 w-full animate-pulse rounded bg-theme-subtle dark:bg-neutral-800" />
              <div className="h-3.5 w-5/6 animate-pulse rounded bg-theme-subtle dark:bg-neutral-800" />
              <div className="!mt-4 h-10 w-32 animate-pulse rounded-md bg-theme-subtle dark:bg-neutral-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
