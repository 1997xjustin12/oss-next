import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_TAGS, SHELL_OUTAGE_CACHE_LIFE } from '@/config/cache'
import { DEPOT_SNAPSHOT } from '@/config/depotCoordinates'
import { STORE_KEY } from '@/config/store'
import { DELIVERED_CONTAINERS_ARCHIVE } from '@/lib/data/deliveredContainersArchive'
import { depotFamily, filterByDepots, fromArchive, fromOrderRecord, mergeDelivered, type DeliveredEdits } from '@/lib/deliveredContainers'
import { getRedisClient } from '@/lib/redis'
import { fetchDeliveredProducts } from '@/services/deliveredProduct.service'
import type { DeliveredContainer } from '@/types/deliveredContainer'

/**
 * "Recently Delivered Containers": one list from three sources
 * (types/deliveredContainer.ts), newest first.
 *
 * - The WordPress archive (616 records, lib/data/deliveredContainersArchive.ts).
 * - The backend's delivered orders (services/deliveredProduct.service.ts).
 * - Admin → Delivered Containers: records added by hand, edits to any record,
 *   and hidden ids, in Redis.
 *
 * Places are matched to depots with the app's depot copy
 * (config/depotCoordinates.ts): ids and virtual-depot links are the backend's,
 * and it needs no request. A location page shows its depot's deliveries and
 * those of the virtual depots it serves.
 *
 * Each source fails on its own: no orders or no Redis still shows the archive.
 */

const KEY = `oss-next:${STORE_KEY}:delivered`
/** Hash: id → JSON DeliveredContainer (admin records, and admin edits by id). */
export const DELIVERED_RECORDS_KEY = `${KEY}:records`
/** Set: ids an admin hid. */
export const DELIVERED_HIDDEN_KEY = `${KEY}:hidden`

/** The backend's pages are walked up to this many records. */
const MAX_ORDER_RECORDS = 1000
const ORDER_PAGE_SIZE = 100

function parseRecord(value: unknown): DeliveredContainer | null {
  const r = (typeof value === 'string' ? JSON.parse(value) : value) as DeliveredContainer | null
  return r && typeof r.id === 'string' && typeof r.title === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(r.deliveredOn) ? r : null
}

/** Admin records, edits and hidden ids, straight from Redis. Throws when Redis can't be read. */
export async function readDeliveredEdits(): Promise<DeliveredEdits> {
  const redis = getRedisClient()
  const [hash, hidden] = await Promise.all([
    redis.hgetall<Record<string, unknown>>(DELIVERED_RECORDS_KEY),
    redis.smembers(DELIVERED_HIDDEN_KEY),
  ])
  const records = Object.values(hash ?? {}).flatMap((v) => {
    try {
      return parseRecord(v) ?? []
    } catch {
      return []
    }
  })
  return { records, hidden: new Set(hidden ?? []) }
}

/** Every delivered order the backend lists, mapped to cards. Throws when the backend can't be read. */
async function readDeliveredOrders(): Promise<DeliveredContainer[]> {
  const out: DeliveredContainer[] = []
  for (let page = 1; out.length < MAX_ORDER_RECORDS; page++) {
    const { results, next } = await fetchDeliveredProducts(page, ORDER_PAGE_SIZE)
    for (const raw of results) {
      const card = raw && typeof raw === 'object' ? fromOrderRecord(raw, DEPOT_SNAPSHOT) : null
      if (card) out.push(card)
    }
    if (!next || !results.length) break
  }
  return out
}

/** The archive, as cards. */
export function archivedDeliveries(): DeliveredContainer[] {
  return DELIVERED_CONTAINERS_ARCHIVE.map((r) => fromArchive(r, DEPOT_SNAPSHOT))
}

/**
 * Every delivery to show, newest first. Cached for hours, shared by every
 * visitor; an admin save busts the tag at once. A source that fails is left
 * out, and the list is then kept only briefly so it returns soon.
 */
export async function getDeliveredContainers(): Promise<DeliveredContainer[]> {
  'use cache'
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.DELIVERED)

  let failed = false
  const [orders, edits] = await Promise.all([
    readDeliveredOrders().catch((err) => {
      console.error('[delivered] backend delivered orders unavailable, showing the rest:', err)
      failed = true
      return [] as DeliveredContainer[]
    }),
    readDeliveredEdits().catch((err) => {
      console.error('[delivered] admin edits unavailable, showing the rest:', err)
      failed = true
      return { records: [], hidden: new Set<string>() } satisfies DeliveredEdits
    }),
  ])
  if (failed) cacheLife(SHELL_OUTAGE_CACHE_LIFE)
  else cacheLife('hours')
  return mergeDelivered([orders, archivedDeliveries()], edits)
}

/** The deliveries for a location page: its depot's, and those of the virtual depots it serves. */
export async function getDeliveredForDepot(depotId: number): Promise<DeliveredContainer[]> {
  return filterByDepots(await getDeliveredContainers(), depotFamily(depotId, DEPOT_SNAPSHOT))
}

// ── Admin (Admin → Delivered Containers; each action re-checks access) ──────

export type DeliveredAdminList = {
  /** Every record, hidden ones included, newest first; edits applied. */
  records: DeliveredContainer[]
  hidden: Set<string>
  /** Ids an admin added or edited (the hash). */
  edited: Set<string>
  /** Whether each source could be read. */
  ordersOk: boolean
}

/** Everything, for the admin list: the edits read fresh, the orders from their short cache. Throws when Redis can't be read. */
export async function readDeliveredForAdmin(): Promise<DeliveredAdminList> {
  const [edits, orders] = await Promise.all([
    readDeliveredEdits(),
    readDeliveredOrders().then(
      (list) => ({ list, ok: true }),
      (err) => {
        console.error('[delivered] admin: backend delivered orders unavailable:', err)
        return { list: [] as DeliveredContainer[], ok: false }
      },
    ),
  ])
  return {
    records: mergeDelivered([orders.list, archivedDeliveries()], { records: edits.records, hidden: new Set() }),
    hidden: new Set(edits.hidden),
    edited: new Set(edits.records.map((r) => r.id)),
    ordersOk: orders.ok,
  }
}

// ── Admin writes ─────────────────────────────────────────────────────────────

export async function saveDeliveredRecord(record: DeliveredContainer): Promise<void> {
  await getRedisClient().hset(DELIVERED_RECORDS_KEY, { [record.id]: JSON.stringify(record) })
}

/** Removes an admin record, or an admin edit (the original then shows again). */
export async function deleteDeliveredRecord(id: string): Promise<void> {
  await getRedisClient().hdel(DELIVERED_RECORDS_KEY, id)
}

export async function setDeliveredHidden(id: string, hidden: boolean): Promise<void> {
  const redis = getRedisClient()
  if (hidden) await redis.sadd(DELIVERED_HIDDEN_KEY, id)
  else await redis.srem(DELIVERED_HIDDEN_KEY, id)
}
