import type { Metadata } from 'next'
import { GBP_HEAD } from '@/lib/data/gbpShared'
import { gbpPath } from '@/lib/gbp'
import { resolvePageMetadata } from '@/lib/seo'
import type { GbpPage } from '@/types/gbp'

/**
 * A GBP page's <head>, carrying over what the WordPress page declares
 * (docs/reference/gbp-subdomain-pages.md, "<head> and SEO").
 *
 * Through resolvePageMetadata, so the admin Page Configurator can still
 * override title, description, canonical and image. Separate from lib/gbp.ts
 * because lib/seo reads the SEO registry, which reads lib/gbp.
 */
export async function gbpMetadata(page: GbpPage): Promise<Metadata> {
  const base = await resolvePageMetadata(gbpPath(page))
  const { seo } = page

  return {
    ...base,
    // WordPress's title is the whole title; the site's "| On-Site Storage
    // Solutions" template would change it.
    title: { absolute: String(base.title) },
    openGraph: {
      ...base.openGraph,
      siteName: GBP_HEAD.siteName,
      locale: 'en_US',
      ...(seo.ogType === 'article' && seo.modifiedTime ? { type: 'article', modifiedTime: seo.modifiedTime } : {}),
    },
    // WordPress emits these on every page; the app has none of its own.
    verification: { google: [...GBP_HEAD.googleSiteVerification] },
    other: { 'article:publisher': GBP_HEAD.facebookPublisher },
  }
}
