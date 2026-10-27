// Depot page links (lib/locations.ts): the where-to-buy depot list and
// llms.txt both build their links with depotPagePath.
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { DEPOTS, depotPagePath } from '@/lib/locations'

const pathFor = (title: string) => {
  const depot = DEPOTS.find((d) => d.location.title === title)
  assert.ok(depot, title)
  return depotPagePath(depot)
}

describe('depotPagePath', () => {
  it('uses the live pages where the depot records have the wrong slug', () => {
    assert.equal(pathFor('Baltimore, MD'), '/where-to-buy-shipping-containers/baltimore-md-2')
    assert.equal(pathFor('Halifax / Dartmouth, NS'), '/where-to-buy-shipping-containers/halifax-dartmouth-ns')
    assert.equal(pathFor('Las Vegas, NV'), '/where-to-buy-shipping-containers/las-vegas-nv')
  })

  it('leaves the rest as the records give them, including depots not in the homepage list', () => {
    assert.equal(pathFor('Atlanta, GA'), '/where-to-buy-shipping-containers/atlanta-ga')
    assert.equal(pathFor('Austin, TX'), '/where-to-buy-shipping-containers/austin-tx')
    assert.equal(pathFor('Montreal, QB'), '/where-to-buy-shipping-containers/montreal-qb')
  })
})
