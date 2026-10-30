// The checkout gate's domain handling (lib/checkoutGate.ts): what is stored and
// compared, so "Staging.OnsiteStorage.com:443/cart" and the request's hostname agree.
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { normalizeHost } from '@/lib/checkoutGate'

describe('normalizeHost', () => {
  it('lower-cases and drops scheme, port, path and a trailing dot', () => {
    assert.equal(normalizeHost('https://Staging.OnsiteStorage.com:443/cart?x=1'), 'staging.onsitestorage.com')
    assert.equal(normalizeHost('  localhost:3000 '), 'localhost')
    assert.equal(normalizeHost('onsitestorage.com.'), 'onsitestorage.com')
    assert.equal(normalizeHost('my-branch-abc123.vercel.app'), 'my-branch-abc123.vercel.app')
  })

  it('refuses anything that is not a host name', () => {
    assert.equal(normalizeHost(''), '')
    assert.equal(normalizeHost('not a domain'), '')
    assert.equal(normalizeHost('-bad.com'), '')
    assert.equal(normalizeHost('a..b'), '')
    assert.equal(normalizeHost('x'.repeat(260) + '.com'), '')
  })
})
