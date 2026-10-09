import type { ProductHit } from '@/types/product'
import { type ContainerVariantKey, resolveContainerVariant } from '@/lib/containerVariant'
import { BASE_URL } from '@/lib/helpers'

/**
 * Every piece of static, size-dependent copy the product page renders.
 *
 * One object, keyed by container size, holding everything that differs between
 * a 20ft, a 40ft standard and a 40ft high cube. Adding a new kind of content
 * means adding a property under the size that needs it — not a new top-level
 * `faq20S` / `specs20S` / `overview20S` triple that the next person has to
 * discover and wire up separately.
 *
 * The shape is:
 *
 *   PDP_SHIPPING_CONTAINERS[size]
 *     .tabs[tabId]  copy for one tab of the body section
 *     .faq          the accordion below the tabs
 */

export type FaqItem = { question: string; answer: string }

/**
 * One figure in the specifications strip.
 *
 * `sub_value` is the metric equivalent and is rendered in parentheses under
 * the imperial figure, so both are on screen without a unit toggle. `image` is
 * a site-absolute path to an icon in `public/resources/icon-images/`.
 */
export type SpecItem = {
  image:     string
  /** Rendered uppercase. Stored in sentence case so it reads normally here. */
  label:     string
  value:     string
  sub_value: string
}

/**
 * What kind of thing a resource link leads to.
 *
 * Drives both the icon and how the link opens, so a visitor can tell a
 * document from a page before clicking rather than after. Add a member here
 * when a new kind appears — a video, a spreadsheet — rather than special-casing
 * it at the call site.
 */
export type ContainerResourceType = 'page' | 'pdf' | 'img'

/**
 * A document or page offered alongside a container size.
 *
 * Files live under `public/resources/pdp/`, so their url is a site-absolute
 * path. Next serves a PDF with `Content-Type: application/pdf`, which is what
 * lets the browser render one in its own viewer rather than save it — the link
 * deliberately carries no `download` attribute for that reason.
 *
 * An `img` opens in a lightbox on the page instead of a new tab: these are
 * infographics meant to be read beside the product, and sending someone to a
 * bare image URL loses that context and the way back.
 */
export type ContainerResource = {
  label: string
  url: string
  /** Defaults to `page`. */
  type?: ContainerResourceType
}

/* ── Tabs ──────────────────────────────────────────────────────────────── */

/**
 * The body tabs, in render order.
 *
 * Lives here rather than in the component so the content below can be keyed by
 * the same ids: `PdpBodyTabId` is derived from this list, so a tab that is
 * renamed or removed breaks the content object at compile time instead of
 * leaving copy addressed to a tab that no longer exists.
 */
export const PDP_BODY_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'specs',    label: 'Specifications' },
  /**
   * A link, not a panel — `href` is what makes it one.
   *
   * ASSUMED DESTINATION. The brief said "redirected to a certain page" without
   * naming it, and this is the only page on the site about modified containers.
   * Change this one line if it should point somewhere else.
   */
  { id: 'upgrades', label: 'Upgrade & Customizations', href: `${BASE_URL}/shipping-container-modified-containers-gallery/` },
  { id: 'delivery', label: 'Delivery Info' },
  { id: 'warranty', label: 'Warranty' },
] as const

export type PdpBodyTab = (typeof PDP_BODY_TABS)[number]

/** The members that carry an `href` — the ones that navigate. */
export type PdpLinkTab = Extract<PdpBodyTab, { href: string }>

/**
 * Does this tab navigate instead of opening a panel?
 *
 * Narrowed through the union rather than widened to `{ href: string }`, so the
 * caller gets the literal type back and `tab.href` is known to exist.
 */
export function isLinkTab(tab: PdpBodyTab): tab is PdpLinkTab {
  return 'href' in tab && typeof tab.href === 'string' && tab.href.length > 0
}

export type PdpBodyTabId = (typeof PDP_BODY_TABS)[number]['id']

/**
 * A run of prose — the shape most tab copy takes.
 *
 * Provisional: it covers a heading, paragraphs and a bullet list, which is
 * what the existing overview components are made of. Expect it to grow an
 * image or a table field once the real copy for the empty tabs arrives.
 */
export type ContentSection = {
  heading?: string
  /** One string per paragraph. */
  body?:    string[]
  bullets?: string[]
}

