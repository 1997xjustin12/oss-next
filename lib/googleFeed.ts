import { getCustomFieldValue, isContainerHit, isGenericDisplayHit, isInStockHit } from '@/lib/pricing'
import type { FormattedContainerHit, ProductHit } from '@/types/product'

// Builds a Google Merchant Center product feed (RSS 2.0 + g: namespace) from
// formatted ES product hits. Pure string building — no I/O — so it's easy to
// reason about and the route handler just fetches + calls buildMerchantFeed.

const BRAND = 'On-Site Storage Solutions'
const CURRENCY = 'USD'
const TITLE_MAX = 150
const DESC_MAX = 4000

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function clean(s: string): string {
  // Product titles use `||` to join the two halves of the name; make it read
  // as one phrase and collapse whitespace.
  return s.replace(/\s*\|\|\s*/g, ' — ').replace(/\s+/g, ' ').trim()
}

function truncate(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max - 1).trimEnd() + '…'
}

/** Map the WordPress/ES condition to Google's enum (new | used | refurbished). */
function mapCondition(raw: string, isContainer: boolean): 'new' | 'used' {
  if (/new|one[\s-]?trip/i.test(raw)) return 'new'
  if (/used|wwt|wind|cargo|as[\s-]?is/i.test(raw)) return 'used'
  // Accessories with no stated condition are new; containers default to used.
  return isContainer ? 'used' : 'new'
}

/** One <item>, or null to skip products that can't be a valid Merchant offer. */
function itemXml(hit: FormattedContainerHit, origin: string): string | null {
  // Generic/display-only template pages aren't purchasable.
  if (isGenericDisplayHit(hit)) return null

  // FormattedContainerHit is loosely typed (Record<string, unknown>); the typed
  // ProductHit view gives real field access for the same underlying object.
  const p = hit as unknown as ProductHit
  const handle = p.handle
  const title = clean(p.title ?? '')
  const image = p.images?.[0]?.src
  const price = hit.sale_price

  // Merchant requires id, title, link, image, and a positive price.
  if (!handle || !title || !image || !Number.isFinite(price) || price <= 0) return null

  const container = isContainerHit(hit)
  const paymentType = getCustomFieldValue(hit, 'payment_type')
  const monthly = paymentType === 'rental' || paymentType === 'rto'
  const cadence = paymentType === 'rto' ? 'Rent-to-Own' : 'Rental'
  const condition = mapCondition(getCustomFieldValue(hit, 'condition'), container)
  const grade = getCustomFieldValue(hit, 'grade')
  const location = getCustomFieldValue(hit, 'location')
  const category = p.product_category?.[0]?.category_name ?? ''
  const sku = p.variants?.[0]?.sku?.trim() ?? ''

  const displayTitle = truncate(monthly ? `${title} — ${cadence} (monthly)` : title, TITLE_MAX)

  const description = truncate(
    [
      title + '.',
      `${condition === 'new' ? 'New' : 'Used'}${grade ? ` (${grade})` : ''}${
        location ? `, available in ${location}` : ''
      }.`,
      monthly ? `Priced per month (${cadence}).` : '',
    ]
      .filter(Boolean)
      .join(' '),
    DESC_MAX,
  )

  const rows = [
    ['g:id', sku || handle],
    ['g:title', displayTitle],
    ['g:description', description],
    ['g:link', `${origin}/product/${handle}`],
    ['g:image_link', image],
    ['g:availability', isInStockHit(hit) ? 'in_stock' : 'out_of_stock'],
    ['g:price', `${price.toFixed(2)} ${CURRENCY}`],
    ['g:condition', condition],
    ['g:brand', BRAND],
    // Shipping containers have no GTIN/MPN — tell Google so it doesn't require one.
    ['g:identifier_exists', 'no'],
    ...(category ? [['g:product_type', category] as [string, string]] : []),
  ] as [string, string][]

  const body = rows.map(([tag, val]) => `    <${tag}>${esc(String(val))}</${tag}>`).join('\n')
  return `  <item>\n${body}\n  </item>`
}

/** Full RSS document. `origin` should be the absolute production base URL. */
export function buildMerchantFeed(hits: FormattedContainerHit[], origin: string): string {
  const items = hits
    .map((h) => itemXml(h, origin))
    .filter((x): x is string => x !== null)
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>${esc(BRAND)} — Products</title>
  <link>${esc(origin)}</link>
  <description>Shipping containers and accessories from ${esc(BRAND)}.</description>
${items}
</channel>
</rss>`
}
