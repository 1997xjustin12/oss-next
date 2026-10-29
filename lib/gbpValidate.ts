/**
 * Validation for the GBP records the admin writes to Redis: a location page,
 * the shared content and the template.
 *
 * Every read goes through here, so a malformed or out-of-date record can never
 * break or blank a page: each top-level field that fails validation falls back
 * to the code seed (lib/data/gbpPages.ts, gbpShared.ts, gbpTemplate.ts), and a
 * bad item in a list is dropped. The admin's save actions use the same
 * validators, so what is stored is what renders.
 *
 * Pure (no I/O); tested in tests/unit/gbpValidate.test.ts.
 */

import type {
  GbpBlogCard,
  GbpFaq,
  GbpManualBlogCard,
  GbpPostBlogCard,
  GbpImage,
  GbpLibraryProps,
  GbpListing,
  GbpOpeningHours,
  GbpPage,
  GbpSectionInstance,
  GbpSectionStyle,
  GbpSectionType,
  GbpSharedContent,
  GbpTemplate,
} from '@/types/gbp'

/** A validator: the value if valid, otherwise undefined. */
export type V<T> = (raw: unknown) => T | undefined

const isObj = (r: unknown): r is Record<string, unknown> => !!r && typeof r === 'object' && !Array.isArray(r)

export const str: V<string> = (r) => (typeof r === 'string' ? r : undefined)
/** A string with something in it, trimmed. */
export const text: V<string> = (r) => (typeof r === 'string' && r.trim() ? r.trim() : undefined)
export const num: V<number> = (r) => (typeof r === 'number' && Number.isFinite(r) ? r : undefined)
export const bool: V<boolean> = (r) => (typeof r === 'boolean' ? r : undefined)
export const nullable = <T>(v: V<T>): V<T | null> => (r) => (r === null ? null : v(r))
export const oneOf = <T extends string>(...values: T[]): V<T> => (r) => (values.includes(r as T) ? (r as T) : undefined)
/** A list; invalid items are dropped rather than failing the list. */
export const list = <T>(v: V<T>): V<T[]> => (r) =>
  Array.isArray(r) ? r.map(v).filter((x): x is T => x !== undefined) : undefined

/** An object whose required keys all validate. Optional keys are dropped when invalid. */
export function shape<T extends object>(fields: { [K in keyof T]-?: V<T[K]> }, optional: (keyof T)[] = []): V<T> {
  return (r) => {
    if (!isObj(r)) return undefined
    const out: Record<string, unknown> = {}
    for (const key of Object.keys(fields) as (keyof T & string)[]) {
      const value = fields[key](r[key])
      if (value === undefined) {
        if (optional.includes(key)) continue
        return undefined
      }
      out[key] = value
    }
    return out as T
  }
}

/**
 * The record with every top-level field validated, each falling back to the
 * seed's. Nested objects validate whole (they are small and belong together).
 */
export function withSeed<T extends object>(fields: { [K in keyof T]-?: V<T[K]> }, seed: T, raw: unknown): T {
  const record = isObj(raw) ? raw : {}
  const out = { ...seed } as Record<string, unknown>
  for (const key of Object.keys(fields) as (keyof T & string)[]) {
    if (!(key in record)) continue
    const value = fields[key](record[key])
    if (value !== undefined) out[key] = value
  }
  return out as T
}

// ─── Values with a format ────────────────────────────────────────────────────

/** `#rrggbb`, lowercase-insensitive. */
export const hex: V<string> = (r) => (typeof r === 'string' && /^#[0-9a-f]{6}$/i.test(r.trim()) ? r.trim().toUpperCase() : undefined)

/** An http(s) URL, or a root-relative path / in-page anchor where links allow it. */
export const url: V<string> = (r) => {
  if (typeof r !== 'string') return undefined
  const value = r.trim()
  if (/^(\/|#)/.test(value)) return value
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? value : undefined
  } catch {
    return undefined
  }
}

/** Only a Google Maps embed, the one iframe source the page renders. */
export const mapsEmbedUrl: V<string> = (r) => {
  const value = url(r)
  return value && /^https:\/\/www\.google\.com\/maps\/embed\?/.test(value) ? value : undefined
}

/** A YouTube video id (11 characters), or the id out of a pasted YouTube URL. */
export const youtubeId: V<string> = (r) => {
  if (typeof r !== 'string') return undefined
  const value = r.trim()
  const id = value.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/)?.[1] ?? value
  return /^[\w-]{11}$/.test(id) ? id : undefined
}

/** `+1XXXXXXXXXX` from any North American number as typed. */
export const phoneE164: V<string> = (r) => {
  if (typeof r !== 'string') return undefined
  const digits = r.replace(/\D/g, '')
  const national = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits
  return /^[2-9]\d{9}$/.test(national) ? `+1${national}` : undefined
}

export const email: V<string> = (r) => (typeof r === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.trim()) ? r.trim().toLowerCase() : undefined)

