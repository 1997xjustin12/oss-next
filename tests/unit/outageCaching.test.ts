// C4: a backend or Elasticsearch failure is cached briefly (OUTAGE_CACHE_LIFE),
// never for days or hours as "not found". Each reader sets its cache life with
// one cacheLife() call per invocation; these tests record those calls.
import { afterEach, describe, it, mock } from 'node:test'
import assert from 'node:assert/strict'

process.env.NEXT_OSS_BACKEND_URL = 'https://backend.test'
process.env.NEXT_OSS_BACKEND_KEY = 'test-key'
process.env.ELASTICSEARCH_URL ??= 'https://es.test'

const lifetimes: unknown[] = []
mock.module('next/cache', {
  namedExports: {
    cacheLife: (life: unknown) => lifetimes.push(life),
    cacheTag: () => {},
  },
})

let esSearch: (args: unknown) => Promise<unknown> = async () => ({ hits: { hits: [] } })
mock.module('@elastic/elasticsearch', {
  namedExports: {
    Client: class {
      search(args: unknown) {
        return esSearch(args)
      }
    },
  },
})

const { OUTAGE_CACHE_LIFE } = await import('@/config/cache')
const { fetchWpPage } = await import('@/services/wp-pages.service')
const { getProductByHandle, getProductsByIds } = await import('@/services/search.service')
const { getCachedBlog } = await import('@/services/blog.service')

const realFetch = globalThis.fetch
const respond = (status: number, body: unknown = {}) =>
  (async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch

/** The lifetime the outermost function chose: its call comes last. */
const outerLife = () => lifetimes.at(-1)

afterEach(() => {
  globalThis.fetch = realFetch
  lifetimes.length = 0
})

describe('WordPress pages (fetchWpPage)', () => {
  it('a network failure: null, cached for the outage life', async () => {
    globalThis.fetch = (async () => {
      throw new Error('ECONNREFUSED')
    }) as unknown as typeof fetch
    assert.equal(await fetchWpPage(['some-page']), null)
    assert.deepEqual(outerLife(), OUTAGE_CACHE_LIFE)
  })

  it('a 5xx: null, cached for the outage life (it used to throw)', async () => {
    globalThis.fetch = respond(502, { detail: 'bad gateway' })
    assert.equal(await fetchWpPage(['some-page']), null)
    assert.deepEqual(outerLife(), OUTAGE_CACHE_LIFE)
  })

  it('a real 404: null, cached for days', async () => {
    globalThis.fetch = respond(404)
    assert.equal(await fetchWpPage(['no-such-page']), null)
    assert.equal(outerLife(), 'days')
  })

  it('a page: rendered, cached for days', async () => {
    globalThis.fetch = respond(200, { title: 'FAQ', html: '<p>Hello</p>', css: '', global_css: '' })
    const page = await fetchWpPage(['shipping-container-faqs'])
    assert.equal(page?.title, 'FAQ')
    assert.equal(outerLife(), 'days')
  })
})

describe('products (Elasticsearch)', () => {
  it('a search failure: null, cached for the outage life', async () => {
    esSearch = async () => {
      throw new Error('ES timeout')
    }
    assert.equal(await getProductByHandle('any-handle'), null)
    assert.deepEqual(outerLife(), OUTAGE_CACHE_LIFE)
  })

  it('no such product: null, cached for hours', async () => {
    esSearch = async () => ({ hits: { hits: [] } })
    assert.equal(await getProductByHandle('no-such-handle'), null)
    assert.equal(outerLife(), 'hours')
  })

  it('a batch lookup failure: empty, cached for the outage life', async () => {
    esSearch = async () => {
      throw new Error('ES timeout')
    }
    assert.deepEqual(await getProductsByIds([1, 2]), [])
    assert.deepEqual(outerLife(), OUTAGE_CACHE_LIFE)
  })
})

describe('blog posts (getCachedBlog)', () => {
  it('a backend failure: null, cached for the outage life', async () => {
    globalThis.fetch = respond(503)
    assert.equal(await getCachedBlog('some-post'), null)
    assert.deepEqual(outerLife(), OUTAGE_CACHE_LIFE)
  })

  it('a real 404: null, cached for hours', async () => {
    globalThis.fetch = respond(404)
    assert.equal(await getCachedBlog('no-such-post'), null)
    assert.equal(outerLife(), 'hours')
  })
})
