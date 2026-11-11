// "Recently Delivered Containers" (lib/deliveredContainers.ts): the WordPress
// archive, the backend's delivered orders and admin records in one shape,
// matched to depots, merged, and filtered to a location page's depots.
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const { DELIVERED_CONTAINERS_ARCHIVE } = await import('@/lib/data/deliveredContainersArchive')
const { DEPOT_SNAPSHOT } = await import('@/config/depotCoordinates')
const lib = await import('@/lib/deliveredContainers')
const { resolveDepotId, depotFamily, fromArchive, fromOrderRecord, mergeDelivered, filterByDepots, parseDeliveredForm, formatDeliveredOn } = lib

const id = (title: string) => DEPOT_SNAPSHOT.find((d) => d.title === title)!.id
const at = (place: string) => {
  const found = resolveDepotId(place, DEPOT_SNAPSHOT)
  return found === null ? null : DEPOT_SNAPSHOT.find((d) => d.id === found)!.title
}

describe('the WordPress archive', () => {
  it('holds all 616 records, unique, dated, with CDN photos', () => {
    assert.equal(DELIVERED_CONTAINERS_ARCHIVE.length, 616)
    assert.equal(new Set(DELIVERED_CONTAINERS_ARCHIVE.map((r) => r.id)).size, 616)
    for (const r of DELIVERED_CONTAINERS_ARCHIVE) {
      assert.match(r.deliveredOn, /^\d{4}-\d{2}-\d{2}$/)
      assert.ok(r.title)
      assert.match(r.image ?? '', /^https:\/\/onsite-cdn\.sfo3\.cdn\.digitaloceanspaces\.com\//)
    }
  })

  it('matches all but the three that name only a country or a state', () => {
    const unmatched = DELIVERED_CONTAINERS_ARCHIVE.map((r) => fromArchive(r, DEPOT_SNAPSHOT)).filter((r) => r.depotId === null)
    assert.deepEqual([...new Set(unmatched.map((r) => r.location))].sort(), ['Canada', 'Texas'])
  })
})

describe('resolveDepotId', () => {
  it('reads the place however WordPress wrote it', () => {
    assert.equal(at('Atlanta'), 'Atlanta, GA')
    assert.equal(at('Atlanta, GA'), 'Atlanta, GA')
    assert.equal(at('Baltimore. MD'), 'Baltimore, MD')
    assert.equal(at('St.Louis'), 'St. Louis, MO')
    assert.equal(at('Salt Lake City Utah'), 'Salt Lake City')
    assert.equal(at('Indianapolis, ID'), 'Indianapolis, IN')
    assert.equal(at('Montreal, QB'), 'Montreal, QB')
  })

  it('finds the depot a combined title names', () => {
    assert.equal(at('Long Beach'), 'Los Angeles / Long Beach, CA')
    assert.equal(at('Newark'), 'New York, NY / Newark, NJ')
    assert.equal(at('Oakland, CA'), 'San Francisco / Oakland, CA')
  })

  it('a main depot over a virtual one of the same name, unless the state says otherwise', () => {
    assert.equal(at('Columbus'), 'Columbus, OH')
    assert.equal(at('Columbus, GA'), 'Columbus, GA')
  })

  it('aliases, and nothing for what names no single depot', () => {
    assert.equal(at('Tocoma, WA'), 'Tacoma, WA')
    assert.equal(at('Fallbrook'), 'Temecula, CA')
    assert.equal(at('Maryland'), 'Baltimore, MD')
    assert.equal(at('Texas'), null)
    assert.equal(at('Canada'), null)
    assert.equal(at(''), null)
    assert.equal(at('Various North America'), null)
  })
})

describe('a location page: its depot and the virtual depots it serves', () => {
  it('Atlanta includes Alpharetta (virtual, served from Atlanta)', () => {
    const family = depotFamily(id('Atlanta, GA'), DEPOT_SNAPSHOT)
    assert.ok(family.has(id('Atlanta, GA')))
    assert.ok(family.has(id('Alpharetta, GA')))
    assert.ok(!family.has(id('Charlotte, NC')))
  })

  it('Los Angeles includes Wildomar and Temecula deliveries; Houston includes Austin', () => {
    const all = DELIVERED_CONTAINERS_ARCHIVE.map((r) => fromArchive(r, DEPOT_SNAPSHOT))
    const la = filterByDepots(all, depotFamily(id('Los Angeles / Long Beach, CA'), DEPOT_SNAPSHOT))
    assert.ok(la.some((r) => r.location === 'Wildomar'))
    assert.ok(la.some((r) => r.location === 'Fallbrook'))
    assert.ok(la.some((r) => r.location === 'Long Beach'))
    const houston = filterByDepots(all, depotFamily(id('Houston, TX'), DEPOT_SNAPSHOT))
    assert.ok(houston.some((r) => r.location.startsWith('Austin')))
    assert.ok(houston.every((r) => r.depotId !== null))
  })
})

describe('fromOrderRecord (the backend’s field names are not known yet)', () => {
  it('reads the likely flat names', () => {
    const card = fromOrderRecord(
      { id: 77, product_title: "Used 40' High Cube", delivered_at: '2026-11-20T15:04:05Z', depot_id: 4, image_url: 'https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/a.png' },
      DEPOT_SNAPSHOT,
    )
    assert.deepEqual(card, {
      id: 'order-77', source: 'order', title: "Used 40' High Cube", deliveredOn: '2026-11-20', location: '', depotId: 4,
      image: 'https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/a.png',
    })
  })

  it('reads nested names, and matches the depot from the place when no id is given', () => {
    const card = fromOrderRecord(
      { order_id: 'A1', product: { name: 'New 20ft', images: [{ src: 'https://x.test/p.png' }] }, delivery_date: '2026-11-21', depot: { title: 'Dallas, TX' } },
      DEPOT_SNAPSHOT,
    )!
    assert.equal(card.title, 'New 20ft')
    assert.equal(card.location, 'Dallas, TX')
    assert.equal(card.depotId, id('Dallas, TX'))
    assert.equal(card.image, 'https://x.test/p.png')
  })

  it('never carries a customer’s details, and drops a record without a title or date', () => {
    const card = fromOrderRecord(
      { id: 1, title: 'X', delivered_at: '2026-11-01', customer_name: 'Jane Doe', email: 'j@x.test', street: '1 Main St', phone: '555' },
      DEPOT_SNAPSHOT,
    )!
    assert.deepEqual(Object.keys(card).sort(), ['deliveredOn', 'depotId', 'id', 'image', 'location', 'source', 'title'])
    assert.ok(!JSON.stringify(card).includes('Jane'))
    assert.equal(fromOrderRecord({ id: 2, delivered_at: '2026-11-01' }, DEPOT_SNAPSHOT), null)
    assert.equal(fromOrderRecord({ id: 3, title: 'Y' }, DEPOT_SNAPSHOT), null)
    // A non-https photo is not used.
    assert.equal(fromOrderRecord({ id: 4, title: 'Z', date: '2026-11-01', image: 'http://x.test/a.png' }, DEPOT_SNAPSHOT)!.image, null)
  })
})

describe('mergeDelivered', () => {
  const rec = (rid: string, deliveredOn: string, source: 'archive' | 'order' | 'admin' = 'archive') =>
    ({ id: rid, source, title: rid, deliveredOn, location: '', depotId: null, image: null }) as const

  it('newest first; an edit replaces its record; hidden ones go', () => {
    const merged = mergeDelivered([[rec('order-1', '2026-11-10', 'order')], [rec('wp-a', '2026-01-01'), rec('wp-b', '2025-05-05')]], {
      records: [{ ...rec('wp-a', '2026-01-01'), title: 'Edited' }, rec('admin-x', '2026-11-11', 'admin')],
      hidden: new Set(['wp-b']),
    })
    assert.deepEqual(merged.map((r) => r.id), ['admin-x', 'order-1', 'wp-a'])
    assert.equal(merged.find((r) => r.id === 'wp-a')!.title, 'Edited')
  })
})

describe('parseDeliveredForm (Admin → Delivered Containers)', () => {
  const fields = { title: "  Used 40'  High Cube ", deliveredOn: '2026-11-05', location: 'Long Beach', depotId: '', image: '' }

  it('a new record matches its depot from the place', () => {
    const out = parseDeliveredForm(fields, DEPOT_SNAPSHOT, null, 'admin-1')
    assert.ok('record' in out)
    assert.deepEqual(out.record, {
      id: 'admin-1', source: 'admin', title: "Used 40' High Cube", deliveredOn: '2026-11-05', location: 'Long Beach',
      depotId: id('Los Angeles / Long Beach, CA'), image: null,
    })
  })

  it('an edit keeps its id and source; a chosen depot wins', () => {
    const existing = fromArchive(DELIVERED_CONTAINERS_ARCHIVE[0], DEPOT_SNAPSHOT)
    const out = parseDeliveredForm({ ...fields, depotId: String(id('Dallas, TX')) }, DEPOT_SNAPSHOT, existing, 'admin-unused')
    assert.ok('record' in out)
    assert.equal(out.record.id, existing.id)
    assert.equal(out.record.source, 'archive')
    assert.equal(out.record.depotId, id('Dallas, TX'))
  })

  it('refuses what it cannot show', () => {
    const bad = (over: Partial<typeof fields>) => 'error' in parseDeliveredForm({ ...fields, ...over }, DEPOT_SNAPSHOT, null, 'admin-1')
    assert.ok(bad({ title: '  ' }))
    assert.ok(bad({ deliveredOn: '2026-02-30' }))
    assert.ok(bad({ deliveredOn: '2999-01-01' }))
    assert.ok(bad({ depotId: '999999' }))
    assert.ok(bad({ depotId: String(id('Various North America')) }))
    assert.ok(bad({ image: 'http://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/a.png' }))
    assert.ok(bad({ image: 'https://example.com/a.png' }))
    assert.ok(!bad({ image: 'https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/a.png' }))
  })
})

it('formatDeliveredOn reads as the WordPress cards did', () => {
  assert.equal(formatDeliveredOn('2026-11-09'), 'November 9, 2026')
})