const time: V<string> = (r) => (typeof r === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(r.trim()) ? r.trim() : undefined)

const json: V<Record<string, unknown>> = (r) => (isObj(r) ? r : undefined)

// ─── Location page ───────────────────────────────────────────────────────────

const image = shape<GbpImage>({ src: url, alt: str, width: num, height: num })

const NAMED_ENTITIES: Record<string, string> = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ', hellip: '…', ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“' }

/**
 * Text with HTML entities decoded (`20&#8242;` → `20′`, `&#8230;` → `…`). Copy
 * extracted from WordPress kept some, and React prints them as typed.
 */
export const decodeEntities = (value: string): string =>
  value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] !== '#') return NAMED_ENTITIES[code.toLowerCase()] ?? match
    const point = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10)
    return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : match
  })

/** `text` / `str` for copy shown as text, with entities decoded. */
const copy: V<string> = (r) => {
  const value = text(r)
  return value === undefined ? undefined : decodeEntities(value)
}
const copyOrEmpty: V<string> = (r) => (typeof r === 'string' ? decodeEntities(r) : undefined)

const manualBlogCard = shape<GbpManualBlogCard>({ title: copy, excerpt: copyOrEmpty, url: nullable(url), image: url, imageAlt: copyOrEmpty })
const postSlug: V<string> = (r) => (typeof r === 'string' && /^[a-z0-9][a-z0-9-]*$/i.test(r.trim()) ? r.trim() : undefined)
const postBlogCard = shape<GbpPostBlogCard>({ post: postSlug })
/** A post card is told apart by its `post` key; one without a valid slug is dropped. */
const blogCard: V<GbpBlogCard> = (r) => (isObj(r) && 'post' in r ? postBlogCard(r) : manualBlogCard(r))
const faq = shape<GbpFaq>({ question: copy, answer: copy })

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const
const openingHours = shape<GbpOpeningHours>({ days: list(oneOf(...DAYS)), opens: time, closes: time })
const listing = shape<GbpListing>(
  { name: text, openingHours: list(openingHours), extraJsonLd: list(json) },
  ['name', 'openingHours', 'extraJsonLd'],
)

const PAGE_FIELDS: { [K in keyof GbpPage]-?: V<GbpPage[K]> } = {
  slug: text,
  subdomain: str,
  location: shape({ city: text, stateCode: text, stateName: text }),
  contact: shape({
    phone: text,
    phoneE164,
    email,
    addressLine: text,
    address: shape({
      streetAddress: text,
      addressLocality: text,
      addressRegion: text,
      postalCode: text,
      addressCountry: oneOf('US', 'CA'),
    }),
    hours: text,
  }),
  geo: nullable(shape({ lat: num, lng: num })),
  areaServed: list(text),
  headings: shape({ hero: text, trustedBy: text, products: text, types: text, resources: text }),
  about: list(copy),
  blogCards: list(blogCard),
  faqs: list(faq),
  mapEmbedUrl: mapsEmbedUrl,
  youtubeId,
  seo: shape({
    title: text,
    description: text,
    canonical: url,
    ogType: oneOf('article', 'website'),
    ogImage: nullable(shape<{ url: string; width?: number; height?: number }>({ url, width: num, height: num }, ['width', 'height'])),
    modifiedTime: nullable(str),
  }),
  jsonLd: list(json),
  listing,
}

/** A location page from Redis (or a form), over its code seed. The slug is always the seed's. */
export function conformGbpPage(raw: unknown, seed: GbpPage): GbpPage {
  return { ...withSeed(PAGE_FIELDS, seed, raw), slug: seed.slug }
}

// ─── Shared content ──────────────────────────────────────────────────────────

