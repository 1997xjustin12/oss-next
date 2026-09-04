/**
 * The words this catalogue uses for a container's three axes.
 *
 * Deliberately dependency-free — no imports at all — so a build script can read
 * it without a bundler or path-alias resolver. That is the whole reason it is
 * separate from `containerOverview`: the resources audit runs under plain node
 * and has to check filenames against the same slugs the app derives them from.
 * A copy of this table in a script is how a slug and a filename drift apart.
 *
 * Each term carries the three ways it gets written down:
 *
 *   label  what a customer reads
 *   slug   filenames and URLs — lowercase, no spaces
 *   abbr   trade shorthand, for labels too tight for the full name
 *
 * Not every term abbreviates: IICL and AS IS are already as short as they get,
 * so their abbr is the label. That is deliberate, not an oversight — a call
 * site should reach for `abbr` without first checking one exists.
 */

export type SpecTerm = {
  label: string
  slug: string
  abbr: string
}

export const CONTAINER_CONDITIONS = ['Used', 'New'] as const
export const CONTAINER_GRADES = [
  'AS IS',
  'Wind and Water Tight',
  'Cargo Worthy',
  'IICL',
] as const

export type ContainerCondition = (typeof CONTAINER_CONDITIONS)[number]
export type ContainerGrade = (typeof CONTAINER_GRADES)[number]

// The three physical variants — [Size][Height]: 20S = 20' Standard,
// 40S = 40' Standard, 40H = 40' High Cube.
export const CONTAINER_VARIANTS = ['20S', '40S', '40H'] as const
export type ContainerVariantKey = (typeof CONTAINER_VARIANTS)[number]

export const CONDITION_TERMS: Record<ContainerCondition, SpecTerm> = {
  Used: { label: 'Used', slug: 'used', abbr: 'Used' },
  New:  { label: 'New',  slug: 'new',  abbr: 'New'  },
}

export const GRADE_TERMS: Record<ContainerGrade, SpecTerm> = {
  'AS IS':                { label: 'AS IS',                slug: 'asis', abbr: 'AS IS' },
  'Wind and Water Tight': { label: 'Wind and Water Tight', slug: 'wwt',  abbr: 'WWT'   },
  'Cargo Worthy':         { label: 'Cargo Worthy',         slug: 'cw',   abbr: 'CW'    },
  IICL:                   { label: 'IICL',                 slug: 'iicl', abbr: 'IICL'  },
}

export const SIZE_TERMS: Record<ContainerVariantKey, SpecTerm> = {
  '20S': { label: '20ft Standard',  slug: '20s', abbr: '20ft'    },
  '40S': { label: '40ft Standard',  slug: '40s', abbr: '40ft'    },
  '40H': { label: '40ft High Cube', slug: '40h', abbr: '40ft HC' },
}

export const conditionSlug = (c: ContainerCondition) => CONDITION_TERMS[c].slug
export const gradeSlug = (g: ContainerGrade) => GRADE_TERMS[g].slug
export const gradeAbbr = (g: ContainerGrade) => GRADE_TERMS[g].abbr
export const sizeSlug = (s: ContainerVariantKey) => SIZE_TERMS[s].slug

/**
 * The spec half of a resource filename: `used_20s_cw`.
 *
 * Lives here rather than beside the resource reader so the audit script builds
 * its expected names the same way the app builds the ones it asks for.
 */
export function specFileStem(
  size: ContainerVariantKey,
  condition: ContainerCondition,
  grade: ContainerGrade,
): string {
  return `${conditionSlug(condition)}_${sizeSlug(size)}_${gradeSlug(grade)}`
}

/**
 * Which combinations are actually stocked.
 *
 * New is only sold at IICL — a one-trip container has by definition not been
 * used enough to be graded lower.
 */
export const OFFERED_PAIRS: ReadonlyArray<[ContainerCondition, ContainerGrade]> = [
  ['Used', 'AS IS'],
  ['Used', 'Wind and Water Tight'],
  ['Used', 'Cargo Worthy'],
  ['Used', 'IICL'],
  ['New', 'IICL'],
]
