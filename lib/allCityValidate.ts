/**
 * Validation for the /all-city/ records the admin writes to Redis: the
 * template, each depot and each page (types/allCity.ts).
 *
 * Every read goes through here, so a malformed or out-of-date record can never
 * break or blank a page: each top-level field that fails falls back to the
 * seed (the imported page, the code template and depot table), and a bad item
 * in a list is dropped. The admin's save actions use the same validators, so
 * what is stored is what renders. Built on the GBP and location validators.
 *
 * Pure (no I/O); tested in tests/unit/allCityValidate.test.ts.
 */

import { bool, list, num, oneOf, shape, str, text, url, withSeed, youtubeId, type V } from '@/lib/gbpValidate'
import { href } from '@/lib/locationValidate'
import { cleanKeyphrase } from '@/lib/seoKeywords'
import { ALL_CITY_STATE_NAMES } from '@/lib/allCityPage'
import { ALL_CITY_DEPOTS } from '@/lib/data/allCityDepots'
import { ALL_CITY_TEMPLATE_DEFAULT } from '@/lib/data/allCityTemplate'
import { DELIVERED_IMAGE_HOSTS } from '@/lib/deliveredContainers'
import { LOCATION_PAGE_SLUGS } from '@/lib/data/locationPageSlugs'
import { DEPOT_FEATURED_SPECS, type DepotFeaturedKey } from '@/services/search.service'
import type { AllCityDepot, AllCityImage, AllCityPage, AllCitySeo, AllCityState, AllCityTemplate, AllCityTemplateText } from '@/types/allCity'

const isObj = (r: unknown): r is Record<string, unknown> => !!r && typeof r === 'object' && !Array.isArray(r)

export const ALL_CITY_STATES = Object.keys(ALL_CITY_STATE_NAMES) as AllCityState[]

/** A slug as WordPress made them: lower case, digits, hyphens. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
export const citySlug: V<string> = (r) => (typeof r === 'string' && SLUG_PATTERN.test(r.trim()) ? r.trim() : undefined)

/** An image next/image can load: a site path, or https on the CDN (next.config.ts remotePatterns). */
export const imageSrc: V<string> = (r) => {
  if (typeof r !== 'string') return undefined
  const value = r.trim()
  if (/^\/(?!\/)\S+$/.test(value)) return value
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'https:' && (DELIVERED_IMAGE_HOSTS as readonly string[]).includes(parsed.hostname) ? value : undefined
  } catch {
    return undefined
  }
}

const positive: V<number> = (r) => {
  const value = num(r)
  return value !== undefined && value > 0 ? Math.round(value) : undefined
}
const image = shape<AllCityImage>({ src: imageSrc, width: positive, height: positive })
const state: V<AllCityState> = oneOf(...ALL_CITY_STATES)
const depotKey: V<string> = (r) => (typeof r === 'string' && ALL_CITY_DEPOTS[r] ? r : undefined)
const spec: V<DepotFeaturedKey> = oneOf(...DEPOT_FEATURED_SPECS.map((s) => s.key))
const specs: V<DepotFeaturedKey[]> = (r) => {
  const value = list(spec)(r)
  return value?.length ? [...new Set(value)].slice(0, 4) : undefined
}

// ─── Template ────────────────────────────────────────────────────────────────

type Step = AllCityTemplateText['steps'][number]
const step = shape<Step>({ title: str, text: str })
const steps: V<Step[]> = (r) => {
  const value = list(step)(r)
  return value?.length ? value : undefined
}

/** One variant's wording: every field a string (blank allowed), steps a non-empty list; a bad field keeps the seed's. */
function templateText(raw: unknown, seed: AllCityTemplateText): AllCityTemplateText {
  const record = isObj(raw) ? raw : {}
  const out = structuredClone(seed) as Record<string, unknown>
  for (const [key, base] of Object.entries(seed)) {
    const value = record[key]
    if (Array.isArray(base)) {
      const valid = steps(value)
      if (valid) out[key] = valid
    } else if (typeof value === 'string') {
      out[key] = key === 'otherHref' ? (value.trim() ? (href(value) ?? base) : '') : value
    }
  }
  return out as AllCityTemplateText
}