const SHARED_FIELDS: { [K in keyof GbpSharedContent]-?: V<GbpSharedContent[K]> } = {
  header: shape({ announcement: text, logo: image, nav: list(shape({ label: text, href: url })) }),
  hero: shape({ tagline: text, bullets: list(text), quoteCtaLabel: text, background: url, badges: list(image) }),
  trustedLogos: list(shape({ src: url, alt: str })),
  productCards: list(shape({ title: text, features: list(text), image })),
  reviewsHeading: text,
  containerTypes: list(shape({ accent: str, rest: str, body: text, image })),
  whyChoose: shape({
    heading: text,
    items: list(shape({ icon: oneOf('user-shield', 'medal', 'money-bill', 'retweet'), title: text, body: text })),
  }),
  about: shape({ image, cta: text }),
  quote: shape({ heading: text }),
  newsletter: shape({ heading: text, body: text, note: str, background: url }),
  faqHeading: text,
  footer: shape({ tagline: str, logoHref: url }),
}

export function conformGbpShared(raw: unknown, seed: GbpSharedContent): GbpSharedContent {
  return withSeed(SHARED_FIELDS, seed, raw)
}

// ─── Template ────────────────────────────────────────────────────────────────

export const CORE_SECTION_TYPES = [
  'hero',
  'trustedBy',
  'products',
  'reviews',
  'types',
  'resources',
  'whyChoose',
  'about',
  'quote',
  'newsletter',
  'faq',
] as const
export const LIBRARY_SECTION_TYPES = ['textImage', 'ctaBand', 'video', 'spacer'] as const

const sectionStyle = shape<GbpSectionStyle>(
  {
    background: hex,
    backgroundDark: hex,
    heading: hex,
    headingDark: hex,
    accent: hex,
    paddingY: oneOf('none', 'sm', 'md', 'lg'),
  },
  ['background', 'backgroundDark', 'heading', 'headingDark', 'accent', 'paddingY'],
)

const LIBRARY_PROPS: { [K in keyof GbpLibraryProps]: V<GbpLibraryProps[K]> } = {
  textImage: shape({ heading: str, body: str, image: nullable(image), imageSide: oneOf('left', 'right'), showCall: bool }),
  ctaBand: shape({ heading: str, body: str }),
  video: shape({ heading: str, youtubeId }),
  spacer: shape({ size: oneOf('sm', 'md', 'lg') }),
}

const sectionType = oneOf<GbpSectionType>(...CORE_SECTION_TYPES, ...LIBRARY_SECTION_TYPES)

function section(raw: unknown): GbpSectionInstance | undefined {
  if (!isObj(raw)) return undefined
  const id = text(raw.id)
  const type = sectionType(raw.type)
  if (!id || !type) return undefined
  const out: GbpSectionInstance = { id, type, enabled: raw.enabled !== false }
  const style = sectionStyle(raw.style)
  if (style && Object.keys(style).length) out.style = style
  if (type in LIBRARY_PROPS) {
    const props = LIBRARY_PROPS[type as keyof GbpLibraryProps](raw.props)
    // A library section is nothing without its content.
    if (!props) return undefined
    out.props = props
  }
  return out
}

/** Sections with unique ids; a built-in section appears at most once. */
function sections(raw: unknown): GbpSectionInstance[] | undefined {
  const items = list(section)(raw)
  if (!items) return undefined
  const ids = new Set<string>()
  const cores = new Set<string>()
  return items.filter((s) => {
    if (ids.has(s.id)) return false
    if ((CORE_SECTION_TYPES as readonly string[]).includes(s.type)) {
      if (cores.has(s.type)) return false
      cores.add(s.type)
    }
    ids.add(s.id)
    return true
  })
}

const TEMPLATE_FIELDS: { [K in keyof GbpTemplate]-?: V<GbpTemplate[K]> } = {
  sections,
  theme: shape({ brand: hex, accent: hex, font: oneOf('poppins', 'roboto') }),
  header: shape({ showCallButton: bool, background: hex, backgroundDark: hex }),
  footer: shape({ showEmail: bool, showAddress: bool, showHours: bool }),
}

export function conformGbpTemplate(raw: unknown, seed: GbpTemplate): GbpTemplate {
  return withSeed(TEMPLATE_FIELDS, seed, raw)
}
