// Which storefront pages leave out the live chat (config/salesIq.ts).
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { isSalesIqExcludedPath } from '@/config/salesIq'

describe('isSalesIqExcludedPath', () => {
  it('excludes the cart and checkout, and what is beneath them', () => {
    for (const path of ['/cart', '/cart/', '/checkout', '/checkout/', '/checkout/anything']) {
      assert.equal(isSalesIqExcludedPath(path), true, path)
    }
  })

  it('keeps every other page, including ones that only start the same', () => {
    for (const path of ['/', '/sale-shipping-containers', '/product/a-container', '/cart-covers', '/checkout-guide']) {
      assert.equal(isSalesIqExcludedPath(path), false, path)
    }
  })
})
