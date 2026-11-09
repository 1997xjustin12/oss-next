'use client'

import { EditorShell, type AdminActionResult } from '@/components/admin/EditorShell'
import { ValueEditor, type FieldHints } from '@/components/admin/ValueEditor'
import { LOCATION_SECTION_LABELS } from '@/lib/locationAdmin'
import type { LocationSectionId, LocationTemplate } from '@/types/locationPage'

export const PLACEHOLDER_HELP =
  'Placeholders: {city} · {region} (GA) · {regionName} (Georgia) · {cityRegion} (the page’s full name, Atlanta, GA) · {phone} (a call link) · {lowestRent} (the depot’s cheapest rental). [[double brackets]] mark the red part; [label](/path) is a link. A blank line starts a new paragraph.'

const IMAGE_HELP = 'An image URL on the CDN, its alt text (empty for a decorative one) and its size in pixels.'

type Props = {
  initialValue: LocationTemplate
  hasDraft: boolean
  status: { draft?: string; published?: string }
  previewHref: string
  locations: readonly { slug: string; label: string }[]
  specOptions: readonly { value: string; label: string }[]
  save: (value: LocationTemplate) => Promise<AdminActionResult>
  publish: () => Promise<AdminActionResult>
  discard: () => Promise<AdminActionResult>
}

/** The template every location page renders: sections, all shared wording, images, products, delivery photos, FAQ. */
export function LocationTemplateEditor({ initialValue, previewHref, locations, specOptions, ...props }: Props) {
  const sectionOptions = (Object.keys(LOCATION_SECTION_LABELS) as LocationSectionId[]).map((id) => ({ value: id, label: LOCATION_SECTION_LABELS[id] }))
  const hints: FieldHints = {
    sections: {
      label: 'Sections',
      itemLabel: 'Section',
      help: 'Every location page, top to bottom. Untick a section to hide it everywhere; a location can still list its own order on its screen.',
      newItem: { id: 'hero', enabled: true },
    },
    'sections.*.id': { label: 'Section', kind: 'select', options: sectionOptions },
    'sections.*.enabled': { label: 'Shown' },
    text: { label: 'Wording', help: PLACEHOLDER_HELP },
    'text.buy.body': { multiline: true },
    'text.overview.body': { multiline: true },
    'text.satisfaction.body': { multiline: true },
    'text.purchase.body': { multiline: true },
    'text.rental.body': { multiline: true },
    'text.rto.body': { multiline: true },
    'text.newsletter.body': { multiline: true },
    'text.buy.citiesHeading': { label: 'Cities heading', help: 'Shown over the city list when set (Los Angeles: "Areas We Also Serve Nearby").' },
    media: { label: 'Images and video' },
    'media.heroBackground': { label: 'Hero photo URL' },
    'media.satisfactionSeal': { help: IMAGE_HELP },
    'media.purchaseImage': { help: IMAGE_HELP },
    'media.rentalImage': { help: IMAGE_HELP },
    'media.rtoImage': { help: IMAGE_HELP },
    'media.youtubeId': { label: 'Video', help: 'The YouTube id, or paste the YouTube link. Leave empty for no video section.' },
    options: { label: 'Buy / Rent / Rent-To-Own cards' },
    'options.buy.ptype': { kind: 'readonly' },
    'options.rent.ptype': { kind: 'readonly' },
    'options.rto.ptype': { kind: 'readonly' },
    'options.buy.bullets': { itemLabel: 'Bullet', newItem: '' },
    'options.rent.bullets': { itemLabel: 'Bullet', newItem: '' },
    'options.rto.bullets': { itemLabel: 'Bullet', newItem: '' },
    productSpecs: {
      label: 'Products row',
      itemLabel: 'Product',
      help: 'Which containers the row shows, in order, as each page’s depot stocks them (a depot without one shows fewer).',
      newItem: specOptions[0]?.value ?? '',
    },
    'productSpecs.*': { kind: 'select', options: specOptions },
    deliveredPhotos: {
      label: 'Delivery photos',
      itemLabel: 'Photo',
      help: 'The carousel after each page’s own photos. Captions are part of the pictures, so the alt text names the place.',
      newItem: { src: '', alt: '', width: 365, height: 362 },
    },
    faqs: { label: 'FAQ (pages that show it)', itemLabel: 'Question', newItem: { question: '', answer: [{ p: [''] }] } },
    'faqs.*.answer': {
      kind: 'json',
      help: 'Paragraphs and lists: [{"p": ["Text, ", {"text": "a link", "href": "/path"}, "."]}, {"ul": [["One"], ["Two"]]}].',
    },
  }

  return (
    <EditorShell initialValue={initialValue} preview={{ href: previewHref, locations }} scope="every location page" {...props}>
      {(value, setValue) => (
        <div className="rounded-lg border border-theme-border bg-theme-bg p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <ValueEditor value={value} onChange={(next) => setValue(next as LocationTemplate)} hints={hints} />
        </div>
      )}
    </EditorShell>
  )
}
