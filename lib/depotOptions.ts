import { DEFAULT_LOCATION } from '@/lib/constants'
import type { Depot } from '@/types/depot'

/**
 * Every depot as an admin select's options, by name: "Atlanta, GA (#4, main ·
 * serves 18 virtual)", "Raleigh, NC (#37, virtual · from Charlotte, NC)". The
 * "Various North America" placeholder is never offered. Server-side: pass the
 * result to a Client Component rather than the depot list.
 */
export function depotSelectOptions(depots: readonly Depot[]): { value: string; label: string }[] {
  return depots
    .filter((d) => d.title !== DEFAULT_LOCATION)
    .toSorted((a, b) => a.title.localeCompare(b.title))
    .map((d) => ({
      value: String(d.id),
      label: `${d.title} (#${d.id}, ${d.type === 'virtual' ? `virtual · from ${d.main_depot?.title ?? '?'}` : `main · serves ${d.satellites.length} virtual`})`,
    }))
}
