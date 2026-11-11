/**
 * Validation for the location-page records the admin writes to Redis: the
 * template and each location (types/locationPage.ts).
 *
 * Every read goes through here, so a malformed or out-of-date record can never
 * break or blank a page: each top-level field that fails falls back to the
 * code seed (lib/data/locationTemplate.ts, locationPages.ts), and a bad item in
 * a list is dropped. The admin's save actions use the same validators, so what
 * is stored is what renders. Built on the GBP validators (lib/gbpValidate.ts).
 *
 * Pure (no I/O); tested in tests/unit/locationValidate.test.ts.
 */

import { bool, list, nullable, num, oneOf, optionalYoutubeId, shape, str, text, url, withSeed, type V } from '@/lib/gbpValidate'
import { LOCATION_TEMPLATE_DEFAULT } from '@/lib/data/locationTemplate'
import { DEPOT_FEATURED_SPECS, type DepotFeaturedKey } from '@/services/search.service'
import type { LandingFaq, LandingFaqBlock, LandingInline } from '@/lib/data/containerLandingContent'
import type {
  LocationImage,
  LocationOptionCard,
  LocationPage,
  LocationResource,
  LocationSectionId,
  LocationStory,
  LocationTemplate,
  LocationTemplateText,
  LocationTextOverrides,
} from '@/types/locationPage'

const isObj = (r: unknown): r is Record<string, unknown> => !!r && typeof r === 'object' && !Array.isArray(r)

export const LOCATION_SECTION_IDS = LOCATION_TEMPLATE_DEFAULT.sections.map((section) => section.id) as readonly LocationSectionId[]
export const LOCATION_LINK_KEYS = ['products', 'buy', 'purchase', 'rental', 'rto'] as const

/** A link the page may use: a path on this site, an https URL, `tel:` (the page's phone) or a mailto. */
export const href: V<string> = (r) => {
  if (typeof r !== 'string') return undefined
  const s = r.trim()
  if (s === 'tel:' || /^tel:\+?[\d-]+$/.test(s) || /^mailto:\S+@\S+$/.test(s)) return s
  // Protocol-relative ("//elsewhere") would leave the site: never a page link.
  if (s.startsWith('//')) return undefined
  if (/^\/(?!\/)[^\s]*$/.test(s)) return s.replace(/(.)\/+(?=$|\?)/, '$1')
  return url(s)
}

/** "(951) 399-2653". */
export const displayPhone: V<string> = (r) => (typeof r === 'string' && /^\(\d{3}\) \d{3}-\d{4}$/.test(r.trim()) ? r.trim() : undefined)

const image = shape<LocationImage>({ src: url, alt: str, width: num, height: num })
const paragraphs: V<string[]> = (r) => {
  const value = list(text)(r)
  return value?.length ? value : undefined
}
const story = shape<LocationStory>({ title: text, paragraphs, image })
const resource = shape<LocationResource>({ title: text, paragraphs, image, href })
const spec: V<DepotFeaturedKey> = oneOf(...DEPOT_FEATURED_SPECS.map((s) => s.key))
const specs: V<DepotFeaturedKey[]> = (r) => {
  const value = list(spec)(r)
  return value?.length ? [...new Set(value)] : undefined
}

/** A section list: known ids, each once, in the order given. Empty is invalid. */
const sections: V<{ id: LocationSectionId; enabled: boolean }[]> = (r) => {
  const items = list(shape<{ id: LocationSectionId; enabled: boolean }>({ id: oneOf(...LOCATION_SECTION_IDS), enabled: bool }))(r)
  if (!items?.length) return undefined
  const seen = new Set<string>()
  return items.filter((item) => !seen.has(item.id) && seen.add(item.id))
}

const inline: V<LandingInline> = (r) => {
  if (typeof r === 'string') return r
  if (isObj(r) && typeof r.strong === 'string') return { strong: r.strong }
  if (isObj(r) && typeof r.text === 'string') {
    const link = href(r.href)
    return link ? { text: r.text, href: link } : undefined
  }
  return undefined
}
const block: V<LandingFaqBlock> = (r) => {
  if (!isObj(r)) return undefined
  if ('p' in r) return list(inline)(r.p) ? { p: list(inline)(r.p)! } : undefined
  if ('ul' in r) return list(list(inline))(r.ul) ? { ul: list(list(inline))(r.ul)! } : undefined
  return undefined
}
const faq = shape<LandingFaq>({ question: text, answer: (r) => { const v = list(block)(r); return v?.length ? v : undefined } })

const card = shape<LocationOptionCard>({ image, bullets: list(text), ptype: oneOf('buy', 'rental', 'rto') })

