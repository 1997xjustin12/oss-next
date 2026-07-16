import type { MetadataRoute } from 'next'
import { BASE_URL } from '@/lib/helpers'

const origin = BASE_URL.replace(/\/$/, '')

// Disallowed paths are private/dynamic and already carry per-page
// `robots: { index: false }` metadata (my-account) or have no SEO value at
// all (cart, checkout) — listed here too so crawlers don't waste budget on
// them in the first place.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/my-account', '/cart', '/checkout'],
    },
    sitemap: `${origin}/sitemap.xml`,
  }
}
