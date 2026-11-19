'use client'

import { EditorShell, type AdminActionResult } from '@/components/admin/EditorShell'
import { ValueEditor, type FieldHints } from '@/components/admin/ValueEditor'
import type { AllCityPageForm } from '@/lib/allCityAdmin'

type Props = {
  label: string
  initialValue: AllCityPageForm
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

/**
 * One /all-city/ page: its city, state, depot and variant, its headings, SEO
 * and list membership, hidden / redirect. Every word on it is the template's
 * (Template screen), filled with these.
 */
export function AllCityPageEditor({ label, initialValue, stateOptions, depotOptions, previewHref, ...props }: Props) {
  const hints: FieldHints = {
    city: { help: 'The place’s name, as {city} reads in the template’s sections and in the city lists.' },
    state: { kind: 'select', options: stateOptions, help: 'Whose Popular / View-all lists the page sits in and shows.' },
    depotKey: { label: 'Depot', kind: 'select', options: depotOptions, help: 'Its prices (hero, container cards, Buy / Rent / Rent-To-Own), deliveries, banner and links.' },
    variant: {
      label: 'Template',
      kind: 'select',
      options: [
        { value: 'city', label: 'City (the usual page)' },
        { value: 'depotCity', label: 'Depot city (Houston, Miami…: its keyword heading over the container cards, its depot’s own banner)' },
      ],
    },
    h1: { label: 'Main heading (h1)', help: 'The hero’s heading ({h1}), its city part in amber. It matches the title and keyword: change them together.' },
    keywordHeading: { label: 'Keyword heading', help: 'Depot-city pages only: the heading over the container cards ({keyword}, “Cargo Containers For Sale Houston”).' },
    seo: { label: 'SEO' },
    'seo.title': { help: 'Used whole: write the ending too (“… | Best Prices & Fast Delivery”).' },
    'seo.description': { multiline: true },
    'seo.focusKeyphrase': { label: 'Focus keyphrase', help: 'Leads the keywords meta tag.' },
    'seo.keywords': { itemLabel: 'Keyword', newItem: '' },
    'seo.noindex': { label: 'noindex', help: 'Keep it out of search results (it stays reachable).' },
    'seo.canonical': { help: 'Another URL this page points search engines to (a near-duplicate’s main page). Blank: its own URL.' },
    lists: { label: 'City lists' },
    'lists.popular': { label: 'In “Popular Cities”', help: 'Linked from the other city pages of its state (the first ones, by name).' },
    'lists.viewAll': { label: 'In “View all cities”', help: 'In the full list under Popular Cities on every page of its state.' },
    hidden: { label: 'Hidden', help: 'The URL answers 404 and the page leaves both lists.' },
    redirectTo: { label: 'Redirect to', help: 'Another /all-city/ page’s slug (storage-units-longmont-co): a 301, and the page leaves both lists. Blank: no redirect.' },
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
