// Alt text for in-article blog images the editor left without one (lib/blog.ts).
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { altFromImageUrl } from '@/lib/blog'

const CDN = 'https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/'

describe('altFromImageUrl', () => {
  it('reads the file name, without its size and storage suffix', () => {
    assert.equal(
      altFromImageUrl(`${CDN}why-proper-storage-matters-in-shipping-container-1536x864_x30QiJ2.webp`),
      'Why proper storage matters in shipping container',
    )
    assert.equal(altFromImageUrl(`${CDN}shipping-container-for-sale_Fu3pscl.webp`), 'Shipping container for sale')
  })

  it('handles names with neither, and query strings', () => {
    assert.equal(altFromImageUrl(`${CDN}Rent-to-own-connex.webp?v=2`), 'Rent to own connex')
  })

  it('is empty when nothing readable is left', () => {
    assert.equal(altFromImageUrl(''), '')
    assert.equal(altFromImageUrl(`${CDN}.webp`), '')
  })
})
