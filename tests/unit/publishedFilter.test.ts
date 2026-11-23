// "For sale" is `published: true`, not WordPress's `status: 'publish'`: a product
// created in the new backend has the first and not the second, and 404ed on
// its own page while it filtered on status (2026-11-23).
import { describe, it, mock } from 'node:test'
import assert from 'node:assert/strict'

process.env.ELASTICSEARCH_URL ??= 'https://es.test'

mock.module('next/cache', { namedExports: { cacheLife: () => {}, cacheTag: () => {} } })

const queries: unknown[] = []
mock.module('@elastic/elasticsearch', {
  namedExports: {
    Client: class {
      search(args: { query?: unknown }) {
        queries.push(args.query)
        return Promise.resolve({ hits: { total: { value: 0 }, hits: [] } })
      }
    },
  },
})

const { getProductByHandle } = await import('@/services/search.service')

describe('the storefront\'s "for sale" filter', () => {
  it('a product page looks the handle up among published products, whatever its status', async () => {
    await getProductByHandle('sea-rail-shipping-container-bridge-fittings-clamp-brand-new-380mm')
    const sent = JSON.stringify(queries.at(-1))
    assert.ok(sent.includes('{"term":{"published":true}}'), sent)
    assert.ok(!sent.includes('"status"'), sent)
  })
})
