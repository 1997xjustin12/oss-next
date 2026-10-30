// The container listing's Default order (config/plpOrder.ts, lib/plpOrder.ts):
// term, then grade, then size, then price and title. Expected orders are the
// live WordPress listing's (docs/reference/plp-product-ordering.md).
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { plpOrderKeys, sortByPlpOrder } from '@/lib/plpOrder'

type Spec = { grade: string; condition: string; length: string; height: string; term?: string; price: number; title?: string }

function product(spec: Spec) {
  return {
    title: spec.title ?? `${spec.condition} ${spec.length} ${spec.height} ${spec.grade} ${spec.term ?? ''}`,
    sale_price: spec.price,
    custom_fields: [
      { name: 'grade', value: spec.grade },
      { name: 'condition', value: spec.condition },
      { name: 'length_width', value: `${spec.length}'` },
      { name: 'height', value: spec.height },
      { name: 'payment_term', value: spec.term ? `['${spec.term}']` : '[]' },
    ],
  }
}

const STD = `8' 6" Standard`
const HC = '9’ 6” High Cube (HC)'
const WWT = 'Wind and Water tight (WWT)'
const CW = 'Cargo Worthy (CW)'

const label = (p: ReturnType<typeof product>) => {
  const k = plpOrderKeys(p)
  return [k.term, k.grade, k.size].filter(Boolean).join(' ')
}

describe('plpOrderKeys', () => {
  it('reads term, grade and size from the fields the index stores', () => {
    assert.deepEqual(plpOrderKeys(product({ grade: WWT, condition: 'Used', length: '40', height: HC, term: '48', price: 1 })), {
      term: '48',
      grade: 'used-wwt',
      size: '40-hc',
    })
    assert.equal(plpOrderKeys(product({ grade: 'IICL', condition: 'New', length: '20', height: STD, price: 1 })).grade, 'new-iicl')
    assert.equal(plpOrderKeys(product({ grade: 'IICL', condition: 'Used', length: '20', height: STD, price: 1 })).grade, 'used-iicl')
    assert.equal(plpOrderKeys(product({ grade: 'AS IS', condition: 'Used', length: '20', height: STD, price: 1 })).grade, 'used-as-is')
    assert.equal(plpOrderKeys(product({ grade: CW, condition: 'Used', length: '20', height: STD, price: 1 })).grade, 'used-cw')
  })

  it('leaves a value it does not recognise empty, so it sorts last', () => {
    assert.equal(plpOrderKeys({ title: 'x' }).grade, '')
    assert.equal(plpOrderKeys(product({ grade: 'Mystery', condition: 'Used', length: '20', height: STD, price: 1 })).grade, '')
  })
})

describe('sortByPlpOrder', () => {
  it('buy: grade (WWT, New IICL, Used IICL, AS IS, CW), then size (20′, 40′, 40′ HC)', () => {
    // Shuffled the way the index returns them today.
    const shuffled = [
      product({ grade: 'IICL', condition: 'New', length: '20', height: STD, price: 2900 }),
      product({ grade: WWT, condition: 'Used', length: '40', height: HC, price: 2000 }),
      product({ grade: CW, condition: 'Used', length: '20', height: STD, price: 1550 }),
      product({ grade: 'AS IS', condition: 'Used', length: '40', height: STD, price: 1700 }),
      product({ grade: 'IICL', condition: 'Used', length: '40', height: HC, price: 2325 }),
      product({ grade: WWT, condition: 'Used', length: '20', height: STD, price: 1350 }),
      product({ grade: 'IICL', condition: 'New', length: '40', height: HC, price: 4350 }),
      product({ grade: WWT, condition: 'Used', length: '40', height: STD, price: 1800 }),
    ]
    assert.deepEqual(sortByPlpOrder(shuffled, 'buy').map(label), [
      'used-wwt 20-std',
      'used-wwt 40-std',
      'used-wwt 40-hc',
      'new-iicl 20-std',
      'new-iicl 40-hc',
      'used-iicl 40-hc',
      'used-as-is 40-std',
      'used-cw 20-std',
    ])
  })

  it('rental: term first, 12 → 6 → 3, then size', () => {
    const shuffled = ['3', '6', '12'].flatMap((term) =>
      [
        { length: '40', height: STD },
        { length: '20', height: STD },
      ].map((s) => product({ grade: WWT, condition: 'Used', ...s, term, price: 100 })),
    )
    assert.deepEqual(sortByPlpOrder(shuffled, 'rental').map(label), [
      '12 used-wwt 20-std',
      '12 used-wwt 40-std',
      '6 used-wwt 20-std',
      '6 used-wwt 40-std',
      '3 used-wwt 20-std',
      '3 used-wwt 40-std',
    ])
  })

  it('rent-to-own: 48 → 36 → 24 → 12, each block by grade then size', () => {
    const shuffled = [
      product({ grade: 'IICL', condition: 'New', length: '20', height: STD, term: '12', price: 345 }),
      product({ grade: WWT, condition: 'Used', length: '20', height: STD, term: '36', price: 75 }),
      product({ grade: CW, condition: 'Used', length: '20', height: STD, term: '48', price: 70 }),
      product({ grade: WWT, condition: 'Used', length: '20', height: STD, term: '48', price: 61 }),
      product({ grade: 'IICL', condition: 'New', length: '20', height: STD, term: '48', price: 131 }),
    ]
    assert.deepEqual(sortByPlpOrder(shuffled, 'rto').map(label), [
      '48 used-wwt 20-std',
      '48 new-iicl 20-std',
      '48 used-cw 20-std',
      '36 used-wwt 20-std',
      '12 new-iicl 20-std',
    ])
  })

  it('unknown values go last; ties fall to price, then title', () => {
    const items = [
      product({ grade: 'Mystery', condition: 'Used', length: '20', height: STD, price: 10, title: 'unknown grade' }),
      product({ grade: WWT, condition: 'Used', length: '20', height: STD, price: 300, title: 'b dearer' }),
      product({ grade: WWT, condition: 'Used', length: '20', height: STD, price: 200, title: 'z cheaper' }),
      product({ grade: WWT, condition: 'Used', length: '20', height: STD, price: 200, title: 'a cheaper' }),
    ]
    assert.deepEqual(
      sortByPlpOrder(items, 'buy').map((p) => p.title),
      ['a cheaper', 'z cheaper', 'b dearer', 'unknown grade'],
    )
  })

  it('does not change the array it is given', () => {
    const items = [
      product({ grade: CW, condition: 'Used', length: '20', height: STD, price: 1 }),
      product({ grade: WWT, condition: 'Used', length: '20', height: STD, price: 1 }),
    ]
    const before = items.map((p) => p.title)
    sortByPlpOrder(items, 'buy')
    assert.deepEqual(items.map((p) => p.title), before)
  })
})
