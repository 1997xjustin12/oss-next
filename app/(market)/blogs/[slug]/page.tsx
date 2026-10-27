import { Suspense } from 'react'
import Image from 'next/image'
import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllBlogSlugs, getCachedBlog } from '@/services/blog.service'
import { JsonLd } from '@/components/shared/JsonLd'
import { ROUTES } from '@/config/routes'
import { SITE, absoluteUrl } from '@/config/site'
import { blogPostingNode, breadcrumbNode, graph, siteNodes } from '@/lib/schema'
import { formatBlogDate } from '@/lib/blog'
import { ArticleBody } from './_components/ArticleBody'
import { RelatedPosts, RelatedPostsSkeleton } from './_components/RelatedPosts'

type Props = {
  params: Promise<{ slug: string }>
}

// A link prefetch loads this route's App Shell (shared by every page of the
// route) rather than one page's whole payload; the content follows on click.
export const prefetch = 'partial'

/**
 * The most recent posts are built at deploy time; older ones are cached whole
 * after their first request. At least one entry is required, hence the
 * placeholder (a 404) when the list cannot be read during the build.
 */
export async function generateStaticParams() {
  const recent = (await getAllBlogSlugs()).slice(0, 20).map(({ slug }) => ({ slug }))
  return recent.length ? recent : [{ slug: '__placeholder__' }]
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
  const ogImageAlt = seo.ogImageAlt || post.imageAlt
  // The backend may pin a canonical (e.g. a post syndicated from elsewhere);
  // our own URL is the fallback, not an override.
  const canonical = seo.canonicalUrl || absoluteUrl(ROUTES.BLOG(post.slug))

  return {
    // Absolute: the editor writes the whole SEO title in the backend, so the
    // site-wide " | On-Site Storage Solutions" template is not appended to it.
    title: { absolute: title },
    description,
    keywords: seo.keywords,
    publisher: SITE.name,
    authors: post.author ? [{ name: post.author }] : undefined,
    alternates: { canonical },
    openGraph: {
      title: seo.ogTitle || title,
      description: seo.ogDescription || description,
      // What a share preview identifies the page by. Without it a scraper
      // follows the canonical, so the two must agree.
      url: canonical,
      siteName: SITE.name,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.updatedAt || undefined,
      authors: post.author ? [post.author] : undefined,
      images: ogImage ? [{ url: ogImage, alt: ogImageAlt }] : undefined,
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
  // The page's own background and text colour, in both schemes. The site's
  // body stays light in dark mode, so the dark: text classes below used to put
  // white headings on a white page.
  return (
    <div className="page-fill bg-theme-bg text-theme-dark dark:bg-neutral-950 dark:text-neutral-200">
      <Suspense fallback={<ArticleSkeleton />}>
        <ArticleContent params={params} />
      </Suspense>
    </div>
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
      dateModified: post.updatedAt || undefined,
      author: post.author || undefined,
      keywords: post.seo.keywords,
    }),
    breadcrumbNode([
      { name: 'Home', path: ROUTES.HOME },
      { name: 'Blog', path: ROUTES.BLOGS },
      { name: post.title },
    ]),
  ])

  return (
    // <div>, not <main> — the (market) layout owns the single <main> landmark.
    // px-[5%], the container every other page and the navbar use.
    <div className="px-[5%] py-10 sm:py-14">
      <JsonLd data={jsonLd} />

      <nav aria-label="Breadcrumb" className="mb-6 text-sm">
        <Link href={ROUTES.BLOGS} className="font-semibold text-theme-primary underline underline-offset-2 hover:decoration-2 dark:text-red-400">
          ← Back to Blog
        </Link>
      </nav>

      <div className={ARTICLE_GRID}>
        <article className="min-w-0">
          <header className="mb-6">
            {post.date && (
              <time dateTime={post.date} className="text-xs font-semibold uppercase tracking-wider text-theme-muted dark:text-neutral-400">
                {formatBlogDate(post.date)}
              </time>
            )}
            <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-theme-dark sm:text-4xl dark:text-white">
              {post.title}
            </h1>
          </header>

          <div className="relative mb-8 aspect-video overflow-hidden rounded-lg bg-theme-subtle dark:bg-neutral-800">
            <Image
              src={post.imageUrl}
              alt={post.imageAlt}
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 66vw"
              className="object-cover"
            />
          </div>

          <ArticleBody html={post.contentHtml} />
        </article>

        <aside aria-label="More articles" className={SIDEBAR}>
          {/* Sticky in the two-column layout, so the list stays in view through
              a long article; below the navbar, which is sticky itself. */}
          <div className="lg:sticky lg:top-28">
            <Suspense fallback={<RelatedPostsSkeleton />}>
              <RelatedPosts currentSlug={post.slug} />
            </Suspense>
          </div>
        </aside>
      </div>
    </div>
  )
}


/**
 * The article and its "More Articles" column. Side by side from `lg`, the
 * related list stacked under the article below that. The article column is
 * `minmax(0, 1fr)` so wide content in the CMS markup (a table, a long URL)
 * scrolls inside it instead of pushing the sidebar off the page.
 */
const ARTICLE_GRID =
  'grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-16'

/** Separates the sidebar from the article: a rule above it when stacked, beside it in two columns. */
const SIDEBAR =
  'border-t border-theme-border pt-8 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0 xl:pl-10 dark:border-neutral-800'

function ArticleSkeleton() {
  return (
    <div className="px-[5%] py-10 sm:py-14" aria-hidden>
      <div className="mb-6 h-4 w-28 animate-pulse rounded bg-theme-subtle dark:bg-neutral-800" />
      <div className={ARTICLE_GRID}>
        <div className="min-w-0">
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
        <div className={SIDEBAR}>
          <RelatedPostsSkeleton />
        </div>
      </div>
    </div>
  )
}
