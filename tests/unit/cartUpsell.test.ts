// The Added to Cart dialog's accessory order (config/cartUpsell.ts, lib/cartUpsell.ts).
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { pickCartUpsell } from '@/lib/cartUpsell'

const product = (title: string, sale_price: number | string) => ({ title, sale_price })

const titles = (products: { title: string }[]) => products.map((p) => p.title)

describe('pickCartUpsell', () => {
  it('follows the groups, each showing its cheapest match', () => {
    const picked = pickCartUpsell([
      product('Air Vent', 17),
      product('Container Padlock', 50),
      product('Big Lock Box', 144),
      product('Small Lock Box', 75),
      product('Leveling Kit', 195),
    ])
    assert.deepEqual(titles(picked), ['Small Lock Box', 'Leveling Kit', 'Container Padlock', 'Air Vent', 'Big Lock Box'])
  })

  it('keeps shelters out while cheaper products can fill the row', () => {
    const cheap = Array.from({ length: 8 }, (_, i) => product(`Bracket ${i}`, 50 + i))
    const picked = pickCartUpsell([product('40 ft Building Shelter', 3800), ...cheap])
    assert.equal(picked.length, 8)
    assert.ok(!titles(picked).includes('40 ft Building Shelter'))
  })

  it('fills a lighting product into its place once one exists', () => {
    const picked = pickCartUpsell([product('Air Vent', 17), product('LED Work Light', 90), product('Container Padlock', 50)])
    assert.deepEqual(titles(picked), ['Container Padlock', 'LED Work Light', 'Air Vent'])
  })

  it('leaves out lock parts as a door lock, and anything without a price', () => {
    const picked = pickCartUpsell([product('Door Lock Parts', 97), product('Cargo Door Lock', 80), product('Free Lock Box', 0)])
    assert.deepEqual(titles(picked), ['Cargo Door Lock', 'Door Lock Parts'])
  })

  it('shows a product only once, even if it matches two groups', () => {
    const picked = pickCartUpsell([product('Lock Box with Padlock', 90)])
    assert.equal(picked.length, 1)
  })

  it('returns nothing for no products', () => {
    assert.deepEqual(pickCartUpsell([]), [])
  })
})
