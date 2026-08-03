import type { MetadataRoute } from 'next'
import { BASE_URL } from '@/lib/helpers'
import { fetchProductSitemap } from '@/services/sitemap.service'
import { getAllBlogSlugs } from '@/services/blog.service'
import { ROUTES } from '@/config/routes'

const origin = BASE_URL.replace(/\/$/, '')

// Static in-scope routes + every real product's PDP, per docs/audits/AUDIT_REQUIREMENTS.md.
// Everything else (my-account, cart, checkout, and all WordPress-proxied
// pages) is intentionally excluded — see app/robots.ts for the matching
// disallow rules.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, blogPosts] = await Promise.all([fetchProductSitemap(), getAllBlogSlugs()])

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

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map(({ slug, modified }) => ({
    url: `${origin}/blogs/${slug}`,
    lastModified: modified ? new Date(modified) : undefined,
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  return [...staticRoutes, ...productRoutes, ...blogRoutes]
}
