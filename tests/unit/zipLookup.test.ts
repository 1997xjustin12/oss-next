// The rules every ZIP box shares (lib/zipLookup.ts, used by useZipLookup):
// what the box starts with, and the saved location as a selectable result.
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { savedLocationResult, zipPrefill } from '@/lib/zipLookup'

const saved = { postcode: '30303', label: 'Atlanta, GA 30303', depot: 'Atlanta, GA' }
const none = { postcode: '', label: '', depot: '' }

describe('zipPrefill', () => {
  it('without a page ZIP: saved label, then saved ZIP, then the detected ZIP', () => {
    assert.equal(zipPrefill('', saved, '75201'), 'Atlanta, GA 30303')
    assert.equal(zipPrefill('', { ...saved, label: '' }, '75201'), '30303')
    assert.equal(zipPrefill('', none, '75201'), '75201')
    assert.equal(zipPrefill('', none, ''), '')
  })

  it("the page's ZIP wins, shown as the saved label when it is the saved ZIP", () => {
    assert.equal(zipPrefill('30303', saved, '75201'), 'Atlanta, GA 30303')
    assert.equal(zipPrefill('90210', saved, '75201'), '90210')
    assert.equal(zipPrefill('90210', none, ''), '90210')
  })
})

describe('savedLocationResult', () => {
  it('turns the saved location into a result, with the listing link a lookup would give', () => {
    const result = savedLocationResult(saved)
    assert.ok(result)
    assert.equal(result.postcode, '30303')
    assert.equal(result.formatted, 'Atlanta, GA 30303')
    assert.equal(result.nearestLocation, 'Atlanta, GA')
    assert.equal(result.galleryRedirect, '/sale-shipping-containers?zipcode=30303&location=Atlanta%2C+GA')
  })

  it('falls back to the ZIP as the label', () => {
    assert.equal(savedLocationResult({ ...saved, label: '' })?.formatted, '30303')
  })

  it('is null without a ZIP or a depot (it must then be looked up)', () => {
    assert.equal(savedLocationResult({ ...saved, depot: '' }), null)
    assert.equal(savedLocationResult({ ...saved, postcode: '' }), null)
  })
})
