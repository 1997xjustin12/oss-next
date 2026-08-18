import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getCachedBlog } from '@/services/blog.service'
import { JsonLd } from '@/components/shared/JsonLd'
import { ROUTES } from '@/config/routes'
import { blogPostingNode, breadcrumbNode, graph, siteNodes } from '@/lib/schema'
import { formatBlogDate } from '@/lib/blog'
import { ArticleBody } from './_components/ArticleBody'
import { RelatedPosts, RelatedPostsSkeleton } from './_components/RelatedPosts'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getCachedBlog(slug)
  if (!post) return { title: 'Article Not Found' }

  // The post carries its own `seo` object, so none of this has to be dug out of
  // the body markup. Each field falls back to the post's own equivalent.
  const { seo } = post
  const title = seo.title || post.title
  const description = seo.description || post.excerpt || undefined
  const ogImage = seo.ogImage?.trim() || post.imageUrl

  return {
    title,
    description,
    // The backend may pin a canonical (e.g. a post syndicated from elsewhere);
    // our own URL is the fallback, not an override.
    alternates: { canonical: seo.canonicalUrl || ROUTES.BLOG(post.slug) },
    openGraph: {
      title: seo.ogTitle || title,
      description: seo.ogDescription || description,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.updatedAt || undefined,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      // The backend's seo object has no Twitter-specific fields, so the
      // OpenGraph values carry over — which is what Twitter falls back to
      // anyway when the card tags are absent.
      title: seo.ogTitle || title,
      description: seo.ogDescription || description,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}

export default function BlogPostPage({ params }: Props) {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <ArticleContent params={params} />
    </Suspense>
  )
}

/**
 * A missing or foreign slug calls notFound() here — but by the time this runs
 * the Suspense boundary above has already flushed the status line, so this
 * alone would answer 200 with not-found markup. The real 404 status comes from
 * proxy.ts, which checks the slug before anything renders (see
 * lib/blogSlugs.ts); resolving the post above the boundary instead is not an
 * option, because cacheComponents rejects a route that blocks its whole shell
 * on a per-request fetch. Both layers are needed: the proxy check fails open,
 * and this is what catches the cases it lets through.
 */
async function ArticleContent({ params }: Props) {
  const { slug } = await params
  const post = await getCachedBlog(slug)
  if (!post) notFound()

  const jsonLd = graph([
    ...siteNodes(),
    blogPostingNode({
      title: post.title,
      slug: post.slug,
      description: post.seo.description || post.excerpt || undefined,
      imageUrl: post.imageUrl,
      datePublished: post.date,
    }),
    breadcrumbNode([
      { name: 'Home', path: ROUTES.HOME },
      { name: 'Blog', path: ROUTES.BLOGS },
      { name: post.title },
    ]),
  ])

  return (
    // <div>, not <main> — the (market) layout owns the single <main> landmark.
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <JsonLd data={jsonLd} />

      <nav aria-label="Breadcrumb" className="mb-6 text-sm">
        <Link href={ROUTES.BLOGS} className="font-semibold text-theme-primary hover:underline dark:text-red-400">
          ← Back to Blog
        </Link>
      </nav>

      <article>
        <header className="mb-6">
          {post.date && (
            <time dateTime={post.date} className="text-xs font-semibold uppercase tracking-wider text-theme-muted dark:text-neutral-500">
              {formatBlogDate(post.date)}
            </time>
          )}
          <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-theme-dark sm:text-4xl dark:text-white">
            {post.title}
          </h1>
        </header>

        <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-lg bg-theme-subtle dark:bg-neutral-800">
          <Image
            src={post.imageUrl}
            alt={post.imageAlt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>

        <ArticleBody html={post.contentHtml} />
      </article>

      <Suspense fallback={<RelatedPostsSkeleton />}>
        <RelatedPosts currentSlug={post.slug} />
      </Suspense>
    </div>
  )
}


function ArticleSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14" aria-hidden>
      <div className="mb-6 h-4 w-28 animate-pulse rounded bg-theme-subtle dark:bg-neutral-800" />
      <div className="mb-2 h-3 w-32 animate-pulse rounded bg-theme-subtle dark:bg-neutral-800" />
      <div className="mb-3 h-9 w-full animate-pulse rounded bg-theme-subtle dark:bg-neutral-800" />
      <div className="mb-8 h-9 w-3/4 animate-pulse rounded bg-theme-subtle dark:bg-neutral-800" />
      <div className="mb-8 aspect-video animate-pulse rounded-lg bg-theme-subtle dark:bg-neutral-800" />
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-4 w-full animate-pulse rounded bg-theme-subtle dark:bg-neutral-800" />
        ))}
      </div>
    </div>
  )
}
