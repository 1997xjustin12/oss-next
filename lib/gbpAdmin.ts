/**
 * The GBP admin screens' form models, shared by the client editors and the
 * Server Actions (actions/gbp.ts) so the two can't disagree about which
 * fields a screen owns or how the SEO form maps to the stored record.
 *
 * Pure: no I/O. Reference: docs/reference/gbp-subdomain-pages.md ("Admin configurators").
 */

import { GBP_LISTING_NAME, GBP_OPENING_HOURS } from '@/lib/gbpDefaults'
import { bool, oneOf, shape, text, url } from '@/lib/gbpValidate'
import type { GbpListing, GbpPage } from '@/types/gbp'
import type { HeadScript, PageSeo } from '@/types/seo'

/** The location fields the content screen edits. */
export const GBP_CONTENT_KEYS = ['location', 'contact', 'headings', 'about', 'blogCards', 'faqs', 'mapEmbedUrl', 'youtubeId'] as const
/** The location fields the SEO screen edits (with the page's PageSeo). */
export const GBP_SEO_PAGE_KEYS = ['geo', 'areaServed', 'seo', 'listing'] as const

export type GbpContentModel = Pick<GbpPage, (typeof GBP_CONTENT_KEYS)[number]>
export type GbpSeoPageModel = Required<Pick<GbpPage, (typeof GBP_SEO_PAGE_KEYS)[number]>>

export function pickKeys<T extends object, K extends keyof T>(value: T, keys: readonly K[]): Pick<T, K> {
  return Object.fromEntries(keys.map((key) => [key, value[key]])) as Pick<T, K>
}

/** The listing with its defaults filled in, so every field has something to edit. */
export function listingWithDefaults(listing: GbpListing | undefined): Required<GbpListing> {
  return {
    name: listing?.name ?? GBP_LISTING_NAME,
    openingHours: listing?.openingHours?.length ? listing.openingHours : GBP_OPENING_HOURS,
    extraJsonLd: listing?.extraJsonLd ?? [],
  }
}

// ─── The page's PageSeo, as the SEO screen edits it ──────────────────────────

export type GbpRobotsChoice = 'default' | 'index,follow' | 'index,nofollow' | 'noindex,follow' | 'noindex,nofollow'

export type GbpSeoForm = {
  title: string
  description: string
  agentSummary: string
  /** Comma-separated. */
  keywords: string
  canonical: string
  robots: GbpRobotsChoice
  ogTitle: string
  ogDescription: string
  ogImage: string
  scripts: HeadScript[]
}

export function toSeoForm(seo: PageSeo | null): GbpSeoForm {
  const robots: GbpRobotsChoice = seo?.robots
    ? (`${seo.robots.index ? 'index' : 'noindex'},${seo.robots.follow ? 'follow' : 'nofollow'}` as GbpRobotsChoice)
    : 'default'
  return {
    title: seo?.title ?? '',
    description: seo?.description ?? '',
    agentSummary: seo?.agentSummary ?? '',
    keywords: seo?.keywords?.join(', ') ?? '',
    canonical: seo?.canonical ?? '',
    robots,
    ogTitle: seo?.openGraph?.title ?? '',
    ogDescription: seo?.openGraph?.description ?? '',
    ogImage: seo?.openGraph?.image ?? '',
    scripts: seo?.scripts ?? [],
  }
}

const script = shape<HeadScript>(
  { id: text, name: text, src: url, code: text, strategy: oneOf('afterInteractive', 'lazyOnload'), enabled: bool },
  ['src', 'code'],
)

/**
 * The form back to a PageSeo: blanks dropped (blank = "use the default"),
 * scripts need a src or code. Returns the names of fields it had to reject.
 */
export function fromSeoForm(form: GbpSeoForm): { seo: PageSeo; rejected: string[] } {
  const rejected: string[] = []
  const opt = (value: string) => value.trim() || undefined
  const canonical = opt(form.canonical)
  if (canonical && !url(canonical)) rejected.push('canonical')
  const ogImage = opt(form.ogImage)
  if (ogImage && !url(ogImage)) rejected.push('ogImage')

  const scripts: HeadScript[] = []
  form.scripts.forEach((row, i) => {
    const src = row.src?.trim()
    const code = row.code?.trim()
    if (!src && !code) return
    const value = script({
      id: row.id?.trim() || crypto.randomUUID(),
      name: row.name?.trim() || 'Untitled script',
      ...(src ? { src } : { code }),
      strategy: row.strategy,
      enabled: row.enabled,
    })
    if (value) scripts.push(value)
    else rejected.push(`scripts.${i}`)
  })

  const keywords = form.keywords.split(',').map((k) => k.trim()).filter(Boolean)
  const openGraph = { title: opt(form.ogTitle), description: opt(form.ogDescription), image: ogImage }
  const robots =
    form.robots === 'default'
      ? undefined
      : { index: form.robots.startsWith('index'), follow: form.robots.endsWith(',follow') }

  return {
    seo: {
      title: opt(form.title),
      description: opt(form.description),
      agentSummary: opt(form.agentSummary),
      ...(keywords.length ? { keywords } : {}),
      canonical,
      ...(robots ? { robots } : {}),
      ...(Object.values(openGraph).some(Boolean) ? { openGraph } : {}),
      ...(scripts.length ? { scripts } : {}),
      updatedAt: new Date().toISOString(),
    },
    rejected,
  }
}
