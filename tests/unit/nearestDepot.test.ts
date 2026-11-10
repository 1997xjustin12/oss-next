// Which depot a point resolves to (lib/nearestDepot.ts) and where the depot
// list comes from (services/depot.service.ts): never "Various North America",
// virtual depots only when allowed, and the app's copy when the backend fails.
import { afterEach, describe, it, mock } from 'node:test'
import assert from 'node:assert/strict'

process.env.NEXT_OSS_BACKEND_URL = 'https://backend.test'
process.env.NEXT_OSS_BACKEND_KEY = 'test-key'

mock.module('next/cache', { namedExports: { cacheLife: () => {}, cacheTag: () => {} } })

const { depotCandidates, findNearestDepot } = await import('@/lib/nearestDepot')
const { DEPOT_SNAPSHOT } = await import('@/config/depotCoordinates')
const { DEFAULT_LOCATION } = await import('@/lib/constants')
const { getDepots, fetchDepotById } = await import('@/services/depot.service')
type Depot = (typeof DEPOT_SNAPSHOT)[number]

const depot = (over: Partial<Depot>): Depot => ({
  id: 1, external_id: 1, title: 'X', type: 'main', main_depot: null, satellites: [], street: '', city: '', state: '',
  postal_code: '', country: '', latitude: 10, longitude: 10, phone: '', fax: '', email: '', website: '', page_path: '',
  hours: null, rates: null, ...over,
})

const nearest = (lat: number, lon: number, includeVirtual: boolean) =>
  findNearestDepot(lat, lon, depotCandidates(DEPOT_SNAPSHOT, includeVirtual))?.title

describe('depotCandidates', () => {
  it('never offers the placeholder, a depot without a position, or (when off) a virtual depot', () => {
    const list = [
      depot({ title: DEFAULT_LOCATION }),
      depot({ title: 'Nowhere', latitude: 0, longitude: 0 }),
      depot({ title: 'Broken', latitude: Number.NaN }),
      depot({ title: 'Virtual', type: 'virtual' }),
      depot({ title: 'Main' }),
    ]
    assert.deepEqual(depotCandidates(list, false).map((d) => d.title), ['Main'])
    assert.deepEqual(depotCandidates(list, true).map((d) => d.title), ['Virtual', 'Main'])
  })

  it('the app copy holds every backend depot, the placeholder included', () => {
    assert.ok(DEPOT_SNAPSHOT.length >= 140)
    assert.ok(DEPOT_SNAPSHOT.some((d) => d.title === DEFAULT_LOCATION))
    assert.ok(DEPOT_SNAPSHOT.some((d) => d.type === 'virtual'))
  })
})

describe('findNearestDepot (haversine) on the real list', () => {
  it('10001 (Manhattan) is New York / Newark, with or without virtual depots', () => {
    assert.equal(nearest(40.7484, -73.9967, false), 'New York, NY / Newark, NJ')
    assert.equal(nearest(40.7484, -73.9967, true), 'New York, NY / Newark, NJ')
  })

  it('at a virtual depot: that depot when allowed, else the nearest main depot', () => {
    const abilene = DEPOT_SNAPSHOT.find((d) => d.title === 'Abilene, TX')!
    assert.equal(nearest(abilene.latitude, abilene.longitude, true), 'Abilene, TX')
    const off = nearest(abilene.latitude, abilene.longitude, false)!
    assert.equal(DEPOT_SNAPSHOT.find((d) => d.title === off)?.type, 'main')
  })

  it('never answers "Various North America", anywhere in the US or Canada', () => {
    for (let lat = 25; lat <= 60; lat += 2.5) {
      for (let lon = -130; lon <= -60; lon += 2.5) {
        for (const virtual of [true, false]) assert.notEqual(nearest(lat, lon, virtual), DEFAULT_LOCATION)
      }
    }
  })

  it('stays in the visitor’s country: Winnipeg gets a Canadian depot, not Minneapolis', () => {
    const winnipeg = DEPOT_SNAPSHOT.find((d) => d.title.startsWith('Winnipeg'))!
    const candidates = depotCandidates(DEPOT_SNAPSHOT, false)
    assert.equal(findNearestDepot(winnipeg.latitude, winnipeg.longitude, candidates)?.title, 'Minneapolis, MN')
    for (const country of ['ca', 'CA', 'Canada']) {
      const title = findNearestDepot(winnipeg.latitude, winnipeg.longitude, candidates, country)!.title
      assert.equal(DEPOT_SNAPSHOT.find((d) => d.title === title)?.country, 'Canada', country)
    }
    // 10001 is unaffected; a country without depots falls back to all of them.
    assert.equal(findNearestDepot(40.7484, -73.9967, candidates, 'us')?.title, 'New York, NY / Newark, NJ')
    assert.equal(findNearestDepot(40.7484, -73.9967, candidates, 'mx')?.title, 'New York, NY / Newark, NJ')
  })

  it('no candidates, or no position: null', () => {
    assert.equal(findNearestDepot(40, -74, []), null)
    assert.equal(findNearestDepot(Number.NaN, -74, depotCandidates(DEPOT_SNAPSHOT, false)), null)
  })
})

describe('the depot list (services/depot.service.ts)', () => {
  const realFetch = globalThis.fetch
  afterEach(() => {
    globalThis.fetch = realFetch
  })

  it('reads the backend when it answers', async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ count: 1, next: null, results: [depot({ title: 'Live' })] }), { status: 200 })) as typeof fetch
    const { depots, source } = await getDepots()
    assert.equal(source, 'live')
    assert.deepEqual(depots.map((d) => d.title), ['Live'])
  })

  it('falls back to the app copy when the backend fails', async () => {
    globalThis.fetch = (async () => {
      throw new Error('ECONNREFUSED')
    }) as typeof fetch
    const { depots, source } = await getDepots()
    assert.equal(source, 'snapshot')
    assert.equal(depots.length, DEPOT_SNAPSHOT.length)

    const one = await fetchDepotById(DEPOT_SNAPSHOT[0].id)
    assert.equal(one.source, 'snapshot')
    assert.equal(one.depot?.title, DEPOT_SNAPSHOT[0].title)
  })

  it('a depot the backend does not have is a 404, not a fallback', async () => {
    globalThis.fetch = (async () => new Response('{"detail":"No Depot"}', { status: 404 })) as typeof fetch
    assert.deepEqual(await fetchDepotById(999999), { depot: null, source: 'live' })
  })
})