/**
 * The content each tab takes.
 *
 * Per-tab rather than one shared shape, because they do not render alike: the
 * specifications tab is a diagram above a strip of figures, and the rest are
 * prose. Keyed by `PdpBodyTabId`, so adding a tab to `PDP_BODY_TABS` and
 * forgetting to say what it holds is a type error here.
 */
export type PdpTabContentMap = {
  overview:   { sections: ContentSection[] }
  specs:      {
    intro?: string
    /** The dimensioned drawing above the figures, from `public/resources/pdp-specs/`. */
    image?: string
    items:  SpecItem[]
  }
  upgrades:   { sections: ContentSection[] }
  delivery:   { sections: ContentSection[] }
  warranty:   { sections: ContentSection[] }
}

/**
 * Tab content for one size.
 *
 * Every tab is optional except `specs`, which all three sizes have and which
 * the specifications panel has no sensible empty state for. The others are
 * absent today: `overview` is still three React components under
 * `_components/overview/`, and `delivery` and `warranty` are the same copy for
 * every size and live in `BodyTabsSection`. Any of them can move here by
 * filling in the key.
 *
 * `upgrades` has neither data nor a built-in panel yet, so its tab does not
 * render at all — see the note on visible tabs in `BodyTabsSection`. Give a
 * size some `sections` and the tab appears for that size.
 */
export type ContainerTabs =
  { [K in PdpBodyTabId]?: PdpTabContentMap[K] } & { specs: PdpTabContentMap['specs'] }

export type PdpShippingContainerEntry = {
  tabs: ContainerTabs
  faq:  FaqItem[]
}

/* ── Specifications ────────────────────────────────────────────────────── */

const ICON = '/resources/icon-images'

/**
 * The eight figures, in render order, with the icon and label each one uses.
 *
 * Icon and label are identical for every size — only the measurements differ —
 * so they are declared once here and a size supplies just its numbers. That
 * keeps a new size to eight lines, and means a relabelled row changes in one
 * place rather than three.
 */
const SPEC_ROWS = [
  { key: 'exteriorLength', image: `${ICON}/cube.webp`,          label: 'Exterior Length' },
  { key: 'exteriorWidth',  image: `${ICON}/width-arrows.webp`,  label: 'Exterior Width' },
  { key: 'exteriorHeight', image: `${ICON}/height-arrows.webp`, label: 'Exterior Height' },
  { key: 'interiorLength', image: `${ICON}/cube.webp`,          label: 'Interior Length' },
  { key: 'interiorWidth',  image: `${ICON}/width-arrows.webp`,  label: 'Interior Width' },
  { key: 'interiorHeight', image: `${ICON}/height-arrows.webp`, label: 'Interior Height' },
  { key: 'interiorVolume', image: `${ICON}/volume-cubes.webp`,  label: 'Interior Volume' },
  { key: 'tareWeight',     image: `${ICON}/tare-scale.webp`,    label: 'Tare Weight' },
] as const

type SpecRowKey = (typeof SPEC_ROWS)[number]['key']

/** `[imperial, metric]` for each row. */
type SpecMeasures = Record<SpecRowKey, readonly [value: string, subValue: string]>

function buildSpecItems(measures: SpecMeasures): SpecItem[] {
  return SPEC_ROWS.map(({ key, image, label }) => {
    const [value, sub_value] = measures[key]
    return { image, label, value, sub_value }
  })
}

// 20ft standard. Supplied directly for this catalog, and matching the
// dimensioned drawing at /resources/pdp-specs/20S.webp.
//
// Tare is 4,850 lbs, not the 6,850 in the figures handed over: 2,200 kg is
// 4,850 lbs, and 4,850 is also what the drawing itself shows. Flagged rather
// than silently corrected — say so if 6,850 was the intended figure and the
// metric value is the wrong one.
const specs20S = buildSpecItems({
  exteriorLength: ['20 ft',      '(6.06 m)'],
  exteriorWidth:  ['8 ft',       '(2.44 m)'],
  exteriorHeight: ['8.6 ft',     '(2.59 m)'],
  interiorLength: ['19.4 ft',    '(5.90 m)'],
  interiorWidth:  ['7.8 ft',     '(2.35 m)'],
  interiorHeight: ['7.9 ft',     '(2.39 m)'],
  interiorVolume: ['1,172 ft³',  '(33.2 m³)'],
  tareWeight:     ['4,850 lbs',  '(2,200 kg)'],
})

