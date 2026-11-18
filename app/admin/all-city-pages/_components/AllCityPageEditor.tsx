'use client'

import { EditorShell, type AdminActionResult } from '@/components/admin/EditorShell'
import { ValueEditor, type FieldHints } from '@/components/admin/ValueEditor'
import type { AllCityPageForm } from '@/lib/allCityAdmin'
import type { AllCityTemplateText } from '@/types/allCity'

type Props = {
  label: string
  initialValue: AllCityPageForm
  /** The template's wording for this page's variant, shown beside each override. */
  templateText: AllCityTemplateText
  stateOptions: readonly { value: string; label: string }[]
  depotOptions: readonly { value: string; label: string }[]
  hasDraft: boolean
  status: { draft?: string; published?: string }
  previewHref: string
  save: (value: AllCityPageForm) => Promise<AdminActionResult>
  publish: () => Promise<AdminActionResult>
  discard: () => Promise<AdminActionResult>
}

export const ALL_CITY_PLACEHOLDER_HELP =
  'Placeholders: {city}, {CITY} (capitals), {state} (name), {ST} (code), {phone} (the sales line, as a call link). [text](/path) is a link, [[text]] an accent, a blank line a new paragraph.'

function templateHelp(value: string): string {
  const flat = value.replace(/\s+/g, ' ').trim()
  return flat ? `Blank uses the template: “${flat.length > 160 ? `${flat.slice(0, 160)}…` : flat}”` : 'Blank uses the template (empty there).'
}

/**
 * One /all-city/ page: its city, state, depot and template, its headings, SEO
 * and list membership, hidden / redirect, and its wording where it differs
 * from the template (blank = the template's).
 */
export function AllCityPageEditor({ label, initialValue, templateText, stateOptions, depotOptions, previewHref, ...props }: Props) {
  const textHints: FieldHints = Object.fromEntries(
    Object.entries(templateText).map(([key, value]) =>
      Array.isArray(value)
        ? [`text.${key}`, { itemLabel: 'Step', newItem: { title: '', text: '' }, help: 'Empty uses the template’s steps; any step here replaces all of them.' }]
        : [`text.${key}`, { help: templateHelp(value), multiline: value.length > 90 }],
    ),
  )

  const hints: FieldHints = {
    city: { help: 'The place’s name, as it reads in the template’s sentences and in both city lists.' },
    state: { kind: 'select', options: stateOptions, help: 'Whose Popular / View-all lists the page sits in and shows.' },
    depotKey: { label: 'Depot', kind: 'select', options: depotOptions, help: 'Its banner, the four product cards and the location buttons.' },
    variant: {
      label: 'Template',
      kind: 'select',
      options: [
        { value: 'city', label: 'City (the usual page)' },
        { value: 'depotCity', label: 'Depot city (Houston, Miami…: own hero and intro, “$50 off” band)' },
      ],
    },
    h1: { label: 'Main heading (h1)', help: 'City pages show it over the product cards. Depot-city pages show the city as their h1 and this nowhere.' },
    keywordHeading: { label: 'Keyword heading', help: 'Depot-city pages only: the h2 over the product cards (“Cargo Containers For Sale Houston”).' },
    seo: { label: 'SEO' },
    'seo.title': { help: 'Used whole: write the ending too (“… | Best Prices & Fast Delivery”).' },
    'seo.description': { multiline: true },
    'seo.focusKeyphrase': { label: 'Focus keyphrase', help: 'Leads the keywords meta tag.' },
    'seo.keywords': { itemLabel: 'Keyword', newItem: '' },
    'seo.noindex': { label: 'noindex', help: 'Keep it out of search results (it stays reachable).' },
    'seo.canonical': { help: 'Another URL this page points search engines to (a near-duplicate’s main page). Blank: its own URL.' },
    lists: { label: 'City lists' },
    'lists.popular': { label: 'In “Popular Cities”' },
    'lists.viewAll': { label: 'In “View all cities”' },
    hidden: { label: 'Hidden', help: 'The URL answers 404 and the page leaves both lists.' },
    redirectTo: { label: 'Redirect to', help: 'Another /all-city/ page’s slug (storage-units-longmont-co): a 301, and the page leaves both lists. Blank: no redirect.' },
    text: { label: 'Its own wording', help: `Fill a field only where this page says it differently. ${ALL_CITY_PLACEHOLDER_HELP}` },
    ...textHints,
  }

  return (
    <EditorShell initialValue={initialValue} preview={{ href: previewHref }} scope={label} {...props}>
      {(value, setValue) => (
        <div className="rounded-lg border border-theme-border bg-theme-bg p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <ValueEditor value={value} onChange={(next) => setValue(next as AllCityPageForm)} hints={hints} />
        </div>
      )}
    </EditorShell>
  )
}