export function conformAllCityTemplate(raw: unknown, seed: AllCityTemplate = ALL_CITY_TEMPLATE_DEFAULT): AllCityTemplate {
  const record = isObj(raw) ? raw : {}
  return withSeed<AllCityTemplate>(
    {
      city: (r) => (isObj(r) ? templateText(r, seed.city) : undefined),
      depotCity: (r) => (isObj(r) ? templateText(r, seed.depotCity) : undefined),
      media: (r) => (isObj(r) ? withSeed({ heroBackground: imageSrc, pinIcon: imageSrc, youtubeId: (v) => (v === '' ? '' : youtubeId(v)), videoTitle: text }, seed.media, r) : undefined),
      links: (r) => (isObj(r) ? withSeed({ quote: href, financing: href }, seed.links, r) : undefined),
    },
    seed,
    record,
  )
}

// ─── Depot ───────────────────────────────────────────────────────────────────

export function conformAllCityDepot(raw: unknown, seed: AllCityDepot): AllCityDepot {
  const out = withSeed<AllCityDepot>(
    {
      key: () => undefined, // fixed: the key the pages refer to
      depot: text,
      locationSlug: (r) => (typeof r === 'string' && LOCATION_PAGE_SLUGS.includes(r) ? r : undefined),
      state,
      banner: image,
      otherPricesHref: href,
      specs,
      depotCityBanner: (r) => (r === null ? null : image(r)) as AllCityImage | undefined,
      depotCitySpecs: (r) => (Array.isArray(r) && r.length === 0 ? [] : specs(r)),
    },
    seed,
    raw,
  )
  // "Use the city variant's" is stored as absent.
  if (!out.depotCityBanner) delete out.depotCityBanner
  if (!out.depotCitySpecs?.length) delete out.depotCitySpecs
  return out
}

// ─── Page ────────────────────────────────────────────────────────────────────

const keywords: V<string[]> = (r) => {
  const items = list(text)(r)
  return items ? [...new Set(items)].slice(0, 20) : undefined
}

function seo(raw: unknown, seed: AllCitySeo): AllCitySeo | undefined {
  if (!isObj(raw)) return undefined
  const out = withSeed<AllCitySeo>(
    {
      title: text,
      description: str,
      focusKeyphrase: (r) => (typeof r === 'string' ? cleanKeyphrase(r).slice(0, 120) : undefined),
      keywords,
      noindex: bool,
      canonical: (r) => (typeof r === 'string' ? (r.trim() ? url(r) : '') : undefined),
    },
    seed,
    raw,
  )
  out.description = out.description.trim()
  // Empty optional fields are stored as absent.
  if (!out.focusKeyphrase) delete out.focusKeyphrase
  if (!out.keywords?.length) delete out.keywords
  if (!out.noindex) delete out.noindex
  if (!out.canonical) delete out.canonical
  return out
}

/** A page's own wording: only the template's fields, only filled ones. */
export const textOverrides: V<Partial<AllCityTemplateText>> = (r) => {
  if (!isObj(r)) return undefined
  const out: Record<string, unknown> = {}
  for (const [key, base] of Object.entries(ALL_CITY_TEMPLATE_DEFAULT.city)) {
    const value = r[key]
    if (Array.isArray(base)) {
      const valid = steps(value)
      if (valid?.some((s) => s.title.trim() || s.text.trim())) out[key] = valid
    } else if (typeof value === 'string' && value.trim()) {
      out[key] = key === 'otherHref' ? href(value) : value
      if (out[key] === undefined) delete out[key]
    }
  }
  return out as Partial<AllCityTemplateText>
}

/**
 * A page as stored, every field validated against its seed (the imported
 * page, or for a page created in the admin, the record it was created with).
 * The slug never changes.
 */
export function conformAllCityPage(raw: unknown, seed: AllCityPage): AllCityPage {
  const out = withSeed<AllCityPage>(
    {
      slug: () => undefined,
      city: text,
      state,
      depotKey,
      variant: oneOf('city', 'depotCity'),
      h1: text,
      keywordHeading: str,
      seo: (r) => seo(r, seed.seo),
      lists: shape<AllCityPage['lists']>({ popular: bool, viewAll: bool }),
      hidden: bool,
      redirectTo: (r) => (r === '' ? '' : citySlug(r)),
      text: textOverrides,
    },
    seed,
    raw,
  )
  // Empty optional fields are stored as absent, so a page edited back to its seed is its seed.
  if (!out.keywordHeading?.trim()) delete out.keywordHeading
  if (!out.hidden) delete out.hidden
  if (!out.redirectTo || out.redirectTo === out.slug) delete out.redirectTo
  if (!out.text || !Object.keys(out.text).length) delete out.text
  return out
}
