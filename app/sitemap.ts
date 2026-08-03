import type { MetadataRoute } from 'next'
import { BASE_URL } from '@/lib/helpers'
import { fetchProductSitemap, fetchPageSitemap } from '@/services/sitemap.service'
import { getAllBlogSlugs } from '@/services/blog.service'
import { ROUTES } from '@/config/routes'

const origin = BASE_URL.replace(/\/$/, '')

// Content-page paths whose first segment belongs to a native route are dropped:
// the catch-all notFound()s them, so they'd 404. Mirrors NATIVE_ROUTE_PREFIXES
// in app/(market)/[...slug]/page.tsx, plus the already-listed static routes.
const NATIVE_FIRST_SEGMENTS = new Set([
  '', 'product', 'blogs', 'cart', 'checkout', 'wishlist', 'my-account', 'sale-shipping-containers',
])

function isNativePath(path: string): boolean {
  return NATIVE_FIRST_SEGMENTS.has(path.replace(/^\/+/, '').split('/')[0])
}

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
