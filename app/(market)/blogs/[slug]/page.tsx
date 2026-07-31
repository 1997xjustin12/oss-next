import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { fetchBlogPost } from '@/services/blog.service'
import { JsonLd } from '@/components/shared/JsonLd'
import { ROUTES } from '@/config/routes'
import { BASE_URL } from '@/lib/helpers'
import { formatBlogDate } from '@/lib/blog'
import { ArticleBody } from './_components/ArticleBody'
import { RelatedPosts, RelatedPostsSkeleton } from './_components/RelatedPosts'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await fetchBlogPost(slug)
  if (!post) return { title: 'Article Not Found' }

  const { seo } = post
  const title = seo.title || post.title
  const description = seo.description || post.excerpt || undefined
  const ogImage = seo.ogImage || post.imageUrl

  return {
    title,
    description,
    alternates: { canonical: ROUTES.BLOG(post.slug) },
    openGraph: {
      title: seo.ogTitle || title,
      description: seo.ogDescription || description,
      type: 'article',
      publishedTime: post.date,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.twitterTitle || title,
      description: seo.twitterDescription || description,
      images: seo.twitterImage ? [seo.twitterImage] : ogImage ? [ogImage] : undefined,
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

async function ArticleContent({ params }: Props) {
  const { slug } = await params
  const post = await fetchBlogPost(slug)
  if (!post) notFound()

  const canonical = `${BASE_URL.replace(/\/$/, '')}${ROUTES.BLOG(post.slug)}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    image: post.imageUrl ? [post.imageUrl] : undefined,
    datePublished: post.date,
    description: post.seo.description || post.excerpt || undefined,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    author: { '@type': 'Organization', name: 'On-Site Storage Solutions' },
    publisher: { '@type': 'Organization', name: 'On-Site Storage Solutions' },
  }

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
        <RelatedPosts currentId={post.id} />
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
      <div className="mb-8 aspect-[16/9] animate-pulse rounded-lg bg-theme-subtle dark:bg-neutral-800" />
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-4 w-full animate-pulse rounded bg-theme-subtle dark:bg-neutral-800" />
        ))}
      </div>
    </div>
  )
}
