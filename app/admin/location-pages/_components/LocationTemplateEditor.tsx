'use client'

import { EditorShell, type AdminActionResult } from '@/components/admin/EditorShell'
import { SectionDrawers, same, type DrawerSection, type SettingsPath } from '@/components/admin/SectionDrawers'
import { type FieldHints } from '@/components/admin/ValueEditor'
import { LOCATION_TEMPLATE_DEFAULT } from '@/lib/data/locationTemplate'
import { LOCATION_SECTION_LABELS } from '@/lib/locationAdmin'
import type { LocationSectionId, LocationTemplate } from '@/types/locationPage'

export const PLACEHOLDER_HELP =
  'Placeholders: {city} · {region} (GA) · {regionName} (Georgia) · {cityRegion} (the page’s full name, Atlanta, GA) · {phone} (a call link) · {lowestRent} (the depot’s cheapest rental). [[double brackets]] mark the red part; [label](/path) is a link. A blank line starts a new paragraph.'

const IMAGE_HELP = 'An image URL on the CDN, its alt text (empty for a decorative one) and its size in pixels.'

type Props = {
  initialValue: LocationTemplate
  /** What the pages show now: the list marks the sections the draft changes. */
  published: LocationTemplate
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
export function LocationTemplateEditor({ initialValue, published, previewHref, locations, specOptions, ...props }: Props) {
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
    <EditorShell initialValue={initialValue} preview={{ href: previewHref, locations }} scope="every location page" layout="split" {...props}>
      {(value, setValue) => {
        const missing = (Object.keys(LOCATION_SECTION_LABELS) as LocationSectionId[]).filter((id) => !value.sections.some((s) => s.id === id))
        return (
          <SectionDrawers
            value={value}
            onChange={setValue}
            sections={value.sections.map((section) => drawerFor(section.id))}
            hints={hints}
            published={published}
            defaults={LOCATION_TEMPLATE_DEFAULT}
            onMove={move}
            orderChanged={!same(value.sections.map((s) => s.id), published.sections.map((s) => s.id))}
            title="Sections, top to bottom"
            intro={
              <>
                Every location page, in this order: open a section to edit it, switch it off to hide it everywhere (a location can still set its own order on its screen). {PLACEHOLDER_HELP}
              </>
            }
            footer={
              missing.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {missing.map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setValue({ ...value, sections: [...value.sections, { id, enabled: true }] })}
                      className="rounded-md border border-dashed border-theme-border px-2.5 py-1.5 text-xs font-semibold hover:bg-theme-subtle dark:border-neutral-700 dark:hover:bg-neutral-800"
                    >
                      + Add {LOCATION_SECTION_LABELS[id]}
                    </button>
                  ))}
                </div>
              )
            }
          />
        )
      }}
    </EditorShell>
  )
}

/** Where each section's settings live: its wording, and the images, cards, products or questions it shows. */
const SECTION_PARTS: Record<LocationSectionId, { path: SettingsPath; title?: string }[]> = {
  hero: [{ path: ['text', 'hero'], title: 'Wording' }, { path: ['media', 'heroBackground'] }],
  budgetBand: [{ path: ['text', 'budgetBand'], title: 'Wording' }],
  options: [{ path: ['text', 'options'], title: 'Wording' }, { path: ['options'], title: 'The three cards' }],
  products: [{ path: ['text', 'products'], title: 'Wording' }, { path: ['productSpecs'] }],
  buy: [{ path: ['text', 'buy'], title: 'Wording' }],
  delivered: [{ path: ['text', 'delivered'], title: 'Wording' }, { path: ['deliveredPhotos'] }],
  satisfaction: [{ path: ['text', 'satisfaction'], title: 'Wording' }, { path: ['media', 'satisfactionSeal'], title: 'Seal image' }],
  callBand: [{ path: ['text', 'callBand'], title: 'Wording' }],
  featured: [{ path: ['text', 'stories'], title: 'Story labels (shared with News & updates)' }],
  news: [{ path: ['text', 'stories'], title: 'Story labels (shared with Featured story)' }],
  video: [{ path: ['text', 'video'], title: 'Wording' }, { path: ['media', 'youtubeId'] }],
  overview: [{ path: ['text', 'overview'], title: 'Wording' }],
  purchase: [{ path: ['text', 'purchase'], title: 'Wording' }, { path: ['media', 'purchaseImage'], title: 'Image' }],
  rental: [{ path: ['text', 'rental'], title: 'Wording' }, { path: ['media', 'rentalImage'], title: 'Image' }],
  rto: [{ path: ['text', 'rto'], title: 'Wording' }, { path: ['media', 'rtoImage'], title: 'Image' }],
  closingBand: [{ path: ['text', 'closingBand'], title: 'Wording' }],
  resources: [{ path: ['text', 'resources'], title: 'Wording' }],
  pricingForm: [{ path: ['text', 'pricingForm'], title: 'Wording' }],
  newsletter: [{ path: ['text', 'newsletter'], title: 'Wording' }],
  faq: [{ path: ['text', 'faq'], title: 'Wording' }, { path: ['faqs'] }],
}

function drawerFor(id: LocationSectionId): DrawerSection<LocationTemplate> {
  return {
    id,
    label: LOCATION_SECTION_LABELS[id],
    parts: SECTION_PARTS[id],
    shown: {
      get: (value) => value.sections.find((s) => s.id === id)?.enabled ?? false,
      set: (value, on) => ({ ...value, sections: value.sections.map((s) => (s.id === id ? { ...s, enabled: on } : s)) }),
    },
  }
}

/** Moves a section one place up or down in the page. */
function move(value: LocationTemplate, id: string, direction: -1 | 1): LocationTemplate {
  const from = value.sections.findIndex((s) => s.id === id)
  const to = from + direction
  if (from < 0 || to < 0 || to >= value.sections.length) return value
  const sections = [...value.sections]
  const [item] = sections.splice(from, 1)
  sections.splice(to, 0, item)
  return { ...value, sections }
}
