import Image from 'next/image'
import Link from 'next/link'
import { ROUTES } from '@/config/routes'
import { formatBlogDate } from '@/lib/blog'
import type { BlogSummary } from '@/types/blog'

type Props = {
  post: BlogSummary
  // The first card is the likely LCP on the list page.
  priority?: boolean
}

export function BlogCard({ post, priority }: Props) {
  return (
    <article className="group overflow-hidden rounded-lg border border-theme-border bg-theme-bg transition-shadow hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
      <Link href={ROUTES.BLOG(post.slug)} className="block">
        <div className="relative aspect-[16/9] overflow-hidden bg-theme-subtle dark:bg-neutral-800">
          <Image
            src={post.imageUrl}
            alt={post.imageAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-5">
          {post.date && (
            <time dateTime={post.date} className="text-xs font-semibold uppercase tracking-wider text-theme-muted dark:text-neutral-500">
              {formatBlogDate(post.date)}
            </time>
          )}
          <h2 className="mt-2 line-clamp-2 text-lg font-extrabold leading-snug tracking-tight text-theme-dark group-hover:text-theme-primary dark:text-neutral-100 dark:group-hover:text-red-400">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="mt-2 line-clamp-3 text-sm text-theme-muted dark:text-neutral-400">
              {post.excerpt}
            </p>
          )}
          <span className="mt-3 inline-block text-sm font-bold text-theme-primary dark:text-red-400">
            Read more →
          </span>
        </div>
      </Link>
    </article>
  )
}
