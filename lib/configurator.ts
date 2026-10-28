import type { ContainerVideo } from '@/config/containerVideos'

/**
 * The container configurator's data and selection rules: pick a spec, then a
 * term, get one product. Pure, so the component stays a view and the rules are
 * unit-tested (tests/unit/configurator.test.ts).
 *
 * Spec: docs/reference/shipping-container-configurator-to-cart-component.md
 */

export type ConfiguratorPaymentType = 'rto' | 'rental' | 'buy'

export type ConfiguratorOption = { value: string; label: string }

/** One radio group. `key` is the product's `specs` key it filters on. */
export type ConfiguratorGroup = {
  key: string
  label: string
  options: readonly ConfiguratorOption[]
}

/**
 * One catalogue product, cut down to what the configurator renders and puts in
 * the cart. Built on the server (services/configurator.service.ts), so the
 * browser never downloads the full depot listing.
 */
export type ConfiguratorProduct = {
  id: string
  title: string
  /** `sale_price`: monthly for rental and rent-to-own. */
  price: number
  sku: string
  /** The depot, as the product carries it, e.g. `Atlanta, GA`. */
  location: string
  /** Option values by group key: `{ size: '20s', condition: 'used', grade: 'wwt', term: '48' }`. */
  specs: Record<string, string>
  /** For the cart line, as the product page writes it: `20'` and `Used`. */
  sizeLabel: string
  conditionLabel: string
  /** The spec's curated photographs, else the product's own. */
  images: string[]
  video: ContainerVideo | null
  /** The product's own rating; 0 when it has none. */
  rating: { value: number; count: number }
}

export type ConfiguratorSelection = Record<string, string>

export type ConfiguratorState = {
  /** The selection after the cascade, or null when nothing is stocked. */
  selection: ConfiguratorSelection | null
  /** Per group, the values that can be picked given the groups above it. */
  available: Record<string, ReadonlySet<string>>
}

function matches(product: ConfiguratorProduct, selection: ConfiguratorSelection, keys: readonly string[]) {
  return keys.every((key) => product.specs[key] === selection[key])
}

/**
 * Apply the availability cascade to what the visitor asked for.
 *
 * Each group is checked against the groups **above** it only. Checked against
 * every other current choice, an option could never be reached: New is stocked
 * only as IICL, so with the default grade (WWT) "New" would always be disabled.
 * A choice the groups above have ruled out moves to the first available option
 * in its group, in the order the group lists them.
 */
export function resolveSelection(
  products: readonly ConfiguratorProduct[],
  groups: readonly ConfiguratorGroup[],
  wanted: ConfiguratorSelection,
): ConfiguratorState {
  const selection: ConfiguratorSelection = {}
  const available: Record<string, ReadonlySet<string>> = {}
  // Only products every group can express. An AS IS container on a page that
  // offers WWT, CW and IICL would otherwise make its size pickable, and picking
  // it would leave no grade to choose.
  const offered = groups.map((g) => new Set(g.options.map((o) => o.value)))
  let pool = products.filter((p) => groups.every((g, i) => offered[i].has(p.specs[g.key])))

  for (const group of groups) {
    const values = new Set(pool.map((p) => p.specs[group.key]))
    const pickable = new Set(group.options.map((o) => o.value).filter((v) => values.has(v)))
    available[group.key] = pickable

    const value = pickable.has(wanted[group.key]) ? wanted[group.key] : group.options.find((o) => pickable.has(o.value))?.value
    if (value === undefined) {
      // Nothing left to pick here, so nothing below it can be picked either.
      for (const rest of groups.slice(groups.indexOf(group) + 1)) available[rest.key] = new Set()
      return { selection: null, available }
    }
    selection[group.key] = value
    pool = pool.filter((p) => p.specs[group.key] === value)
  }

  return { selection, available }
}

/** The cheapest product matching the selection on `keys`, or null. */
export function cheapestMatch(
  products: readonly ConfiguratorProduct[],
  selection: ConfiguratorSelection,
  keys: readonly string[],
): ConfiguratorProduct | null {
  let best: ConfiguratorProduct | null = null
  for (const product of products) {
    if (!matches(product, selection, keys)) continue
    if (!best || product.price < best.price) best = product
  }
  return best
}

/**
 * The product behind each option of the last group (the term), with every
 * group above it held at the selection: the price shown under each term.
 */
export function productsByLastGroup(
  products: readonly ConfiguratorProduct[],
  groups: readonly ConfiguratorGroup[],
  selection: ConfiguratorSelection,
): Map<string, ConfiguratorProduct> {
  const last = groups[groups.length - 1]
  const above = groups.slice(0, -1).map((g) => g.key)
  const byValue = new Map<string, ConfiguratorProduct>()
  for (const option of last.options) {
    const product = cheapestMatch(products, { ...selection, [last.key]: option.value }, [...above, last.key])
    if (product) byValue.set(option.value, product)
  }
  return byValue
}

/**
 * "Pricing Starts at": the selected container on the lead term (48 months for
 * rent-to-own), whatever term is picked. A container with no lead-term product
 * falls back to its cheapest term rather than showing nothing.
 */
export function startingPrice(
  byTerm: ReadonlyMap<string, ConfiguratorProduct>,
  leadTerm: string,
): number | null {
  const lead = byTerm.get(leadTerm)
  if (lead) return lead.price
  let lowest: number | null = null
  for (const product of byTerm.values()) if (lowest === null || product.price < lowest) lowest = product.price
  return lowest
}
