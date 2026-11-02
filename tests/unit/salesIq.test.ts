// Which storefront pages leave out the live chat (config/salesIq.ts), and how the
// list from Admin → Live Chat is cleaned up.
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  conformSalesIqPaths,
  isSalesIqExcludedPath,
  normalizeSalesIqPath,
  SALES_IQ_DEFAULT_EXCLUDED_PATHS,
} from '@/config/salesIq'

describe('isSalesIqExcludedPath', () => {
  it('excludes a listed page and what is beneath it', () => {
    for (const path of ['/cart', '/cart/', '/checkout', '/checkout/', '/checkout/anything']) {
      assert.equal(isSalesIqExcludedPath(path, SALES_IQ_DEFAULT_EXCLUDED_PATHS), true, path)
    }
  })

  it('keeps every other page, including ones that only start the same', () => {
    for (const path of ['/', '/sale-shipping-containers', '/product/a-container', '/cart-covers', '/checkout-guide']) {
      assert.equal(isSalesIqExcludedPath(path, SALES_IQ_DEFAULT_EXCLUDED_PATHS), false, path)
    }
  })

  it('treats a listed homepage as the homepage alone', () => {
    assert.equal(isSalesIqExcludedPath('/', ['/']), true)
    assert.equal(isSalesIqExcludedPath('/blogs', ['/']), false)
  })

  it('excludes nothing on an empty list', () => {
    assert.equal(isSalesIqExcludedPath('/cart', []), false)
  })
})

describe('normalizeSalesIqPath', () => {
  it('reduces what an admin might paste to the path', () => {
    assert.equal(normalizeSalesIqPath('  /Blogs/ '), '/blogs')
    assert.equal(normalizeSalesIqPath('blogs/a-post'), '/blogs/a-post')
    assert.equal(normalizeSalesIqPath('https://onsitestorage.com/Blogs/?a=1#top'), '/blogs')
    assert.equal(normalizeSalesIqPath('https://onsitestorage.com/'), '/')
    assert.equal(normalizeSalesIqPath('/'), '/')
  })

  it('refuses anything that cannot be a path', () => {
    assert.equal(normalizeSalesIqPath(''), '')
    assert.equal(normalizeSalesIqPath('   '), '')
    assert.equal(normalizeSalesIqPath('not a path'), '')
    assert.equal(normalizeSalesIqPath('/<script>'), '')
    assert.equal(normalizeSalesIqPath(`/${'x'.repeat(200)}`), '')
  })
})

describe('conformSalesIqPaths', () => {
  it('uses the defaults when no list has been saved', () => {
    assert.deepEqual(conformSalesIqPaths(null), [...SALES_IQ_DEFAULT_EXCLUDED_PATHS])
    assert.deepEqual(conformSalesIqPaths('/cart'), [...SALES_IQ_DEFAULT_EXCLUDED_PATHS])
  })

  it('keeps a saved empty list empty: the chat on every page', () => {
    assert.deepEqual(conformSalesIqPaths([]), [])
  })

  it('cleans, de-duplicates and sorts a saved list, dropping what is not a path', () => {
    assert.deepEqual(conformSalesIqPaths(['/cart/', '/Blogs', '/cart', 'not a path', '']), ['/blogs', '/cart'])
  })
})
