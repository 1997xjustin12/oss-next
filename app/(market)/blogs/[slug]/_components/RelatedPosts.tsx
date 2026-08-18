import { RELATED_COUNT } from '@/config/blog'
import { getRelatedPosts } from '@/services/blog.service'
import { BlogCard } from '../../_components/BlogCard'

// Own async component so it streams behind its own Suspense boundary — the
// article renders without waiting on this second fetch.
//
// Excluded by slug rather than id: the slug is what the route already has, so
// this needs nothing from the article fetch to start.
export async function RelatedPosts({ currentSlug }: { currentSlug: string }) {
  const posts = await getRelatedPosts(currentSlug, RELATED_COUNT)
  if (posts.length === 0) return null

  return (
    <section aria-labelledby="related-heading" className="mt-14 border-t border-theme-border pt-10 dark:border-neutral-800">
      <h2 id="related-heading" className="mb-6 text-2xl font-extrabold tracking-tight text-theme-dark dark:text-white">
        More articles
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  )
}

export function RelatedPostsSkeleton() {
  return (
    <div className="mt-14 border-t border-theme-border pt-10 dark:border-neutral-800" aria-hidden>
      <div className="mb-6 h-7 w-40 animate-pulse rounded bg-theme-subtle dark:bg-neutral-800" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg border border-theme-border dark:border-neutral-800">
            <div className="aspect-[16/9] animate-pulse bg-theme-subtle dark:bg-neutral-800" />
            <div className="space-y-3 p-5">
              <div className="h-4 w-full animate-pulse rounded bg-theme-subtle dark:bg-neutral-800" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-theme-subtle dark:bg-neutral-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
