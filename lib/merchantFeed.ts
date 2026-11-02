import { MERCHANT_FEED_SOURCES, type MerchantFeedSource } from '@/config/merchantFeeds'
import { clean, esc, mapCondition, truncate } from '@/lib/googleFeed'
import { getCustomFieldValue, isContainerHit, isGenericDisplayHit, isInStockHit } from '@/lib/pricing'
import type { FormattedContainerHit, ProductHit } from '@/types/product'

// Builds the three Google Merchant feeds (buy, rental, rent-to-own) in the format
// the WordPress plugin published them. Pure string building, no I/O: the generator
// is services/merchantFeed.service.ts.
//
// Separate from lib/googleFeed.ts, which is the single catalog-wide feed agents
// read (/api/feeds/google.xml). That one explains itself to a machine; this one
// has to look unchanged to Merchant Center.

/**
 * What a product's live feed entry said on 2026-11-02, the day this app took the
 * feeds over from WordPress (lib/data/merchantFeedBaseline.ts).
 *
 * Merchant Center knows a product by its `id`: a new one is a new product, back
 * through review with its history gone. And the IDs are old WordPress post IDs,
 * which the catalog does not hold. The titles and descriptions were written in
 * WordPress and are not in the catalog either, so all of it is kept from here.
 *
 * Text is already XML-escaped, as it was in the feed.
 */
export type MerchantBaselineRow = {
  /** g:id */
  i: string
  /** g:title; empty on 42 accessories, which get the catalog's. */
  t: string
  /** g:description */
  d: string
  /** g:image_link */
  m: string
  /** g:gtin, when it had one. */
  g: string
}

/** product_id → what its feed entry said. */
export type MerchantBaseline = Record<string, MerchantBaselineRow>

export type MerchantFeedSkipReason = 'generic page' | 'no link' | 'no image' | 'no price' | 'no title'

export type BuiltMerchantFeed = {
  xml: string
  items: number
  /** Products not in the baseline: published since, so they are new to Merchant. */
  added: number
  /** Live titles with the city missing, filled in from the catalog. */
  titlesRepaired: number
  skipped: Partial<Record<MerchantFeedSkipReason, number>>
}

const BRAND = 'OnsiteStorage'
const CURRENCY = 'USD'
const TITLE_MAX = 150
const DESC_MAX = 5000

const PURPOSE: Record<string, string> = { buy: 'For Sale', rental: 'For Rent', rto: 'For RTO' }
const LOWER_PURPOSE: Record<string, string> = { buy: 'for sale', rental: 'for rent', rto: 'for rent-to-own' }

/** `temecula storage unit` → `Temecula Storage Unit`. */
function titleCase(s: string): string {
  return s.replace(/\S+/g, (word) => word.charAt(0).toUpperCase() + word.slice(1))
}

function gradeLabel(raw: string): string {
  if (/iicl/i.test(raw)) return 'IICL'
  if (/cargo|\bcw\b/i.test(raw)) return 'CW'
  if (/wind|wwt/i.test(raw)) return 'WWT'
  if (/as[\s-]?is/i.test(raw)) return 'AS IS'
  return raw.trim()
}

/** `Used WWT 40 Ft High Cube Shipping Container`, as the live titles put it. */
function containerSpec(hit: FormattedContainerHit): string {
  const length = getCustomFieldValue(hit, 'length_width').match(/\d+/)?.[0]
  const highCube = /high|hc/i.test(getCustomFieldValue(hit, 'height'))
  return [
    getCustomFieldValue(hit, 'condition').trim(),
    gradeLabel(getCustomFieldValue(hit, 'grade')),
    length ? `${length} Ft` : '',
    highCube ? 'High Cube' : '',
    'Shipping Container',
  ]
    .filter(Boolean)
    .join(' ')
}

/**
 * The title of a product the baseline has no title for, in the live format:
 * `Temecula Storage Unit: Used WWT 40 Ft Shipping Container For Rent`, or, with no
 * SEO keyphrase to lead with, `Used WWT 40 Ft Shipping Container For Rent In Temecula, CA`.
 * An accessory's name is its title.
 */
function titleFromCatalog(hit: FormattedContainerHit, paymentType: string): string {
  const name = clean((hit as unknown as ProductHit).title ?? '')
  if (!isContainerHit(hit)) return name
  const spec = `${containerSpec(hit)} ${PURPOSE[paymentType] ?? ''}`.trim()
  const keyphrase = (hit as { seo?: { focus_keyphrase?: string } }).seo?.focus_keyphrase?.trim()
  if (keyphrase) return `${titleCase(keyphrase)}: ${spec}`
  const location = getCustomFieldValue(hit, 'location').trim()
  return location ? `${spec} In ${location}` : spec
}

/** HTML as plain text. Only for catalog copy: baseline descriptions are already text. */
function plainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

