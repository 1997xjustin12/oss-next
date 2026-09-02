import type { ComponentType } from 'react'
import type {
  CombinationKey,
  ContainerCondition,
  ContainerGrade,
} from '@/lib/containerOverview'

/**
 * What every size overview receives, and how each one dispatches.
 *
 * The size component is a router: it takes the selected condition and grade and
 * hands off to the component registered for that combination. Every combination
 * has an entry, so the registry is exhaustive by type rather than by
 * remembering — miss one and this fails to compile.
 */

export type OverviewProps = {
  condition: ContainerCondition
  grade: ContainerGrade
}

/** One component per combination. `Record`, not `Partial`, so none can be missed. */
export type CombinationRegistry = Record<CombinationKey, ComponentType>
