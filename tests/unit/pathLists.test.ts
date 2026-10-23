// C1: the proxy's WordPress path and blog slug lists back off after a failed
// refresh, and a warm instance answers from its previous list while refreshing.
import { afterEach, beforeEach, describe, it, mock } from 'node:test'
import assert from 'node:assert/strict'

process.env.NEXT_OSS_BACKEND_URL = 'https://backend.test'
process.env.NEXT_OSS_BACKEND_KEY = 'test-key'

const realFetch = globalThis.fetch
let caseId = 0

/** A fresh copy of the module, so its module-scope cache starts empty. */
async function load<T>(path: string): Promise<T> {
  return import(`${new URL(path, import.meta.url).href}?case=${++caseId}`) as Promise<T>
}

type WpPaths = typeof import('@/lib/wpPaths')
type BlogSlugs = typeof import('@/lib/blogSlugs')

const PATHS = Array.from({ length: 250 }, (_, i) => ({ path: `/page-${i}/` }))
const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200 })

describe('wpPathMayExist', () => {
  beforeEach(() => mock.timers.enable({ apis: ['Date'], now: 1_000_000 }))
  afterEach(() => {
    mock.timers.reset()
    globalThis.fetch = realFetch
  })

  it('makes one request during a failure, not one per call, and lets paths through', async () => {
    const fetchMock = mock.fn(async () => {
      throw new Error('backend down')
    })
    globalThis.fetch = fetchMock as unknown as typeof fetch
    const { wpPathMayExist } = await load<WpPaths>('../../lib/wpPaths.ts')

    assert.equal(await wpPathMayExist('/anything'), true)
    assert.equal(await wpPathMayExist('/anything-else'), true)
    assert.equal(fetchMock.mock.callCount(), 1)

    // After the back-off it asks again.
    mock.timers.tick(61_000)
    await wpPathMayExist('/again')
    assert.equal(fetchMock.mock.callCount(), 2)
  })

  it('answers from the expired list at once and refreshes in the background', async () => {
    let release: (() => void) | undefined
    const fetchMock = mock.fn(async () => json({ pages: PATHS }))
    globalThis.fetch = fetchMock as unknown as typeof fetch
    const { wpPathMayExist } = await load<WpPaths>('../../lib/wpPaths.ts')

    // Cold instance: waits for the first list.
    assert.equal(await wpPathMayExist('/page-1'), true)
    assert.equal(await wpPathMayExist('/missing'), false)

    // List expires; the refresh hangs until released.
    mock.timers.tick(11 * 60 * 1000)
    fetchMock.mock.mockImplementation(
      () => new Promise<Response>((resolve) => (release = () => resolve(json({ pages: PATHS })))),
    )
    const handed: Promise<unknown>[] = []
    const answer = await wpPathMayExist('/missing', (p) => handed.push(p))
    assert.equal(answer, false, 'answered from the old list, without waiting')
    assert.equal(handed.length, 1, 'the refresh was handed to waitUntil')
    release!()
    await handed[0]
  })
})

describe('blogSlugMayExist', () => {
  afterEach(() => {
    mock.timers.reset()
    globalThis.fetch = realFetch
  })

  it('backs off after a failed list fetch', async () => {
    mock.timers.enable({ apis: ['Date'], now: 1_000_000 })
    const fetchMock = mock.fn(async () => new Response('down', { status: 503 }))
    globalThis.fetch = fetchMock as unknown as typeof fetch
    const { blogSlugMayExist } = await load<BlogSlugs>('../../lib/blogSlugs.ts')

    assert.equal(await blogSlugMayExist('some-post'), true)
    assert.equal(await blogSlugMayExist('another-post'), true)
    assert.equal(fetchMock.mock.callCount(), 1)
  })
})
