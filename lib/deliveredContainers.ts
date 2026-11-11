import { DEFAULT_LOCATION } from '@/lib/constants'
import type { Depot } from '@/types/depot'
import type { ArchivedDelivery, DeliveredContainer } from '@/types/deliveredContainer'

/**
 * "Recently Delivered Containers": every source turned into one shape
 * (types/deliveredContainer.ts), merged, and filtered to a depot. Pure; the
 * reads are in services/deliveredContainer.service.ts.
 */

/** The depot fields this needs, so tests can pass a few records. */
type DepotLike = Pick<Depot, 'id' | 'title' | 'type' | 'city' | 'state'> & { satellites?: readonly { id: number }[] }

// ── Matching a place to a depot ──────────────────────────────────────────────

const REGIONS: Record<string, string> = {
  alabama: 'al', alaska: 'ak', arizona: 'az', arkansas: 'ar', california: 'ca', colorado: 'co', connecticut: 'ct',
  delaware: 'de', florida: 'fl', georgia: 'ga', hawaii: 'hi', idaho: 'id', illinois: 'il', indiana: 'in', iowa: 'ia',
  kansas: 'ks', kentucky: 'ky', louisiana: 'la', maine: 'me', maryland: 'md', massachusetts: 'ma', michigan: 'mi',
  minnesota: 'mn', mississippi: 'ms', missouri: 'mo', montana: 'mt', nebraska: 'ne', nevada: 'nv',
  'new hampshire': 'nh', 'new jersey': 'nj', 'new mexico': 'nm', 'new york': 'ny', 'north carolina': 'nc',
  'north dakota': 'nd', ohio: 'oh', oklahoma: 'ok', oregon: 'or', pennsylvania: 'pa', 'rhode island': 'ri',
  'south carolina': 'sc', 'south dakota': 'sd', tennessee: 'tn', texas: 'tx', utah: 'ut', vermont: 'vt',
  virginia: 'va', washington: 'wa', 'west virginia': 'wv', wisconsin: 'wi', wyoming: 'wy', alberta: 'ab',
  'british columbia': 'bc', manitoba: 'mb', 'nova scotia': 'ns', ontario: 'on', quebec: 'qc', saskatchewan: 'sk',
}
const REGION_CODES = new Set([...Object.values(REGIONS), 'dc', 'qb'])

/**
 * Places in the WordPress records that name no depot themselves: a misspelling,
 * a town a depot serves, or a whole state with one depot. Lower case, as
 * normalised. Ambiguous ones ("Texas", "Canada") are left unmatched.
 */
const PLACE_ALIASES: Record<string, string> = {
  tocoma: 'Tacoma, WA',
  boston: 'Worcester / Boston, MA',
  fallbrook: 'Temecula, CA',
  'sarasota county': 'Tampa, FL',
  'st petersburg': 'Tampa, FL',
  colorado: 'Denver, CO',
  maryland: 'Baltimore, MD',
  'new jersey': 'New York, NY / Newark, NJ',
  utah: 'Salt Lake City',
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z]+/g, ' ').trim()

/** "Salt Lake City Utah" → { city: 'salt lake city', region: 'ut' }; "Baltimore. MD" → { 'baltimore', 'md' }. */
function splitPlace(place: string): { city: string; region: string | null } {
  let city = norm(place)
  let region: string | null = null
  const code = city.match(/ ([a-z]{2})$/)
  if (code && REGION_CODES.has(code[1])) {
    region = code[1]
    city = city.slice(0, -3)
  } else {
    for (const [name, c] of Object.entries(REGIONS)) {
      if (city.endsWith(` ${name}`)) {
        region = c
        city = city.slice(0, -name.length - 1)
        break
      }
    }
  }
  return { city: city.trim(), region }
}

/** Each depot under every name it goes by: "Los Angeles / Long Beach, CA" is both "los angeles" and "long beach". */
function depotNames(depot: DepotLike): { name: string; region: string | null }[] {
  const names = depot.title.split('/').map((part) => splitPlace(part))
  const fallbackRegion = names.find((n) => n.region)?.region ?? (depot.state ? norm(depot.state) : null)
  return [...names, splitPlace(depot.city ?? '')]
    .filter((n) => n.city)
    .map((n) => ({ name: n.city, region: n.region ?? fallbackRegion }))
}

/**
 * The depot a place names ("Long Beach", "Atlanta, GA", "St.Louis"), or null.
 * A main depot wins over a virtual one of the same name (Columbus, OH over
 * Columbus, GA) unless the place gives the region.
 */
