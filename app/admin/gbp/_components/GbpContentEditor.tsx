'use client'

import { EditorShell } from './EditorShell'
import { ValueEditor, type FieldHints } from './ValueEditor'
import type { GbpActionResult } from '@/actions/gbp'
import type { GbpContentModel } from '@/lib/gbpAdmin'

const ACCENT_HELP = 'Mark the red part with [[double brackets]].'

const HINTS: FieldHints = {
  location: { help: 'Used in headings, the map title and the structured data.' },
  'contact.phone': { help: 'This location’s own number, as shown. Every call button dials it.' },
  'contact.phoneE164': { kind: 'hidden' },
  'contact.addressLine': { label: 'Address (footer)', help: 'As shown in the footer.' },
  'contact.address': { label: 'Address (structured)', help: 'For Google’s business listing data.' },
  'contact.address.addressCountry': { label: 'Country', kind: 'select', options: [{ value: 'US', label: 'United States' }, { value: 'CA', label: 'Canada' }] },
  'contact.hours': { help: 'As shown in the footer, e.g. M-F 5am-5pm. The structured hours are on the SEO screen.' },
  'headings.hero': { label: 'Hero (h1)', help: ACCENT_HELP },
  'headings.trustedBy': { label: 'Trusted By', help: ACCENT_HELP },
  'headings.products': { label: 'Products', help: ACCENT_HELP },
  'headings.types': { label: 'Container types', help: ACCENT_HELP },
  'headings.resources': { label: 'Blog cards', help: ACCENT_HELP },
  about: { label: 'About Us paragraphs', itemLabel: 'Paragraph', newItem: '' },
  'about.*': { multiline: true },
  blogCards: { label: 'Blog cards', itemLabel: 'Card', newItem: { title: '', excerpt: '', url: '', image: '', imageAlt: '' } },
  'blogCards.*.excerpt': { multiline: true },
  'blogCards.*.url': { label: 'Post URL', help: 'The post this card opens. Leave empty for no link.' },
  'blogCards.*.image': { label: 'Image URL' },
  'blogCards.*.imageAlt': { label: 'Image alt text' },
  faqs: { label: 'FAQs', itemLabel: 'FAQ', newItem: { question: '', answer: '' } },
  'faqs.*.answer': { multiline: true },
  mapEmbedUrl: { label: 'Google Maps embed URL', help: 'Google Maps → the listing → Share → Embed a map → the src="…" URL.' },
  youtubeId: { label: 'YouTube video', help: 'The video id, or paste the YouTube link.' },
}

type Props = {
  label: string
  initialValue: GbpContentModel
  hasDraft: boolean
  status: { draft?: string; published?: string }
  previewHref: string
  save: (value: GbpContentModel) => Promise<GbpActionResult>
  publish: () => Promise<GbpActionResult>
  discard: () => Promise<GbpActionResult>
}

/** A location's content: contact, headings, About, blog cards, FAQs, map and video. */
export function GbpContentEditor({ label, initialValue, previewHref, ...props }: Props) {
  return (
    <EditorShell initialValue={initialValue} preview={{ href: previewHref }} scope={label} {...props}>
      {(value, setValue) => (
        <div className="rounded-lg border border-theme-border bg-theme-bg p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <ValueEditor value={value} onChange={(next) => setValue(next as GbpContentModel)} hints={HINTS} />
        </div>
      )}
    </EditorShell>
  )
}
