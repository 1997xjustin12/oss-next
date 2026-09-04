import { getCustomFieldValue } from '@/lib/pricing'
import type { ContainerCondition, ContainerGrade } from './containerSpecTerms'
import { CONTAINER_CONDITIONS, CONTAINER_GRADES } from './containerSpecTerms'
import type { ProductHit } from '@/types/product'

/**
 * The condition and grade a container overview is written for.
 *
 * The catalogue's own values are messier than this — grade arrives as "Wind and
 * Water tight", "Wind & Water Tight" or "WWT" depending on the row, and
 * condition as "Used", "New" or "One-Trip". These are the four grades and two
 * conditions the site actually sells against, and everything upstream is
 * matched down onto them.
 *
 * The matching mirrors `matchesCondition`/`matchesGrade` in ProductInfoPanel on
 * purpose: the overview and the option picker have to agree about which
 * combination is selected, or the page describes one container while the
 * buttons highlight another.
 */

// The vocabulary itself lives in containerSpecTerms — a module with no imports,
// so build scripts can read the same slugs the app does. Re-exported here
// because every existing call site reaches for it through this file.
export {
  CONTAINER_CONDITIONS,
  CONTAINER_GRADES,
  CONTAINER_VARIANTS,
  CONDITION_TERMS,
  GRADE_TERMS,
  SIZE_TERMS,
  OFFERED_PAIRS,
  conditionSlug,
  gradeSlug,
  gradeAbbr,
  sizeSlug,
  specFileStem,
} from './containerSpecTerms'
export type {
  SpecTerm,
  ContainerCondition,
  ContainerGrade,
  ContainerVariantKey,
} from './containerSpecTerms'

/** e.g. `Used|Cargo Worthy`. The key each overview registry is indexed by. */
export type CombinationKey = `${ContainerCondition}|${ContainerGrade}`

export function combinationKey(
  condition: ContainerCondition,
  grade: ContainerGrade,
): CombinationKey {
  return `${condition}|${grade}`
}

/** Every combination, for building a registry that cannot miss one. */
export const ALL_COMBINATIONS: CombinationKey[] = CONTAINER_CONDITIONS.flatMap(
  (condition) => CONTAINER_GRADES.map((grade) => combinationKey(condition, grade)),
)

/**
 * Which combinations are actually stocked.
 *
 * New is only sold at IICL — a one-trip container has by definition not been
 * used enough to be graded lower. The other three New rows exist in the type
 * because the matrix is a product of two axes, not because anyone can buy them.
 * Kept as data rather than a comment so a registry can be checked against it.
 */
export const OFFERED_COMBINATIONS: CombinationKey[] = [
  'Used|AS IS',
  'Used|Wind and Water Tight',
  'Used|Cargo Worthy',
  'Used|IICL',
  'New|IICL',
]

/** Condition as one of the two the site sells. Anything unrecognised is Used. */
export function resolveCondition(product: ProductHit): ContainerCondition {
  const raw = getCustomFieldValue(product, 'condition').toLowerCase()
  // "One-Trip" is a New container that has shipped once, and the catalogue
  // labels it either way.
  const isNew = raw.includes('new') || raw.includes('one') || raw.includes('trip')
  return isNew ? 'New' : 'Used'
}

/**
 * Grade as one of the four the site sells.
 *
 * Falls back to AS IS, which is also what an empty grade means in the
 * catalogue — an ungraded container is sold as-is.
 */
export function resolveGrade(product: ProductHit): ContainerGrade {
  const raw = getCustomFieldValue(product, 'grade').toLowerCase()
  if (raw.includes('iicl')) return 'IICL'
  if (raw.includes('cargo')) return 'Cargo Worthy'
  if (raw.includes('wind') || raw.includes('wwt') || raw.includes('water')) {
    return 'Wind and Water Tight'
  }
  return 'AS IS'
}

/** Both axes at once, for a component that renders per combination. */
export function resolveCombination(product: ProductHit): {
  condition: ContainerCondition
  grade: ContainerGrade
  key: CombinationKey
} {
  const condition = resolveCondition(product)
  const grade = resolveGrade(product)
  return { condition, grade, key: combinationKey(condition, grade) }
}
