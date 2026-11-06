import { Suspense } from 'react'
import Image from 'next/image'
import { ArticleBody } from '@/components/blog/ArticleBody'
import { BlogFaq } from '@/components/blog/BlogFaq'
import { RelatedPosts, RelatedPostsSkeleton } from '@/components/blog/RelatedPosts'
import { NewsletterForm } from '@/components/shared/NewsletterForm'
import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import { JsonLd } from '@/components/shared/JsonLd'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { PAGE_SEO_DEFAULTS } from '@/config/pageSeoDefaults'
import { ROUTES } from '@/config/routes'
import { absoluteUrl } from '@/config/site'
import { formatBlogDate } from '@/lib/blog'
import { CONTAINER_DIMENSIONS_ARTICLE, CONTAINER_DIMENSIONS_FAQS } from '@/lib/data/containerDimensionsContent'
import { blogPostingNode, breadcrumbNode, faqNode, graph, siteNodes } from '@/lib/schema'
import { resolvePageMetadata } from '@/lib/seo'

export function generateMetadata() {
  return resolvePageMetadata(ROUTES.CONTAINER_DIMENSIONS)
}

/**
 * Shipping container dimensions: a WordPress blog post at the site root, kept at
 * its URL as a fixed article because it never reached the backend. Laid out as
 * the blog's articles are (app/(market)/blogs/[slug]), from the copy in
 * lib/data/containerDimensionsContent.ts. Static, Server Components only.
 *
 * WordPress's sidebar (search, recent-post lists) becomes the blog's own "More
 * Articles" column, and its newsletter band the shared NewsletterForm.
 */
export default function ContainerDimensionsPage() {
  const { title, author, datePublished, dateModified, hero, html } = CONTAINER_DIMENSIONS_ARTICLE
  const url = absoluteUrl(ROUTES.CONTAINER_DIMENSIONS)

  // The blog's node, at this page's own URL rather than /blogs/<slug>.
  const article = {
    ...blogPostingNode({
      title,
      slug: 'shipping-container-dimensions',
      description: PAGE_SEO_DEFAULTS[ROUTES.CONTAINER_DIMENSIONS]?.description,
      imageUrl: hero.src,
      datePublished,
      dateModified,
      author,
    }),
    '@id': `${url}#article`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  }
  const jsonLd = graph([
    ...siteNodes(),
    article,
    faqNode(CONTAINER_DIMENSIONS_FAQS),
    breadcrumbNode([{ name: 'Home', path: ROUTES.HOME }, { name: 'Blog', path: ROUTES.BLOGS }, { name: title }]),
  ])

  // The (market) layout provides <main>.
  return (
    <div className="page-fill bg-theme-bg text-theme-dark dark:bg-neutral-950 dark:text-neutral-200">
      <JsonLd data={jsonLd} />
      <PageHeadScripts path={ROUTES.CONTAINER_DIMENSIONS} />

      <div className="px-[5%] py-10 sm:py-14">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm">
          <Link href={ROUTES.BLOGS} className="font-semibold text-theme-primary underline underline-offset-2 hover:decoration-2 dark:text-red-400">
            ← Back to Blog
          </Link>
        </nav>

        <div className={ARTICLE_GRID}>
        <article className="min-w-0">
          <header className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-theme-muted dark:text-neutral-400">
              <time dateTime={datePublished}>{formatBlogDate(datePublished)}</time>
              <span aria-hidden> · </span>
              By {author}
            </p>
            {/* Brand red in both schemes: 3.09:1 on the dark background, which
                passes only as large bold text (keep it text-3xl font-bold). */}
            <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-theme-primary sm:text-4xl">{title}</h1>
          </header>

          <div className="relative mb-8 aspect-video overflow-hidden rounded-lg bg-theme-subtle dark:bg-neutral-800">
            <Image src={hero.src} alt={hero.alt} fill preload fetchPriority="high" sizes="(max-width: 1024px) 90vw, 66vw" className="object-cover" />
          </div>

          <div className="overflow-x-auto">
            <ArticleBody html={html} />
          </div>
          <BlogFaq faqs={CONTAINER_DIMENSIONS_FAQS} />
        </article>

        {/* The blog's "More Articles" column, as on every article. */}
        <aside aria-label="More articles" className={SIDEBAR}>
          <Suspense fallback={<RelatedPostsSkeleton />}>
            <RelatedPosts currentSlug="shipping-container-dimensions" />
          </Suspense>
        </aside>
        </div>
      </div>

      <section aria-labelledby="dimensions-newsletter" className="bg-theme-primary px-[5%] py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <h2 id="dimensions-newsletter" className="text-center text-2xl font-extrabold uppercase leading-tight text-white sm:text-3xl">
            Subscribe to our newsletter to receive the latest news and exclusive offers
          </h2>
          <div className="mt-8">
            <NewsletterForm tone="dark" />
          </div>
        </div>
      </section>
    </div>
  )
}

/** The blog article's grid and column (app/(market)/blogs/[slug]/page.tsx). */
const ARTICLE_GRID =
  'grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-16'

const SIDEBAR =
  'border-t border-theme-border pt-8 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0 xl:pl-10 dark:border-neutral-800'