// PROVISIONAL — 40S and 40H have not been supplied in this format yet.
//
// The imperial figures are the ones already in this repo (the spec-sheet copy
// that was here before this strip existed, plus the cu ft reference figures);
// the metric values are arithmetic conversions of them, not separately
// sourced. Confirm or replace both before these are treated as authoritative.
//
// Tare stays a range because that is how it was given — "approx. 8,000–8,400
// lbs, varies by manufacturer" — rather than being averaged into a single
// figure that would read as more precise than it is.
const specs40S = buildSpecItems({
  exteriorLength: ['40 ft',             '(12.19 m)'],
  exteriorWidth:  ['8 ft',              '(2.44 m)'],
  exteriorHeight: ['8.6 ft',            '(2.59 m)'],
  interiorLength: ['39.4 ft',           '(12.01 m)'],
  interiorWidth:  ['7.7 ft',            '(2.34 m)'],
  interiorHeight: ['7.8 ft',            '(2.39 m)'],
  interiorVolume: ['2,390 ft³',         '(67.7 m³)'],
  tareWeight:     ['8,000–8,400 lbs',   '(3,630–3,810 kg)'],
})

const specs40H = buildSpecItems({
  exteriorLength: ['40 ft',             '(12.19 m)'],
  exteriorWidth:  ['8 ft',              '(2.44 m)'],
  exteriorHeight: ['9.6 ft',            '(2.90 m)'],
  interiorLength: ['39.4 ft',           '(12.01 m)'],
  interiorWidth:  ['7.7 ft',            '(2.34 m)'],
  interiorHeight: ['8.8 ft',            '(2.69 m)'],
  interiorVolume: ['2,700 ft³',         '(76.5 m³)'],
  tareWeight:     ['8,000–8,400 lbs',   '(3,630–3,810 kg)'],
})

/* ── FAQ ───────────────────────────────────────────────────────────────── */

// Real size-specific copy provided directly for this catalog.

const faq20S: FaqItem[] = [
  { question: 'How much does a 20 foot shipping container weigh?', answer: 'A standard empty (tare) 20 foot shipping container weighs approximately 2,300 kg (5,070 lbs). Its maximum gross weight, which is the total weight of the container and its contents, is around 24,000 kg (52,910 lbs). Therefore, it can carry up to approximately 21,700 kg (47,840 lbs) of cargo.' },
  { question: 'How much does a 20 foot shipping container cost?', answer: 'The cost of a 20 foot shipping container typically ranges from $1,300 to $5,000, depending on factors such as condition, type, and location. Used standard containers usually cost between $1,300 and $3,000, while new standard containers generally range from $3,500 to $5,000.' },
  { question: 'How much capacity is in a 20 ft container?', answer: 'A 20 ft container has a cubic capacity of 33 cubic meters. It can typically hold up to 11 EUR pallets, each measuring 120 by 80 centimeters. The 20-foot shipping container is the most widely used type around the world.' },
  { question: 'How large is a 20-foot shipping container?', answer: 'A standard 20-foot container has external dimensions of 20 feet in length, 8 feet in width, and 8.6 feet in height (equivalent to 6.06 meters long, 2.44 meters wide, and 2.59 meters high).' },
  { question: 'How many pallets are in a 20ft container?', answer: 'A 20ft container can accommodate around 10 standard pallets or 11 Euro pallets in a single layer. However, the exact number of pallets may vary based on the specific pallet dimensions and the way they are arranged inside the container.' },
]

const faq40S: FaqItem[] = [
  { question: 'How much does a 40 ft shipping container cost?', answer: 'Used 40 ft shipping containers can start at around $1,850, but prices can rise to $3,500 in markets with limited supply. One-trip 40-foot containers, which are nearly new, typically cost between $4,500 and $7,000, depending on availability.' },
  { question: 'How much capacity is in a 40 ft container?', answer: 'The payload capacity refers to the maximum load a container can carry, which is 28,800 kilograms for a 40-foot container. This is only slightly higher than the 25,000-kilogram payload capacity of a 20-foot container. Additionally, a 40-foot dry container offers a volume of up to 67 cubic meters.' },
  { question: 'How much does a 40 foot shipping container weigh?', answer: 'An empty 40 foot shipping container weighs about 8,265 lbs (3,750 kg). It can carry a maximum cargo weight of 58,935 lbs (26,730 kg), with a total weight limit including both the container and its cargo of approximately 67,200 lbs (30,480 kg).' },
  { question: 'How many square feet in a 40 foot shipping container?', answer: 'A standard 40-foot container measures 40 feet long, 8 feet wide, and 8.5 feet high on the outside. This results in an exterior floor area of 320 square feet.' },
  { question: 'What are the dimensions of a 40 foot shipping container?', answer: 'A standard 40-foot shipping container measures 40 feet (12.2 meters) in length, 8 feet (2.44 meters) in width, and 8.5 feet (2.59 meters) in height on the outside. Its interior dimensions are slightly smaller, with a length of 39.5 feet (12.03 meters), a width of 7.7 feet (2.35 meters), and a height of 7.9 feet (2.39 meters).' },
]