/** The template's wording, every field a string; a group that fails keeps the seed's. */
function templateText(raw: unknown, seed: LocationTemplateText): LocationTemplateText {
  const record = isObj(raw) ? raw : {}
  const out = structuredClone(seed) as Record<string, unknown>
  for (const [group, base] of Object.entries(seed)) {
    const value = record[group]
    if (typeof base === 'string') {
      if (typeof value === 'string') out[group] = value
      continue
    }
    if (!isObj(value)) continue
    out[group] = Object.fromEntries(Object.entries(base).map(([field, fallback]) => [field, typeof value[field] === 'string' ? value[field] : fallback]))
  }
  return out as LocationTemplateText
}

/** A location's overrides: only the template's own fields, only non-empty strings. */
export const textOverrides: V<LocationTextOverrides> = (r) => {
  if (!isObj(r)) return undefined
  const out: Record<string, unknown> = {}
  for (const [group, base] of Object.entries(LOCATION_TEMPLATE_DEFAULT.text)) {
    const value = r[group]
    if (typeof base === 'string') {
      if (typeof value === 'string' && value.trim()) out[group] = value
      continue
    }
    if (!isObj(value)) continue
    const fields = Object.fromEntries(Object.keys(base).filter((field) => typeof value[field] === 'string' && (value[field] as string).trim()).map((field) => [field, value[field]]))
    if (Object.keys(fields).length) out[group] = fields
  }
  return out as LocationTextOverrides
}

const TEMPLATE_FIELDS: { [K in keyof LocationTemplate]-?: V<LocationTemplate[K]> } = {
  sections,
  text: (r) => (isObj(r) ? templateText(r, LOCATION_TEMPLATE_DEFAULT.text) : undefined),
  media: shape<LocationTemplate['media']>({
    heroBackground: url,
    satisfactionSeal: image,
    purchaseImage: image,
    rentalImage: image,
    rtoImage: image,
    youtubeId: optionalYoutubeId,
  }),
  options: shape<LocationTemplate['options']>({ buy: card, rent: card, rto: card }),
  productSpecs: specs,
  deliveredPhotos: list(image),
  faqs: list(faq),
}

/** The template as stored, every field validated against the seed's. Its text keeps the seed's for any group a record lacks. */
export function conformLocationTemplate(raw: unknown, seed: LocationTemplate): LocationTemplate {
  const out = withSeed(TEMPLATE_FIELDS, seed, raw)
  // A partial text record keeps the seed's wording for whatever it lacks.
  if (isObj(raw) && isObj(raw.text)) out.text = templateText(raw.text, seed.text)
  // Every section id appears exactly once: one the record lacks is added, off, at the end.
  const known = new Set(out.sections.map((s) => s.id))
  out.sections = [...out.sections, ...LOCATION_SECTION_IDS.filter((id) => !known.has(id)).map((id) => ({ id, enabled: false }))]
  return out
}

const PAGE_FIELDS: { [K in keyof LocationPage]-?: V<LocationPage[K]> } = {
  // The slug is the record's identity: never taken from the record.
  slug: () => undefined,
  depot: text,
  // The editor's select sends it as a string.
  depotId: (r) => {
    const n = typeof r === 'string' && /^\d+$/.test(r) ? Number(r) : r
    return typeof n === 'number' && Number.isInteger(n) && n > 0 ? n : undefined
  },
  place: shape<LocationPage['place']>({ city: text, region: str, regionName: text, label: text }),
  phone: (r) => (r === '' ? '' : displayPhone(r)),
  sections: nullable(sections) as V<LocationPage['sections']>,
  productSpecs: (r) => (Array.isArray(r) && r.length === 0 ? [] : specs(r)),
  links: (r) => {
    if (!isObj(r)) return undefined
    return Object.fromEntries(LOCATION_LINK_KEYS.flatMap((key) => {
      const value = typeof r[key] === 'string' && r[key] !== '' ? href(r[key]) : undefined
      return value ? [[key, value]] : []
    }))
  },
  nearbyCities: list(shape<{ name: string; href: string }>({ name: text, href })),
  mapImage: nullable(image),
  featured: nullable(story),
  news: nullable(story),
  deliveredLead: list(image),
  text: textOverrides,
  resources: list(resource),
  faqYoutubeId: optionalYoutubeId,
  seo: shape<LocationPage['seo']>({ title: text, description: str, ogImage: url }),
}

/**
 * A location as stored, every field validated against its seed's. Empty
 * optional values (no phone, no sections of its own, no specs, no FAQ video)
 * are dropped, so the template's apply.
 */
export function conformLocationPage(raw: unknown, seed: LocationPage): LocationPage {
  const out = withSeed(PAGE_FIELDS, seed, raw) as LocationPage & Record<string, unknown>
  out.slug = seed.slug
  if (!out.phone) delete out.phone
  if (!out.sections) delete out.sections
  if (!out.productSpecs?.length) delete out.productSpecs
  if (out.links && !Object.keys(out.links).length) delete out.links
  if (!out.faqYoutubeId) delete out.faqYoutubeId
  if (!out.resources?.length) delete out.resources
  if (out.text && !Object.keys(out.text).length) delete out.text
  return out
}
