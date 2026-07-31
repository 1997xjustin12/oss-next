import type { MetadataRoute } from 'next'
import { BASE_URL } from '@/lib/helpers'
import { getAllProductHandles } from '@/services/search.service'
import { getAllBlogSlugs } from '@/services/blog.service'

const origin = BASE_URL.replace(/\/$/, '')

// Static in-scope routes + every real product's PDP, per docs/audits/AUDIT_REQUIREMENTS.md.
// Everything else (my-account, cart, checkout, and all WordPress-proxied
// pages) is intentionally excluded — see app/robots.ts for the matching
// disallow rules.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, blogPosts] = await Promise.all([getAllProductHandles(), getAllBlogSlugs()])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: origin, changeFrequency: 'daily', priority: 1 },
    { url: `${origin}/sale-shipping-containers`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${origin}/sale-shipping-containers?ptype=accessories`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${origin}/blogs`, changeFrequency: 'daily', priority: 0.7 },
  ]

  const productRoutes: MetadataRoute.Sitemap = products.map(({ handle, updatedAt }) => ({
    url: `${origin}/product/${handle}`,
    lastModified: updatedAt ? new Date(updatedAt) : undefined,
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
