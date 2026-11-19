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
import type { OfferFeatureIcon, OfferTab } from '@/lib/data/homeOfferTabs'
import { LOCATION_PAGE_SLUGS } from '@/lib/data/locationPageSlugs'
import { DEPOT_FEATURED_SPECS, type DepotFeaturedKey } from '@/services/search.service'
import type { AllCityDepot, AllCityImage, AllCityPage, AllCitySections, AllCitySeo, AllCityState, AllCityTemplate, AllCityTemplateText } from '@/types/allCity'

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
      out[key] = value
    }
  }
  return out as AllCityTemplateText
}

/** Most figures a section's list may hold (the hero's stats). */
const MAX_SECTION_ITEMS = 6

/**
 * A section's wording, shaped as its seed: every string field a string (blank
 * allowed), every on/off a boolean, every number a number, every group checked the same way, a list's items shaped as the
 * seed's first (a bad item dropped, at most MAX_SECTION_ITEMS). A field that
 * is missing or the wrong type keeps the seed's, so a template saved before a
 * section existed gets the section's defaults.
 */
function sectionText<T>(raw: unknown, seed: T): T {
  if (typeof seed === 'string') return (typeof raw === 'string' ? raw : seed) as T
  if (typeof seed === 'boolean') return (typeof raw === 'boolean' ? raw : seed) as T
  if (typeof seed === 'number') return (typeof raw === 'number' && Number.isFinite(raw) ? raw : seed) as T
  if (Array.isArray(seed)) {
    if (!Array.isArray(raw) || seed.length === 0) return seed
    const item = seed[0]
    return raw
      .filter((entry) => (isObj(item) ? isObj(entry) : typeof entry === typeof item))
      .slice(0, MAX_SECTION_ITEMS)
      .map((entry) => sectionText(entry, item)) as T
  }
  if (isObj(seed)) {
    const record = isObj(raw) ? raw : {}
    return Object.fromEntries(Object.entries(seed).map(([key, base]) => [key, sectionText(record[key], base)])) as T
  }
  return seed
}

/**
 * The redesigned sections: their wording as sectionText checks it, then the
 * fields with a format. A container card must name a known listing (an unknown
 * one is dropped), and the bottom button a safe link (else the default's).
 */
function sections(raw: Record<string, unknown>, seed: AllCitySections): AllCitySections {
  const out = sectionText(raw, seed)
  const rawProducts = isObj(raw.products) ? raw.products : {}
  if (Array.isArray(rawProducts.cards)) {
    const shape = seed.products.cards[0]
    out.products.cards = rawProducts.cards
      .filter(isObj)
      .slice(0, MAX_SECTION_ITEMS)
      .flatMap((card) => {
        const value = spec(card.spec)
        return value ? [{ ...sectionText(card, shape), spec: value }] : []
      })
  }
  const productsHref = out.products.buttonHref.trim()
  out.products.buttonHref = DEPOT_LINKS.includes(productsHref) ? productsHref : (href(productsHref) ?? seed.products.buttonHref)

  // Buy / Rent / Rent-To-Own: each tab one of the three, once (the section is laid out for at most three);
  // a feature's icon one the section draws; a card's link a safe one.
  const seen = new Set<string>()
  out.offers.tabs = out.offers.tabs
    .filter((tab) => OFFER_TAB_IDS.includes(tab.id) && !seen.has(tab.id) && seen.add(tab.id))
    .map((tab) => {
      const base = seed.offers.tabs.find((candidate) => candidate.id === tab.id) ?? seed.offers.tabs[0]
      return {
        ...tab,
        card: { ...tab.card, href: href(tab.card.href) ?? base.card.href },
        features: tab.features.map((feature) => ({ ...feature, icon: OFFER_FEATURE_ICONS.includes(feature.icon) ? feature.icon : 'price' })),
      }
    })

  // How It Works: the button goes to the page's depot (a placeholder, filled per page) or to a safe link.
  const hiwHref = out.howItWorks.buttonHref.trim()
  out.howItWorks.buttonHref = DEPOT_LINKS.includes(hiwHref) ? hiwHref : (href(hiwHref) ?? seed.howItWorks.buttonHref)

  // The Difference's photo: blank (the depot's banner) or one next/image may load.
  const photo = out.difference.image.trim()
  out.difference.image = photo ? (imageSrc(photo) ?? seed.difference.image) : ''

  // Recently Delivered: a whole number of cards, 1 to 20.
  out.deliveries.limit = Math.min(20, Math.max(1, Math.round(out.deliveries.limit)))

  // Popular Cities: a whole number of cities, 1 to 20 (the state's list holds at most 20).
  out.popular.limit = Math.min(20, Math.max(1, Math.round(out.popular.limit)))
  return out
}

/** The placeholders a button's link may be: the page's depot's location page, or the listing at that depot. */
const DEPOT_LINKS: readonly string[] = ['{depotPage}', '{depotPlp}']

const OFFER_TAB_IDS: readonly string[] = ['buy', 'rent', 'rto'] satisfies OfferTab['id'][]
const OFFER_FEATURE_ICONS: readonly string[] = [
  'price',
  'sizes',
  'conditions',
  'guides',
  'terms',
  'delivery',
  'ownership',
  'approval',
] satisfies OfferFeatureIcon[]

export function conformAllCityTemplate(raw: unknown, seed: AllCityTemplate = ALL_CITY_TEMPLATE_DEFAULT): AllCityTemplate {
  const record = isObj(raw) ? raw : {}
  return withSeed<AllCityTemplate>(
    {
      city: (r) => (isObj(r) ? templateText(r, seed.city) : undefined),
      depotCity: (r) => (isObj(r) ? templateText(r, seed.depotCity) : undefined),
      sections: (r) => (isObj(r) ? sections(r, seed.sections) : undefined),
      media: (r) => (isObj(r) ? withSeed({ heroBackground: imageSrc, youtubeId: (v) => (v === '' ? '' : youtubeId(v)), videoTitle: text }, seed.media, r) : undefined),
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
      depotCityBanner: (r) => (r === null ? null : image(r)) as AllCityImage | undefined,
    },
    seed,
    raw,
  )
  // "Use the city variant's" is stored as absent.
  if (!out.depotCityBanner) delete out.depotCityBanner
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
      out[key] = value
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
