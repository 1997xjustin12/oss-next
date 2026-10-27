// SITE_URL's origin rule (config/site.ts). The env value arrives either as a
// bare domain or a whole URL; both must become one clean https origin, or every
// canonical on the site breaks (staging once published https://http/...).
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { toOrigin } from '@/config/site'

describe('toOrigin', () => {
  it('turns a bare domain into an https origin', () => {
    assert.equal(toOrigin('onsitestorage.com'), 'https://onsitestorage.com')
  })

  it('accepts a whole URL, whatever its scheme, path or trailing slash', () => {
    assert.equal(toOrigin('http://onsitestorage.com'), 'https://onsitestorage.com')
    assert.equal(toOrigin('https://onsitestorage.com/'), 'https://onsitestorage.com')
    assert.equal(toOrigin('https://staging.onsitestorage.com/blogs'), 'https://staging.onsitestorage.com')
  })

  it('keeps http for localhost', () => {
    assert.equal(toOrigin('http://localhost:3000'), 'http://localhost:3000')
  })

  it('is empty for nothing, so the next fallback applies', () => {
    assert.equal(toOrigin(undefined), '')
    assert.equal(toOrigin('  '), '')
  })
})
