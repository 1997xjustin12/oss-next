import type { MetadataRoute } from 'next'
import { BASE_URL } from '@/lib/helpers'
import { fetchProductSitemap, fetchPageSitemap } from '@/services/sitemap.service'
import { getAllBlogSlugs } from '@/services/blog.service'
import { GBP_ROUTE_SEGMENTS, ROUTES, isNativePath } from '@/config/routes'
import { LOCATION_PAGE_SLUGS } from '@/lib/data/locationPageSlugs'
import { WP_NOINDEX_PATHS, WP_REDIRECTS } from '@/config/wpHiddenPages'

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
    { url: `${origin}${ROUTES.RENT_TO_OWN}`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${origin}${ROUTES.REEFER}`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${origin}${ROUTES.CONTAINER_TYPES}`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${origin}${ROUTES.CONTAINER_CONDITIONS}`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${origin}${ROUTES.SPECIAL_PROMOTIONS}`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${origin}${ROUTES.WHY_ONSITE}`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${origin}${ROUTES.REFURBISHED_CONTAINERS}`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${origin}${ROUTES.CARGO_WORTHY_CONTAINERS}`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${origin}${ROUTES.CONTAINER_DIMENSIONS}`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${origin}${ROUTES.FAQS}`, changeFrequency: 'monthly', priority: 0.7 },
    // The two main landing pages: as high as the listing itself.
    { url: `${origin}${ROUTES.FOR_SALE}`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${origin}${ROUTES.RENTAL}`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${origin}${ROUTES.TAX_EXEMPTION}`, changeFrequency: 'monthly', priority: 0.5 },
    // The GBP location pages, for the same reason: they are native routes, so
    // `isNativePath` drops their backend rows below.
    ...GBP_ROUTE_SEGMENTS.map((slug): MetadataRoute.Sitemap[number] => ({
      url: `${origin}/${slug}`,
      changeFrequency: 'weekly',
      priority: 0.8,
    })),
    // The native location pages: `isNativePath` drops their backend rows too.
    ...LOCATION_PAGE_SLUGS.map((slug): MetadataRoute.Sitemap[number] => ({
      url: `${origin}${ROUTES.WHERE_TO_BUY}/${slug}`,
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

  // Pages WordPress keeps out of search (noindex, or redirected elsewhere).
  const hidden = new Set([...WP_NOINDEX_PATHS, ...WP_REDIRECTS.map(({ source }) => source)])

  const pageRoutes: MetadataRoute.Sitemap = pages
    .filter(({ path }) => path && !isNativePath(path) && !hidden.has(path.replace(/\/+$/, '')))
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
