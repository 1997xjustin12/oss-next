import { parquetWriteBuffer } from 'hyparquet-writer'
import { FEED_BRAND, FEED_CURRENCY, toFeedOffer } from '@/lib/googleFeed'
import type { FormattedContainerHit } from '@/types/product'
import type { ColumnSource, SchemaElement } from 'hyparquet-writer'

/**
 * The catalog in OpenAI's product feed format, for ChatGPT shopping.
 *
 * Spec: https://developers.openai.com/commerce/specs/feed (read 2026-11-25).
 * ChatGPT's hosted URL and file upload take .parquet (their preferred format),
 * .jsonl.gz, .csv.gz, .tsv.gz, or uncompressed .csv/.tsv. Not XML, which is
 * why the Google feed's URL is rejected there.
 *
 * Each product is read by toFeedOffer() (lib/googleFeed.ts), the same reading
 * the Google feed uses, so the two feeds agree on id, price, condition and
 * stock. Only the field names and the rules below differ.
 *
 * ## Rental and rent-to-own listings are included (decided 2026-11-25)
 *
 * ~8,000 of the ~10,000 listings are priced per month. OpenAI's format has no
 * recurring or unit-price field, so `price` carries the monthly figure bare;
 * the title ends "— Rent-to-Own (monthly)" and the description states the
 * per-month price and the full-term total. Included on purpose, to see how
 * ChatGPT treats them. The alternative considered was grouping each
 * container's buy / rent / rent-to-own listings as variants (`group_id` +
 * `variant_dict`), which puts "per month" in the option label.
 */

/**
 * The store every link in the file points at, whatever server it was
 * built on. The file's only use is ChatGPT, so a copy taken from a local or
 * preview server must still send shoppers to the live store, not to that
 * server's own base URL.
 */
export const OPENAI_FEED_ORIGIN = 'https://onsitestorage.com'

export type OpenAiFeedItem = {
  item_id: string
  title: string
  description: string
  url: string
  brand: string
  seller_name: string
  seller_url: string
  image_url: string
  additional_image_urls?: string[]
  availability: 'in_stock' | 'out_of_stock'
  price: string
  condition: 'new' | 'used'
  product_category?: string
  target_countries: ['US']
  store_country: 'US'
  is_eligible_search: true
  /** Instant Checkout needs a separate integration and policy URLs, so off. */
  is_eligible_checkout: false
}

/**
 * The feed's rows.
 *
 * `item_id` must be unique in the feed. A few catalogue records share a SKU
 * (the Indianapolis listings exist under both an `-in` and an `-id` handle),
 * so the first one wins and the rest are dropped rather than sent as
 * conflicting rows.
 */
export function buildOpenAiFeedItems(
  hits: FormattedContainerHit[],
  origin: string = OPENAI_FEED_ORIGIN,
): OpenAiFeedItem[] {
  const seen = new Set<string>()
  const items: OpenAiFeedItem[] = []

  for (const hit of hits) {
    const offer = toFeedOffer(hit)
    if (!offer || seen.has(offer.id)) continue
    seen.add(offer.id)

    const [image, ...more] = offer.images
    items.push({
      item_id: offer.id,
      title: offer.title,
      description: offer.description,
      url: `${origin}${offer.path}`,
      brand: FEED_BRAND,
      seller_name: FEED_BRAND,
      seller_url: origin,
      image_url: image,
      ...(more.length ? { additional_image_urls: more } : {}),
      availability: offer.inStock ? 'in_stock' : 'out_of_stock',
      price: `${offer.price.toFixed(2)} ${FEED_CURRENCY}`,
      condition: offer.condition,
      ...(offer.category ? { product_category: offer.category } : {}),
      target_countries: ['US'],
      store_country: 'US',
      is_eligible_search: true,
      is_eligible_checkout: false,
    })
  }

  return items
}

const STRING_FIELDS = [
  'item_id',
  'title',
  'description',
  'url',
  'brand',
  'seller_name',
  'seller_url',
  'image_url',
  'availability',
  'price',
  'condition',
  'store_country',
] as const

/** A Parquet list of strings: the standard three-level LIST layout. */
function stringList(name: string, required: boolean): SchemaElement[] {
  return [
    {
      name,
      repetition_type: required ? 'REQUIRED' : 'OPTIONAL',
      num_children: 1,
      converted_type: 'LIST',
      logical_type: { type: 'LIST' },
    },
    { name: 'list', repetition_type: 'REPEATED', num_children: 1 },
    { name: 'element', type: 'BYTE_ARRAY', converted_type: 'UTF8', repetition_type: 'REQUIRED' },
  ]
}

/**
 * The rows as a Parquet file.
 *
 * The schema is spelled out because the library's guessing would store the
 * two list fields (`target_countries`, `additional_image_urls`) as JSON text
 * rather than as Parquet lists, which a reader expecting a list may reject.
 */
export function toParquet(items: readonly OpenAiFeedItem[]): Uint8Array<ArrayBuffer> {
  const columnData: ColumnSource[] = [
    ...STRING_FIELDS.map((name) => ({ name, data: items.map((item) => item[name]) })),
    { name: 'product_category', data: items.map((item) => item.product_category ?? null) },
    { name: 'additional_image_urls', data: items.map((item) => item.additional_image_urls ?? null) },
    { name: 'target_countries', data: items.map((item) => item.target_countries) },
    { name: 'is_eligible_search', data: items.map((item) => item.is_eligible_search) },
    { name: 'is_eligible_checkout', data: items.map((item) => item.is_eligible_checkout) },
  ]

  const schema: SchemaElement[] = [
    { name: 'root', num_children: columnData.length },
    ...STRING_FIELDS.map(
      (name): SchemaElement => ({ name, type: 'BYTE_ARRAY', converted_type: 'UTF8', repetition_type: 'REQUIRED' }),
    ),
    { name: 'product_category', type: 'BYTE_ARRAY', converted_type: 'UTF8', repetition_type: 'OPTIONAL' },
    ...stringList('additional_image_urls', false),
    ...stringList('target_countries', true),
    { name: 'is_eligible_search', type: 'BOOLEAN', repetition_type: 'REQUIRED' },
    { name: 'is_eligible_checkout', type: 'BOOLEAN', repetition_type: 'REQUIRED' },
  ]

  return new Uint8Array(parquetWriteBuffer({ columnData, schema }))
}
