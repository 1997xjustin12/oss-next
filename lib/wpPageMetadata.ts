import { WP_NOINDEX_PATHS } from '@/config/wpHiddenPages'
import { fetchWpPage } from '@/services/wp-pages.service'
import type { Metadata } from 'next'

/**
 * A converted WordPress page's <head>, from its backend record. Shared by the
 * catch-all and the location route (components/wp/WordPressPage.tsx).
 */
export async function wordPressPageMetadata(slug: string[]): Promise<Metadata> {
  const page = await fetchWpPage(slug)
  if (!page) return { title: 'Not Found' }

  return {
    // seo_title is the title WordPress already serves for this page, brand
    // suffix included ("Privacy Policy | On-Site Storage Solutions"). The root
    // layout's "%s | On-Site Storage Solutions" template would append a second
    // one, so it's marked absolute to reproduce the live page exactly. The bare
    // `title` fallback is unbranded, so that one does want the template.
    title: page.seo_title ? { absolute: page.seo_title } : page.title,
    description: page.seo_description ?? undefined,
    alternates: page.canonical_url ? { canonical: page.canonical_url } : undefined,
    // Kept out of search on WordPress; the backend doesn't carry that yet.
    ...(WP_NOINDEX_PATHS.includes(`/${slug.join('/')}`) ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title: page.og_title || page.seo_title || page.title,
      description: page.og_description || page.seo_description || undefined,
      images: page.og_image ? [{ url: page.og_image }] : undefined,
    },
  }
}
