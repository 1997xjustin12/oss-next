// The marketing team's SEO fields on a product (lib/productSeo.ts): cleaned,
// and only used when someone actually wrote them.
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const { focusKeyphrase, keyphraseHeading, productSeoDescription, productSeoTitle } = await import('@/lib/productSeo')

const TITLE = 'Rent-To-Own Used 40 ft Standard Shipping Container - Cargo Worthy (24 Months) - Phoenix, AZ'
const p = (seo: Record<string, string> | null | undefined) => ({ title: TITLE, seo })

describe('productSeo', () => {
  it('strips the zero-width spaces pasted into the index', () => {
    assert.equal(focusKeyphrase(p({ focus_keyphrase: ' portable storage temecula​ ' })), 'portable storage temecula')
  })

  it('heading: words capitalised, state and province codes in capitals', () => {
    const h = (kp: string) => keyphraseHeading(p({ focus_keyphrase: kp }))
    assert.equal(h('mobile storage containers in phoenix az'), 'Mobile Storage Containers In Phoenix AZ')
    assert.equal(h('extra space storage newark nj'), 'Extra Space Storage Newark NJ')
    assert.equal(h('shipping container dallas tx for sale'), 'Shipping Container Dallas TX For Sale')
    assert.equal(h('storage containers in regina'), 'Storage Containers In Regina')
    assert.equal(h('ohio storage'), 'Ohio Storage')
    assert.equal(h('storage containers toledo oh'), 'Storage Containers Toledo OH')
    assert.equal(h('containers on sale'), 'Containers On Sale')
    assert.equal(h('40 high cube container for sale'), '40 High Cube Container For Sale')
  })

  it('no keyphrase: empty, so the page shows the product title alone', () => {
    assert.equal(keyphraseHeading(p(undefined)), '')
    assert.equal(keyphraseHeading(p(null)), '')
    assert.equal(keyphraseHeading(p({ focus_keyphrase: '​ ' })), '')
  })

  it('title: the hand-written one, never the backend default copy of the product title', () => {
    assert.equal(productSeoTitle(p({ title: 'Rent to Own Mobile Storage Containers in Phoenix AZ | Best Deals' })), 'Rent to Own Mobile Storage Containers in Phoenix AZ | Best Deals')
    assert.equal(productSeoTitle(p({ title: TITLE })), null)
    assert.equal(productSeoTitle(p({ title: `${TITLE}  ` })), null)
    assert.equal(productSeoTitle(p({})), null)
  })

  it('description: the hand-written one, else null', () => {
    assert.equal(productSeoDescription(p({ description: 'Get mobile storage containers.' })), 'Get mobile storage containers.')
    assert.equal(productSeoDescription(p({ description: '  ' })), null)
    assert.equal(productSeoDescription(p(undefined)), null)
  })
})
