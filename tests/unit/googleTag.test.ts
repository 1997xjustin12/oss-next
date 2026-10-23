// Which GTM environment a BASE_URL selects. Exact hostname matching: the live
// container must never load on staging (or the reverse), and nothing else may
// load either.
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { gtmEnvironmentFor } from '@/config/googleTag'

describe('gtmEnvironmentFor', () => {
  it('live for onsitestorage.com, however it is written', () => {
    for (const url of [
      'https://onsitestorage.com',
      'https://onsitestorage.com/',
      'https://www.onsitestorage.com',
      'HTTPS://OnsiteStorage.com',
      'onsitestorage.com',
      'http://onsitestorage.com:443/some/path?x=1',
      'https://onsitestorage.com.',
      '  https://onsitestorage.com  ',
    ]) assert.equal(gtmEnvironmentFor(url), 'live', url)
  })

  it('staging for staging.onsitestorage.com', () => {
    for (const url of ['https://staging.onsitestorage.com', 'staging.onsitestorage.com/', 'https://www.staging.onsitestorage.com'])
      assert.equal(gtmEnvironmentFor(url), 'staging', url)
  })

  it('nothing for any other host, lookalikes included', () => {
    for (const url of [
      undefined,
      '',
      'http://localhost:3000',
      'https://oss-next.vercel.app',
      'https://oss-next-git-staging-solana-products.vercel.app',
      'https://onsitestorage.com.evil.example',
      'https://notonsitestorage.com',
      'https://dev.onsitestorage.com',
      'https://staging.onsitestorage.com.example.net',
      'not a url at all',
    ]) assert.equal(gtmEnvironmentFor(url), null, String(url))
  })
})
