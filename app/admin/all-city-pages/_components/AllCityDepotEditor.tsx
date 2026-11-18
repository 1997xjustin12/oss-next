'use client'

import { EditorShell, type AdminActionResult } from '@/components/admin/EditorShell'
import { ValueEditor, type FieldHints } from '@/components/admin/ValueEditor'
import type { AllCityDepotForm } from '@/lib/allCityAdmin'

type Props = {
  label: string
  /** How many pages this depot's edits reach. */
  pageCount: number
  initialValue: AllCityDepotForm
  stateOptions: readonly { value: string; label: string }[]
  locationOptions: readonly { value: string; label: string }[]
  hasDraft: boolean
  status: { draft?: string; published?: string }
  previewPages: readonly { slug: string; label: string }[]
  previewHref: string
  save: (value: AllCityDepotForm) => Promise<AdminActionResult>
  publish: () => Promise<AdminActionResult>
  discard: () => Promise<AdminActionResult>
}

/** One depot: what every page on it shows of it (its name for the prices and cards, its location page, the banner). */
export function AllCityDepotEditor({ label, pageCount, stateOptions, locationOptions, previewPages, previewHref, ...props }: Props) {
  const BANNER_HELP = 'A CDN link (onsite-cdn.sfo3.cdn.digitaloceanspaces.com) and its size in pixels.'
  const hints: FieldHints = {
    key: { kind: 'readonly', label: 'Key', help: 'How the pages refer to this depot. Fixed.' },
    depot: { label: 'Depot (catalogue name)', help: 'As the catalogue writes it (“Houston, TX”): the hero’s price and the container cards are this depot’s listings.' },
    locationSlug: { label: 'Location page', kind: 'select', options: locationOptions, help: 'The city link in the container section’s heading ({depotPage}) opens it.' },
    state: { kind: 'select', options: stateOptions },
    banner: { label: 'Banner photo', help: BANNER_HELP },
    depotCityBanner: { label: 'Depot-city page banner', nullable: true, newItem: props.initialValue.banner, help: `Only where the depot-city page differs. ${BANNER_HELP}` },
  }

  return (
    <EditorShell preview={{ href: previewHref, locations: previewPages }} scope={`${label} (${pageCount.toLocaleString('en-US')} pages)`} {...props}>
      {(value, setValue) => (
        <div className="rounded-lg border border-theme-border bg-theme-bg p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <ValueEditor value={value} onChange={(next) => setValue(next as AllCityDepotForm)} hints={hints} />
        </div>
      )}
    </EditorShell>
  )
}
