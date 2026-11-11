'use client'

import { EditorShell, type AdminActionResult } from '@/components/admin/EditorShell'
import { ValueEditor, type FieldHints } from '@/components/admin/ValueEditor'
import { LOCATION_LINK_LABELS, LOCATION_SECTION_LABELS, type LocationPageForm } from '@/lib/locationAdmin'
import { PLACEHOLDER_HELP } from './LocationTemplateEditor'
import type { LocationLinkKey, LocationSectionId, LocationTemplate } from '@/types/locationPage'

const BLANK_IMAGE = { src: '', alt: '', width: 800, height: 600 }

type Props = {
  label: string
  initialValue: LocationPageForm
  /** The template's wording, shown beside each override it would replace. */
  templateText: LocationTemplate['text']
  templateSections: LocationTemplate['sections']
  specOptions: readonly { value: string; label: string }[]
  /** Every depot (main and virtual), for the depot id select. */
  depotOptions: readonly { value: string; label: string }[]
  hasDraft: boolean
  status: { draft?: string; published?: string }
  previewHref: string
  save: (value: LocationPageForm) => Promise<AdminActionResult>
  publish: () => Promise<AdminActionResult>
  discard: () => Promise<AdminActionResult>
}

/** "Template: …", cut to a line, for a text override's help. */
function templateHelp(value: string): string {
  const flat = value.replace(/\s+/g, ' ').trim()
  return `Blank uses the template: “${flat.length > 160 ? `${flat.slice(0, 160)}…` : flat}”`
}

/**
 * One location: its place, depot and phone, its own sections, products and
 * buttons, cities, map, stories, photos, resources, and its wording where it
 * differs from the template (blank = the template's). SEO is the Page Configurator's.
 */
export function LocationPageEditor({ label, initialValue, templateText, templateSections, specOptions, depotOptions, previewHref, ...props }: Props) {
  const sectionOptions = (Object.keys(LOCATION_SECTION_LABELS) as LocationSectionId[]).map((id) => ({ value: id, label: LOCATION_SECTION_LABELS[id] }))

  const textHints: FieldHints = Object.fromEntries(
    Object.entries(templateText).flatMap(([group, base]) =>
      typeof base === 'string'
        ? [[`text.${group}`, { help: templateHelp(base), multiline: base.length > 90 }]]
        : Object.entries(base).map(([field, fieldValue]) => [`text.${group}.${field}`, { help: templateHelp(fieldValue), multiline: fieldValue.length > 90 }]),
    ),
  )
  const linkHints: FieldHints = Object.fromEntries(
    (Object.keys(LOCATION_LINK_LABELS) as LocationLinkKey[]).map((key) => [
      `links.${key}`,
      { label: LOCATION_LINK_LABELS[key], help: 'Blank opens the depot’s listing. A path (/shipping-container-quote), a full URL, or tel: to dial the page’s phone.' },
    ]),
  )

  const hints: FieldHints = {
    depot: { help: 'The depot record’s name, as the catalogue writes it ("Atlanta, GA"): its products, listing links and Google business data.' },
    depotId: {
      label: 'Depot (location id)',
      kind: 'select',
      options: depotOptions,
      help: 'Its “Recently Delivered Containers”: this depot’s deliveries and those of the virtual depots it serves.',
    },
    place: { label: 'Place', help: 'How the page names its place: {city}, {region}, {regionName}, {cityRegion} in the wording.' },
    'place.label': { label: 'Full name ({cityRegion})', help: '“Atlanta, GA”, “New York, NY / Newark, NJ”, “Salt Lake City”.' },
    'place.region': { label: 'State / province code' },
    'place.regionName': { label: 'State / province name' },
    phone: { label: 'Own phone', help: 'This location’s number, “(951) 399-2653”. Blank: the sales line, (888) 977-9085. Shown and dialled wherever the page has {phone}.' },
    sections: {
      label: 'This page’s own sections',
      nullable: true,
      newItem: templateSections,
      itemLabel: 'Section',
      help: 'Only when this page differs from the template’s order (Indianapolis, Los Angeles). Remove to follow the template again.',
    },
    'sections.*.id': { label: 'Section', kind: 'select', options: sectionOptions },
    'sections.*.enabled': { label: 'Shown' },
    productSpecs: {
      label: 'Its own products row',
      itemLabel: 'Product',
      help: 'Empty follows the template’s.',
      newItem: specOptions[0]?.value ?? '',
    },
    'productSpecs.*': { kind: 'select', options: specOptions },
    links: { label: 'Button targets' },
    ...linkHints,
    nearbyCities: { label: 'Nearby cities', itemLabel: 'City', newItem: { name: '', href: '' } },
    mapImage: { label: 'Map or photo beside the Buy section', nullable: true, newItem: BLANK_IMAGE },
    featured: { label: 'Featured story', nullable: true, newItem: { title: '', paragraphs: [''], image: BLANK_IMAGE } },
    'featured.paragraphs': { itemLabel: 'Paragraph', newItem: '', help: 'The first shows; the rest open with “Read More”.' },
    'featured.paragraphs.*': { multiline: true },
    news: { label: 'News & updates story', nullable: true, newItem: { title: '', paragraphs: [''], image: BLANK_IMAGE } },
    'news.paragraphs': { itemLabel: 'Paragraph', newItem: '' },
    'news.paragraphs.*': { multiline: true },
    deliveredLead: { label: 'Its own delivery photos', itemLabel: 'Photo', help: 'Shown before the template’s.', newItem: { src: '', alt: '', width: 365, height: 362 } },
    text: { label: 'Its own wording', help: `Fill a field only where this page says it differently. ${PLACEHOLDER_HELP}` },
    ...textHints,
    resources: { label: 'Resource articles (the “Resource articles” section)', itemLabel: 'Article', newItem: { title: '', paragraphs: [''], image: BLANK_IMAGE, href: '' } },
    'resources.*.paragraphs': { itemLabel: 'Paragraph', newItem: '' },
    'resources.*.paragraphs.*': { multiline: true },
    faqYoutubeId: { label: 'Video beside the FAQ', help: 'The YouTube id or link. Blank: the FAQ takes the full width.' },
    seo: {
      label: 'SEO defaults',
      help: 'What the page uses until the Page Configurator overrides it (that screen edits title, description, image and scripts for this page).',
    },
    'seo.description': { multiline: true },
  }

  return (
    <EditorShell initialValue={initialValue} preview={{ href: previewHref }} scope={label} {...props}>
      {(value, setValue) => (
        <div className="rounded-lg border border-theme-border bg-theme-bg p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <ValueEditor value={value} onChange={(next) => setValue(next as LocationPageForm)} hints={hints} />
        </div>
      )}
    </EditorShell>
  )
}
