'use client'

import { EditorShell, type AdminActionResult } from '@/components/admin/EditorShell'
import { ValueEditor, type FieldHints } from '@/components/admin/ValueEditor'
import { ALL_CITY_PLACEHOLDER_HELP } from './AllCityPageEditor'
import type { AllCityTemplate } from '@/types/allCity'

type Props = {
  initialValue: AllCityTemplate
  hasDraft: boolean
  status: { draft?: string; published?: string }
  /** Pages to preview the draft on: a city page and a depot-city page. */
  previewPages: readonly { slug: string; label: string }[]
  previewHref: string
  save: (value: AllCityTemplate) => Promise<AdminActionResult>
  publish: () => Promise<AdminActionResult>
  discard: () => Promise<AdminActionResult>
}

const VARIANT_HINTS = (variant: 'city' | 'depotCity'): FieldHints => ({
  [`${variant}.heroBody`]: { label: 'Hero text', multiline: true },
  [`${variant}.depotButton`]: { label: '“See all location prices” button', help: 'Opens the depot’s location page.' },
  [`${variant}.otherButton`]: { label: '“See other location prices” button' },
  [`${variant}.otherHref`]: { label: 'Its link', help: 'Blank: each depot’s own (Depots screen).' },
  [`${variant}.introBody`]: { label: 'Intro paragraphs', multiline: true },
  [`${variant}.whyBody`]: { label: '“Why choose” paragraphs', multiline: true },
  [`${variant}.steps`]: { itemLabel: 'Step', newItem: { title: '', text: '' } },
  [`${variant}.rentalBody`]: { multiline: true },
  [`${variant}.leaseBody`]: { multiline: true },
  [`${variant}.offerBand`]: { label: 'Closing band', help: 'Blank: no band. The depot-city pages have “GET $50 OFF … {phone}”.' },
})

/** The template every /all-city/ page renders: both variants' wording, the images, the video and the two fixed links. */
export function AllCityTemplateEditor({ initialValue, previewPages, previewHref, ...props }: Props) {
  const hints: FieldHints = {
    city: { label: 'City pages (8,516)', help: ALL_CITY_PLACEHOLDER_HELP },
    depotCity: { label: 'Depot-city pages (23: Houston, Miami…)', help: ALL_CITY_PLACEHOLDER_HELP },
    ...VARIANT_HINTS('city'),
    ...VARIANT_HINTS('depotCity'),
    media: { label: 'Images and video' },
    'media.heroBackground': { label: 'Hero photo', help: 'A CDN link (onsite-cdn.sfo3.cdn.digitaloceanspaces.com) or a site path.' },
    'media.pinIcon': { label: 'Pin icon beside the city' },
    'media.youtubeId': { label: 'Video (YouTube id or link)', help: 'Blank: no video.' },
    links: { label: 'Links' },
    'links.quote': { label: '“GET A QUOTE”' },
    'links.financing': { label: '“APPLY FOR FINANCING”' },
  }

  return (
    <EditorShell initialValue={initialValue} preview={{ href: previewHref, locations: previewPages }} scope="every /all-city/ page" {...props}>
      {(value, setValue) => (
        <div className="rounded-lg border border-theme-border bg-theme-bg p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <ValueEditor value={value} onChange={(next) => setValue(next as AllCityTemplate)} hints={hints} />
        </div>
      )}
    </EditorShell>
  )
}