export function resolveDepotId(place: string | null | undefined, depots: readonly DepotLike[]): number | null {
  if (!place?.trim()) return null
  const candidates = depots.filter((d) => d.title !== DEFAULT_LOCATION)
  const byTitle = (title: string) => candidates.find((d) => d.title === title)?.id ?? null

  const whole = norm(place)
  if (PLACE_ALIASES[whole]) return byTitle(PLACE_ALIASES[whole])
  const { city, region } = splitPlace(place)
  if (PLACE_ALIASES[city]) return byTitle(PLACE_ALIASES[city])

  const named = candidates.filter((d) => depotNames(d).some((n) => n.name === city))
  // The region narrows a name two depots share (Columbus); a wrong one
  // ("Indianapolis, ID") does not undo a unique match.
  const inRegion = region ? named.filter((d) => depotNames(d).some((n) => n.name === city && (!n.region || n.region === region))) : []
  const matches = inRegion.length ? inRegion : named
  if (!matches.length) return null
  return (matches.find((d) => d.type === 'main') ?? matches[0]).id
}

/** A depot and the virtual depots it serves: what a location page's deliveries are filtered to. */
export function depotFamily(depotId: number, depots: readonly DepotLike[]): Set<number> {
  const depot = depots.find((d) => d.id === depotId)
  return new Set([depotId, ...(depot?.satellites ?? []).map((s) => s.id)])
}

// ── Each source, to one shape ────────────────────────────────────────────────

export function fromArchive(record: ArchivedDelivery, depots: readonly DepotLike[]): DeliveredContainer {
  return { ...record, source: 'archive', depotId: resolveDepotId(record.location, depots) }
}

type Raw = Record<string, unknown>

const text = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim() : typeof v === 'number' ? String(v) : null)
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && /^\d+$/.test(v) ? Number(v) : null)
const obj = (v: unknown): Raw | null => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Raw) : null)
const first = <T>(...values: (T | null | undefined)[]): T | null => values.find((v) => v !== null && v !== undefined) ?? null

/** A date in any form the backend may send ("2026-11-09", an ISO timestamp) → "YYYY-MM-DD", or null. */
function dateOnly(v: unknown): string | null {
  const s = text(v)
  if (!s) return null
  const iso = s.match(/^(\d{4}-\d{2}-\d{2})/)
  if (iso) return iso[1]
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10)
}

const httpsUrl = (v: unknown): string | null => {
  const s = text(v)
  return s && /^https:\/\//.test(s) ? s : null
}

/**
 * One record of the backend's delivered list → the card's shape, or null when
 * it lacks a title or a date.
 *
 * The backend's field names are not known yet (its list was empty when this
 * was written, 2026-11-10), so each field is read from the names it is likely
 * to use, flat or nested, in this order:
 *
 * | field       | read from                                                                        |
 * |-------------|----------------------------------------------------------------------------------|
 * | id          | `id`, `order_item_id`, `order_id`, `uuid`, `order_number`                          |
 * | title       | `product_title`, `title`, `product_name`, `name`, `product.title`, `product.name`  |
 * | deliveredOn | `delivered_at`, `delivered_on`, `delivery_date`, `date_delivered`, `date`, `updated_at`, `order.delivered_at` |
 * | location    | `location`, `depot_title`, `store_title`, `city`, `depot.title`, `store.title`, `shipping_city`, `shipping_address.city` |
 * | depotId     | `depot_id`, `store_id`, `depot.id`, `store.id`; else matched from `location`        |
 * | image       | `image`, `image_url`, `product_image`, `thumbnail`, `photo`, `product.image`, `product.images[0].src`, `images[0].src` |
 *
 * Nothing else is read, so a name, email or street address in the record never
 * reaches the page. Once a real record is seen, narrow this to its names.
 */