const faq40H: FaqItem[] = [
  { question: 'What is the difference between 40ft container and 40ft high cube?', answer: 'A 40ft High Cube (HC) container is taller than a standard 40ft container, providing additional interior space and volume. However, this usually comes with a higher cost and increased weight. While standard 40-foot containers are 8 feet 6 inches (2.59 meters) tall, High Cube containers measure 9 feet 6 inches (2.89 meters) in height.' },
  { question: 'How much is a 40ft high cube container?', answer: 'Used 40ft High Cube shipping containers typically start at around $2,000, but prices can reach up to $3,500 in areas with limited supply. One-trip 40-foot High Cube containers, which are nearly new, generally range in price from $4,750 to $7,000, depending on availability.' },
  { question: 'How much can a 40 ft HQ container hold?', answer: 'Depending on the type of cargo and how it is packed, a 40ft HQ container can typically hold 25 to 27 Euro pallets or 20 to 22 standard pallets. It can carry up to 60,000 pounds (27,000 kilograms), though this is subject to local transport regulations. The extra vertical space also makes it ideal for bulky or irregularly shaped items.' },
  { question: 'How many cbm are in a 40ft high cube container?', answer: 'A 40-foot High Cube (HC) container can hold approximately 76 cubic meters (m³) of cargo. It has a payload capacity of up to 28,560 kilograms (62,974.8 pounds).' },
  { question: 'What are the dimensions of a 40ft high cube container?', answer: 'A 40ft High Cube container has external dimensions of 40 feet in length, 8 feet in width, and 9 feet 6 inches in height. Internally, it measures approximately 39 feet 5.6 inches in length, 7 feet 8.5 inches in width, and 8 feet 10 inches in height.' },
]

/* ── Content ───────────────────────────────────────────────────────────── */

export const PDP_SHIPPING_CONTAINERS: Record<ContainerVariantKey, PdpShippingContainerEntry> = {
  '20S': {
    tabs: {
      specs: { image: '/resources/pdp-specs/20S.webp', items: specs20S },
    },
    faq: faq20S,
  },
  '40S': {
    // No drawing supplied yet — the panel renders the figures without one.
    tabs: {
      specs: { items: specs40S },
    },
    faq: faq40S,
  },
  '40H': {
    tabs: {
      specs: { items: specs40H },
    },
    faq: faq40H,
  },
}

/* ── Lookups ───────────────────────────────────────────────────────────── */

/**
 * Everything static for the size this product is.
 *
 * The one entry point callers should use. Reaching for
 * `PDP_SHIPPING_CONTAINERS[resolveContainerVariant(product)]` works and is what
 * this does, but repeating it at each call site is how one of them ends up
 * resolving the size differently from the rest.
 */
export function getContainerContent(product: ProductHit): PdpShippingContainerEntry {
  return PDP_SHIPPING_CONTAINERS[resolveContainerVariant(product)]
}

/**
 * Tare weight in pounds, for the JSON-LD `weight` property.
 *
 * Read out of the specifications strip rather than kept as a separate figure,
 * so the number a crawler is told and the number on the page cannot disagree.
 * A range ("8,000–8,400 lbs") averages to its midpoint, which is the closest
 * single number schema.org's `QuantitativeValue` can carry.
 */
export function getTareWeightLbs(product: ProductHit): number | undefined {
  const tare = getContainerContent(product).tabs.specs.items
    .find((item) => item.label === 'Tare Weight')
  if (!tare) return undefined

  const nums = tare.value.replace(/,/g, '').match(/\d+(\.\d+)?/g)
  if (!nums?.length) return undefined

  const values = nums.map(Number)
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
}

// Resources are not listed per size: they are derived from the active product's
// size, condition and grade against the files actually present under
// public/resources/pdp/. See `getContainerResources` in ./pdpResources.
