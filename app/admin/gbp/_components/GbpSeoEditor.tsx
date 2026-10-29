'use client'

import { discardGbpLocationAction, publishGbpLocationAction, saveGbpSeoDraftAction } from '@/actions/gbp'
import { EditorShell } from './EditorShell'
import { ValueEditor, type FieldHints } from './ValueEditor'
import type { GbpSeoForm, GbpSeoPageModel } from '@/lib/gbpAdmin'

export type GbpSeoModel = { page: GbpSeoPageModel; extras: GbpSeoForm }

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => ({ value: d, label: d }))

const HINTS: FieldHints = {
  page: { label: 'Search & sharing' },
  'page.seo': { label: 'Title, description, canonical, sharing image' },
  'page.seo.title': { help: 'The whole <title>; the site name is not appended.' },
  'page.seo.description': { multiline: true },
  'page.seo.canonical': { help: 'The canonical URL. Keep the trailing slash WordPress used.' },
  'page.seo.ogType': { label: 'og:type', kind: 'select', options: [{ value: 'article', label: 'article' }, { value: 'website', label: 'website' }] },
  'page.seo.ogImage': { label: 'Sharing image (og:image)', nullable: true, newItem: { url: '', width: 1200, height: 630 } },
  'page.seo.modifiedTime': { label: 'article:modified_time', help: 'ISO date, e.g. 2026-04-21T08:36:38+00:00. Empty for none.' },
  'page.geo': { label: 'Map coordinates (listing)', help: 'The pin in the structured data. Remove if unknown.', nullable: true, newItem: { lat: 0, lng: 0 } },
  'page.areaServed': { label: 'Areas served', itemLabel: 'City', newItem: '' },
  'page.listing': { label: 'Business listing (structured data)' },
  'page.listing.name': { label: 'Business name' },
  'page.listing.openingHours': { label: 'Opening hours', itemLabel: 'Hours', newItem: { days: ['Saturday'], opens: '09:00', closes: '13:00' } },
  'page.listing.openingHours.*.days': { itemLabel: 'Day', newItem: 'Monday' },
  'page.listing.openingHours.*.days.*': { kind: 'select', options: DAYS },
  'page.listing.openingHours.*.opens': { help: '24-hour HH:MM' },
  'page.listing.openingHours.*.closes': { help: '24-hour HH:MM' },
  'page.listing.extraJsonLd': { label: 'Extra JSON-LD nodes', kind: 'json', help: 'A JSON array of objects, added to the page’s graph as written.' },
  extras: { label: 'Keywords, robots, social text & head scripts' },
  // The page record holds these; the override layer would only duplicate them.
  'extras.title': { kind: 'hidden' },
  'extras.description': { kind: 'hidden' },
  'extras.canonical': { kind: 'hidden' },
  'extras.ogImage': { kind: 'hidden' },
  'extras.keywords': { help: 'Comma-separated. Empty for none.' },
  'extras.agentSummary': { label: 'Summary for AI agents', multiline: true, help: 'Plain sentences for /llms.txt. Empty: the description is used.' },
  'extras.robots': {
    kind: 'select',
    options: [
      { value: 'default', label: 'Default (index, follow)' },
      { value: 'index,follow', label: 'index, follow' },
      { value: 'index,nofollow', label: 'index, nofollow' },
      { value: 'noindex,follow', label: 'noindex, follow' },
      { value: 'noindex,nofollow', label: 'noindex, nofollow' },
    ],
  },
  'extras.ogTitle': { label: 'Sharing title (og:title)', help: 'Empty: the page title.' },
  'extras.ogDescription': { label: 'Sharing description (og:description)', multiline: true, help: 'Empty: the description.' },
  'extras.scripts': {
    label: 'Head scripts',
    itemLabel: 'Script',
    newItem: { id: '', name: '', src: '', code: '', strategy: 'lazyOnload', enabled: true },
    help: 'Loaded with next/script. Use a src or inline code, not both.',
  },
  'extras.scripts.*.id': { kind: 'hidden' },
  'extras.scripts.*.code': { multiline: true },
  'extras.scripts.*.strategy': {
    kind: 'select',
    options: [
      { value: 'lazyOnload', label: 'After the page is idle (recommended)' },
      { value: 'afterInteractive', label: 'As soon as the page is interactive' },
    ],
  },
}

type Props = {
  slug: string
  label: string
  initialValue: GbpSeoModel
  hasDraft: boolean
  status: { draft?: string; published?: string }
  previewHref: string
}

/** A location's SEO: title, description, canonical, sharing, the listing's structured data and head scripts. */
export function GbpSeoEditor({ slug, label, initialValue, hasDraft, status, previewHref }: Props) {
  return (
    <EditorShell
      initialValue={initialValue}
      hasDraft={hasDraft}
      status={status}
      scope={label}
      preview={{ href: previewHref }}
      save={(value) => saveGbpSeoDraftAction(slug, value.extras, value.page)}
      publish={() => publishGbpLocationAction(slug)}
      discard={() => discardGbpLocationAction(slug)}
    >
      {(value, setValue) => (
        <div className="rounded-lg border border-theme-border bg-theme-bg p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <ValueEditor value={value} onChange={(next) => setValue(next as GbpSeoModel)} hints={HINTS} />
        </div>
      )}
    </EditorShell>
  )
}