export function fromOrderRecord(raw: Raw, depots: readonly DepotLike[]): DeliveredContainer | null {
  const product = obj(raw.product)
  const depot = obj(raw.depot) ?? obj(raw.store)
  const order = obj(raw.order)
  const shipping = obj(raw.shipping_address)
  const images = (v: unknown) => (Array.isArray(v) ? (obj(v[0])?.src ?? obj(v[0])?.url ?? v[0]) : null)

  const id = first(text(raw.id), text(raw.order_item_id), text(raw.order_id), text(raw.uuid), text(raw.order_number))
  const title = first(text(raw.product_title), text(raw.title), text(raw.product_name), text(raw.name), text(product?.title), text(product?.name))
  const deliveredOn = first(
    dateOnly(raw.delivered_at), dateOnly(raw.delivered_on), dateOnly(raw.delivery_date), dateOnly(raw.date_delivered),
    dateOnly(raw.date), dateOnly(order?.delivered_at), dateOnly(raw.updated_at),
  )
  if (!title || !deliveredOn) return null

  const location =
    first(text(raw.location), text(raw.depot_title), text(raw.store_title), text(raw.city), text(depot?.title), text(raw.shipping_city), text(shipping?.city)) ?? ''
  const depotId = first(num(raw.depot_id), num(raw.store_id), num(depot?.id)) ?? resolveDepotId(location, depots)
  const image = first(
    httpsUrl(raw.image), httpsUrl(raw.image_url), httpsUrl(raw.product_image), httpsUrl(raw.thumbnail), httpsUrl(raw.photo),
    httpsUrl(product?.image), httpsUrl(images(product?.images)), httpsUrl(images(raw.images)),
  )

  return {
    id: `order-${id ?? `${title}-${deliveredOn}`.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    source: 'order',
    title,
    deliveredOn,
    // A depot title reads "Atlanta, GA"; the card shows the place, as the archive does.
    location: location.replace(/^Various North America$/i, ''),
    depotId,
    image,
  }
}

// ── Merging and filtering ────────────────────────────────────────────────────

export type DeliveredEdits = {
  /** Admin-added records, and admin edits of archive or order records (same id). */
  records: readonly DeliveredContainer[]
  /** Ids an admin hid. */
  hidden: ReadonlySet<string>
}

/**
 * Every source in one list, newest first: an admin edit replaces the record
 * with its id, hidden ones are dropped, and a repeated id is kept once.
 */
export function mergeDelivered(sources: readonly (readonly DeliveredContainer[])[], edits: DeliveredEdits): DeliveredContainer[] {
  const byId = new Map<string, DeliveredContainer>()
  for (const list of sources) for (const r of list) if (!byId.has(r.id)) byId.set(r.id, r)
  for (const r of edits.records) byId.set(r.id, r)
  return [...byId.values()]
    .filter((r) => !edits.hidden.has(r.id))
    .sort((a, b) => b.deliveredOn.localeCompare(a.deliveredOn) || a.id.localeCompare(b.id))
}

/** Only the records delivered from these depots. */
export function filterByDepots(list: readonly DeliveredContainer[], depotIds: ReadonlySet<number>): DeliveredContainer[] {
  return list.filter((r) => r.depotId !== null && depotIds.has(r.depotId))
}

/** "2026-11-09" → "November 9, 2026", as the WordPress cards read. */
export function formatDeliveredOn(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

// ── The admin form ───────────────────────────────────────────────────────────

/** Where a photo may live: the hosts next.config.ts lets next/image load. */
export const DELIVERED_IMAGE_HOSTS = ['onsite-cdn.sfo3.cdn.digitaloceanspaces.com', 'bbq-spaces.sfo3.cdn.digitaloceanspaces.com'] as const

export type DeliveredFormFields = {
  title: string
  deliveredOn: string
  location: string
  /** '' = matched from `location`. */
  depotId: string
  /** '' = no photo. */
  image: string
}

/**
 * Admin → Delivered Containers' form, checked: the record to store, or the
 * reason it can't be. `existing` is the record being edited (its id and source
 * are kept); without it this is a new admin record with `newId`.
 */
export function parseDeliveredForm(
  fields: DeliveredFormFields,
  depots: readonly DepotLike[],
  existing: DeliveredContainer | null,
  newId: string,
): { record: DeliveredContainer } | { error: string } {
  const title = fields.title.replace(/\s+/g, ' ').trim()
  const location = fields.location.replace(/\s+/g, ' ').trim()
  const image = fields.image.trim()
  if (!title) return { error: 'Give it a title (what was delivered).' }
  if (title.length > 120) return { error: 'Keep the title to 120 characters.' }
  if (location.length > 80) return { error: 'Keep the place to 80 characters.' }

  const date = fields.deliveredOn.trim()
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T00:00:00Z`) : null
  if (!parsed || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) return { error: 'Give the delivery date.' }
  if (date > new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)) return { error: 'The delivery date is in the future.' }

  let depotId: number | null
  if (fields.depotId.trim()) {
    depotId = Number(fields.depotId)
    if (!depots.some((d) => d.id === depotId && d.title !== DEFAULT_LOCATION)) return { error: 'Choose a depot from the list.' }
  } else {
    depotId = resolveDepotId(location, depots)
  }

  if (image) {
    let host = ''
    try {
      const url = new URL(image)
      host = url.protocol === 'https:' ? url.host : ''
    } catch {}
    if (!(DELIVERED_IMAGE_HOSTS as readonly string[]).includes(host)) {
      return { error: `The photo must be an https link on the CDN (${DELIVERED_IMAGE_HOSTS[0]}).` }
    }
  }

  return {
    record: {
      id: existing?.id ?? newId,
      source: existing?.source ?? 'admin',
      title,
      deliveredOn: date,
      location,
      depotId,
      image: image || null,
    },
  }
}
