import { PLP_DEFAULT_ORDER, type PlpOrder } from '@/config/plpOrder'

/**
 * The container listing's Default order: the rule in config/plpOrder.ts,
 * applied to products from the search index. Reference:
 * docs/reference/plp-product-ordering.md.
 *
 * In our code rather than as an Elasticsearch sort: `custom_fields` is an array
 * of `{ name, value }` objects indexed as plain objects, so the index keeps the
 * names and the values as two unrelated lists and cannot sort on "the value
 * whose name is grade". A depot's list is small enough to fetch whole and sort
 * here (services/search.service.ts).
 */

export type PlpPaymentType = 'buy' | 'rental' | 'rto'

type CustomField = { name?: unknown; value?: unknown }
/** A product as the index stores it; only `custom_fields`, `sale_price` and `title` are read. */
type Product = Record<string, unknown>

export type PlpOrderKeys = { term: string; grade: string; size: string }

function field(product: Product, name: string): string {
  const fields = Array.isArray(product.custom_fields) ? (product.custom_fields as CustomField[]) : []
  const value = fields.find((f) => f?.name === name)?.value
  return typeof value === 'string' ? value : value == null ? '' : String(value)
}

/** "['48']" → "48"; the index stores the term as a list literal (see services/search.service.ts). */
function termOf(raw: string): string {
  return raw.match(/\d+/)?.[0] ?? ''
}

/** `condition` + `grade` → "used-wwt", "new-iicl", "used-as-is", "used-cw"…; '' when unknown. */
function gradeOf(condition: string, grade: string): string {
  const g = grade.toLowerCase()
  const key = /wind|wwt/.test(g)
    ? 'wwt'
    : /iicl/.test(g)
      ? 'iicl'
      : /as\s*is/.test(g)
        ? 'as-is'
        : /cargo|\bcw\b/.test(g)
          ? 'cw'
          : ''
  const state = condition.toLowerCase().startsWith('new') ? 'new' : condition.toLowerCase().startsWith('used') ? 'used' : ''
  return key && state ? `${state}-${key}` : ''
}

/** `length_width` + `height` → "20-std", "40-std", "40-hc"; '' when unknown. */
function sizeOf(lengthWidth: string, height: string): string {
  const length = lengthWidth.match(/\d+/)?.[0] ?? ''
  if (!length) return ''
  return `${length}-${/high\s*cube|\bhc\b/i.test(height) ? 'hc' : 'std'}`
}

/** A product's place in the rule, from its own fields. */
export function plpOrderKeys(product: Product): PlpOrderKeys {
  return {
    term: termOf(field(product, 'payment_term')),
    grade: gradeOf(field(product, 'condition'), field(product, 'grade')),
    size: sizeOf(field(product, 'length_width'), field(product, 'height')),
  }
}

/** Where a value sits in its list; a value not listed comes after all listed ones. */
function rank(list: readonly string[], value: string): number {
  const i = list.indexOf(value)
  return i === -1 ? list.length : i
}

function priceOf(product: Product): number {
  const price = Number(product.sale_price)
  return Number.isFinite(price) ? price : Number.POSITIVE_INFINITY
}

/**
 * Sort products by the Default rule for this payment type: term, grade, size
 * (config/plpOrder.ts, or the admin's, see conformPlpOrder), then price, then
 * title. Returns a new array; stable.
 */
export function sortByPlpOrder<T extends Product>(
  products: readonly T[],
  paymentType: PlpPaymentType,
  order: PlpOrder = PLP_DEFAULT_ORDER,
): T[] {
  const termList: readonly string[] = paymentType === 'buy' ? [] : order.term[paymentType]
  const lists: Record<keyof PlpOrderKeys, readonly string[]> = {
    term: termList,
    grade: order.grade,
    size: order.size,
  }
  const keyed = products.map((product) => ({ product, keys: plpOrderKeys(product) }))
  return keyed
    .sort((a, b) => {
      for (const key of order.keys) {
        const diff = rank(lists[key], a.keys[key]) - rank(lists[key], b.keys[key])
        if (diff !== 0) return diff
      }
      const price = priceOf(a.product) - priceOf(b.product)
      if (price !== 0) return price
      return String(a.product.title ?? '').localeCompare(String(b.product.title ?? ''))
    })
    .map(({ product }) => product)
}

/** The same values, in any order, with none missing or repeated. */
function isReordering(value: unknown, of: readonly string[]): value is string[] {
  return (
    Array.isArray(value) &&
    value.length === of.length &&
    value.every((v) => typeof v === 'string' && of.includes(v)) &&
    new Set(value).size === of.length
  )
}

/**
 * A stored order (Admin → Listing Order), kept only where it is a reordering of
 * the default: the admin can move values, not add, drop or rename them, so a
 * bad or outdated record can never lose products from the order. Each list is
 * checked on its own; one that does not fit falls back to the default's.
 */
export function conformPlpOrder(raw: unknown): PlpOrder {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const term = (source.term && typeof source.term === 'object' ? source.term : {}) as Record<string, unknown>
  const d = PLP_DEFAULT_ORDER
  return {
    keys: isReordering(source.keys, d.keys) ? (source.keys as PlpOrder['keys']) : d.keys,
    term: {
      rental: isReordering(term.rental, d.term.rental) ? term.rental : d.term.rental,
      rto: isReordering(term.rto, d.term.rto) ? term.rto : d.term.rto,
    },
    grade: isReordering(source.grade, d.grade) ? source.grade : d.grade,
    size: isReordering(source.size, d.size) ? source.size : d.size,
  }
}