function descriptionFromCatalog(hit: FormattedContainerHit, paymentType: string): string {
  const body = plainText(String((hit as { body_html?: unknown }).body_html ?? ''))
  if (body) return body
  const name = clean((hit as unknown as ProductHit).title ?? '')
  if (!isContainerHit(hit)) return name
  const location = getCustomFieldValue(hit, 'location').trim()
  const term = getCustomFieldValue(hit, 'payment_term').match(/\d+/)?.[0]
  return [
    `${containerSpec(hit)} ${LOWER_PURPOSE[paymentType] ?? ''}${location ? ` in ${location}` : ''}.`.replace(/\s+/g, ' '),
    term ? `${term}-month term; the price shown is per month.` : '',
    'Delivered to your site by On-Site Storage Solutions.',
  ]
    .filter(Boolean)
    .join(' ')
}

/**
 * 1,240 live titles lost their city to a plugin bug: `… For Sale In : New IICL …`.
 * The rental titles show what was meant: `… For Rent In Marietta, GA: Used WWT …`.
 */
function repairTitle(escaped: string, location: string): string {
  return location ? escaped.replace(' In :', ` In ${esc(location)}:`) : escaped
}

type Item = { xml: string; added: boolean; titleRepaired: boolean } | { skip: MerchantFeedSkipReason }

function itemXml(hit: FormattedContainerHit, paymentType: string, base: MerchantBaselineRow | undefined, origin: string): Item {
  // A generic "Various North America" page isn't a real offer, so a new one stays
  // out; but 72 are in Merchant today, and those stay in.
  if (!base && isGenericDisplayHit(hit)) return { skip: 'generic page' }

  const p = hit as unknown as ProductHit
  if (!p.handle) return { skip: 'no link' }
  const image = base?.m || p.images?.[0]?.src
  if (!image) return { skip: 'no image' }
  const price = hit.sale_price
  if (!Number.isFinite(price) || price <= 0) return { skip: 'no price' }

  const location = getCustomFieldValue(hit, 'location').trim()
  const repaired = base?.t ? repairTitle(base.t, location) : ''
  const title = repaired || esc(truncate(titleFromCatalog(hit, paymentType), TITLE_MAX))
  if (!title) return { skip: 'no title' }
  const description = base?.d || esc(truncate(descriptionFromCatalog(hit, paymentType), DESC_MAX))

  const sku = p.variants?.[0]?.sku?.trim() ?? ''
  const condition = mapCondition(getCustomFieldValue(hit, 'condition'), isContainerHit(hit))
  // A product new to Merchant is known by its SKU, or its handle if it has none:
  // never its catalog product_id, whose numbers overlap the WordPress IDs in use.
  const id = base?.i || esc(sku || p.handle)

  const categories = (p.product_category ?? [])
    .map((c) => c.category_name)
    .filter(Boolean)
    .map((name) => `<g:category>${esc(name)}</g:category>`)
    .join('')

  const xml = [
    `<g:id>${id}</g:id>`,
    `<g:title>${title}</g:title>`,
    `<g:description>${description}</g:description>`,
    `<g:price>${price.toFixed(2)} ${CURRENCY}</g:price>`,
    `<g:availability>${isInStockHit(hit) ? 'in_stock' : 'out_of_stock'}</g:availability>`,
    `<g:condition>${condition}</g:condition>`,
    `<g:image_link>${base?.m || esc(image)}</g:image_link>`,
    `<g:link>${esc(`${origin}/product/${p.handle}`)}</g:link>`,
    base?.g ? `<g:gtin>${base.g}</g:gtin>` : '<g:identifier_exists>no</g:identifier_exists>',
    sku ? `<g:sku>${esc(sku)}</g:sku><g:mpn>${esc(sku)}</g:mpn>` : '',
    `<g:brand>${BRAND}</g:brand>`,
    categories ? `<g:product_category>${categories}</g:product_category>` : '',
  ].join('')

  return { xml: `<item>${xml}</item>`, added: !base, titleRepaired: !!repaired && repaired !== base?.t }
}

/**
 * One feed per data source, split by `payment_type`: `buy` holds containers and
 * accessories alike, rental and rent-to-own only ever hold containers.
 */
export function buildMerchantFeeds(
  hits: FormattedContainerHit[],
  baseline: MerchantBaseline,
  origin: string,
): Record<MerchantFeedSource, BuiltMerchantFeed> {
  const out = {} as Record<MerchantFeedSource, BuiltMerchantFeed>

  for (const { source, paymentType } of MERCHANT_FEED_SOURCES) {
    const feed: BuiltMerchantFeed = { xml: '', items: 0, added: 0, titlesRepaired: 0, skipped: {} }
    const items: string[] = []
    for (const hit of hits) {
      if (getCustomFieldValue(hit, 'payment_type') !== paymentType) continue
      const productId = (hit as { product_id?: unknown }).product_id
      const item = itemXml(hit, paymentType, baseline[String(productId)], origin)
      if ('skip' in item) {
        feed.skipped[item.skip] = (feed.skipped[item.skip] ?? 0) + 1
        continue
      }
      items.push(item.xml)
      feed.items++
      if (item.added) feed.added++
      if (item.titleRepaired) feed.titlesRepaired++
    }
    feed.xml =
      `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel>` +
      `<title>OnsiteStorage</title><link>${esc(origin)}</link><description>Shipping containers and accessories from On-Site Storage Solutions.</description>` +
      `${items.join('')}</channel></rss>`
    out[source] = feed
  }
  return out
}
