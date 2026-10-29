import type { MetadataRoute } from 'next'
import { BASE_URL } from '@/lib/helpers'
import { fetchProductSitemap, fetchPageSitemap } from '@/services/sitemap.service'
import { getAllBlogSlugs } from '@/services/blog.service'
import { GBP_ROUTE_SEGMENTS, ROUTES, isNativePath } from '@/config/routes'

const origin = BASE_URL.replace(/\/$/, '')

// Content-page paths whose first segment belongs to a native route are dropped:
// the catch-all notFound()s them, so they'd 404. `isNativePath` is shared with
// that catch-all (config/routes.ts) so the two can no longer disagree — this
// file previously kept its own copy of the list, and it had already drifted.

// Static in-scope routes + every real product's PDP, per docs/audits/AUDIT_REQUIREMENTS.md.
// Everything else (my-account, cart, checkout, and all WordPress-proxied
// pages) is intentionally excluded — see app/robots.ts for the matching
// disallow rules.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, pages, blogPosts] = await Promise.all([
    fetchProductSitemap(),
    fetchPageSitemap(),
    getAllBlogSlugs(),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: origin, changeFrequency: 'daily', priority: 1 },
    { url: `${origin}/sale-shipping-containers`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${origin}/sale-shipping-containers?ptype=accessories`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${origin}/blogs`, changeFrequency: 'daily', priority: 0.7 },
    // Listed here because it stopped being listed below: this app owns the
    // depot index as of 2026-10-13, so `isNativePath` now drops WordPress's
    // copy of it from `pageRoutes`. Without this line the page would be in
    // neither list. The cities beneath it are not exact-matched, so they stay
    // in `pageRoutes` where they belong.
    { url: `${origin}${ROUTES.WHERE_TO_BUY}`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${origin}${ROUTES.ACCESSORY_PRODUCTS}`, changeFrequency: 'weekly', priority: 0.7 },
    // The GBP location pages, for the same reason: they are native routes, so
    // `isNativePath` drops their backend rows below.
    ...GBP_ROUTE_SEGMENTS.map((slug): MetadataRoute.Sitemap[number] => ({
      url: `${origin}/${slug}`,
      changeFrequency: 'weekly',
      priority: 0.8,
    })),
  ]

  // The backend's product pattern is multi-brand ({brand_slug}/product/{handle});
  // this app serves products at /product/{handle}, so build from `handle` via our
  // own route (falling back to an explicit `path` if the backend ever sets one).
  const productRoutes: MetadataRoute.Sitemap = products.map(({ handle, path, lastmod }) => ({
    url: `${origin}${path ?? ROUTES.PRODUCT(handle)}`,
    lastModified: lastmod ? new Date(lastmod) : undefined,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  const pageRoutes: MetadataRoute.Sitemap = pages
    .filter(({ path }) => path && !isNativePath(path))
    .map(({ path, lastmod }) => ({
      url: `${origin}${path}`,
      lastModified: lastmod ? new Date(lastmod) : undefined,
      changeFrequency: 'monthly',
      priority: 0.5,
    }))

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map(({ slug, modified }) => ({
    url: `${origin}/blogs/${slug}`,
    lastModified: modified ? new Date(modified) : undefined,
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  return [...staticRoutes, ...productRoutes, ...pageRoutes, ...blogRoutes]
}
