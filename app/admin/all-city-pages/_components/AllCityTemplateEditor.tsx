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
  /** The listings a container card can stand for. */
  specOptions: readonly { value: string; label: string }[]
  save: (value: AllCityTemplate) => Promise<AdminActionResult>
  publish: () => Promise<AdminActionResult>
  discard: () => Promise<AdminActionResult>
}

const VARIANT_HINTS = (variant: 'city' | 'depotCity'): FieldHints => ({
  [`${variant}.introBody`]: { label: 'Intro paragraphs', multiline: true },
  [`${variant}.whyBody`]: { label: '“Why choose” paragraphs', multiline: true },
  [`${variant}.steps`]: { itemLabel: 'Step', newItem: { title: '', text: '' } },
  [`${variant}.rentalBody`]: { multiline: true },
  [`${variant}.leaseBody`]: { multiline: true },
  [`${variant}.offerBand`]: { label: 'Closing band', help: 'Blank: no band. The depot-city pages have “GET $50 OFF … {phone}”.' },
})

const OFFER_KIND_OPTIONS = [
  { value: 'buy', label: 'Buy' },
  { value: 'rent', label: 'Rent' },
  { value: 'rto', label: 'Rent-To-Own' },
]

const OFFER_ICON_OPTIONS = [
  { value: 'price', label: 'Price tag ($)' },
  { value: 'sizes', label: 'Sizes (arrows)' },
  { value: 'conditions', label: 'Conditions (container)' },
  { value: 'guides', label: 'Guides (book)' },
  { value: 'terms', label: 'Terms (calendar)' },
  { value: 'delivery', label: 'Delivery (truck)' },
  { value: 'ownership', label: 'Ownership (key)' },
  { value: 'approval', label: 'Approval (badge)' },
]

const SECTION_HERO_HELP =
  'Also: {h1} the page’s own heading (city part in amber), {depot} its depot, {price} the depot’s lowest used container price (a figure using it is hidden when there is none), {depotCount} “1 Depot”.'

/** The template every /all-city/ page renders: the redesigned sections, both variants' wording, the images, the video and the two fixed links. */
export function AllCityTemplateEditor({ initialValue, previewPages, previewHref, specOptions, ...props }: Props) {
  const hints: FieldHints = {
    city: { label: 'City pages (8,516)', help: ALL_CITY_PLACEHOLDER_HELP },
    depotCity: { label: 'Depot-city pages (23: Houston, Miami…)', help: ALL_CITY_PLACEHOLDER_HELP },
    ...VARIANT_HINTS('city'),
    ...VARIANT_HINTS('depotCity'),
    sections: { label: 'Redesigned sections (every page)', help: `Top of the page, in order. ${ALL_CITY_PLACEHOLDER_HELP}` },
    'sections.breadcrumbs': { label: 'Breadcrumbs', help: 'Home / state / city above the hero. The state links to its list on /all-city.' },
    'sections.breadcrumbs.home': { label: 'First crumb (links to the homepage)' },
    'sections.breadcrumbs.state': { label: 'Second crumb (the state)' },
    'sections.breadcrumbs.city': { label: 'Last crumb (this page)' },
    'sections.hero': { label: 'Hero', help: SECTION_HERO_HELP },
    'sections.hero.badge': { label: 'Red label', help: 'Blank: no label.' },
    'sections.hero.heading': { label: 'Heading (the page’s h1)', help: '{h1} is each page’s own heading (its screen), which matches its title and keyword: keep it for SEO.' },
    'sections.hero.body': { label: 'Text under the heading', multiline: true },
    'sections.hero.stats': { label: 'Figures under the hero', itemLabel: 'Figure', newItem: { value: '', label: '' } },
    'sections.hero.quote': { label: 'Free-quote card', help: 'Its button is not connected yet.' },
    'sections.products': {
      label: 'Find The Right Shipping Container',
      help: 'The container cards, priced and pictured from the page’s depot; a card the depot has no listing for is hidden. Also: {depotPage} the depot’s location page, {keyword} a depot-city page’s keyword heading.',
    },
    'sections.products.heading': { label: 'Heading', help: '[text]({depotPage}) links the city to its depot’s page.' },
    'sections.products.depotCityHeading': { label: 'Heading on the depot-city pages', help: '{keyword} keeps each one’s keyword heading (its screen). Blank: the heading above.' },
    'sections.products.body': { label: 'Text under the heading', multiline: true },
    'sections.products.cards': {
      label: 'Cards',
      itemLabel: 'Card',
      newItem: { spec: specOptions[0]?.value ?? '', title: '', description: '', button: 'Get Free Quote' },
    },
    'sections.products.cards.*.spec': { label: 'Container (its photo and price at the depot)', kind: 'select', options: specOptions },
    'sections.products.cards.*.description': { multiline: true },
    'sections.products.button': { label: 'Button under the cards', help: 'Blank: no button.' },
    'sections.products.buttonHref': { label: 'Its link' },
    'sections.products.note': { label: 'Line under the button', help: 'Blank: none.' },
    'sections.trustedBy': { label: 'Trusted By (logo carousel)', help: 'The homepage’s logos, scrolling, in colour on a light grey band.' },
    'sections.trustedBy.show': { label: 'Show it' },
    'sections.trustedBy.heading': { label: 'Heading over the logos', help: 'Blank: none (as designed).' },
    'sections.offers': {
      label: 'Buy / Rent / Rent-To-Own',
      help: 'The homepage’s tabs, priced at the page’s depot: {buy}, {rent} and {rto} are its lowest prices of each kind (the country’s lowest where the depot has none).',
    },
    'sections.offers.show': { label: 'Show it' },
    'sections.offers.tabs': {
      label: 'Tabs',
      itemLabel: 'Tab',
      help: 'One each of Buy, Rent and Rent-To-Own, at most three; a repeated one is dropped.',
    },
    'sections.offers.tabs.*.id': { label: 'Kind', kind: 'select', options: OFFER_KIND_OPTIONS },
    'sections.offers.tabs.*.label': { label: 'Tab name' },
    'sections.offers.tabs.*.price': { label: 'Price on the tab' },
    'sections.offers.tabs.*.note': { label: 'After the price (grey)' },
    'sections.offers.tabs.*.body': { label: 'Paragraphs', multiline: true },
    'sections.offers.tabs.*.card': { label: 'Price card' },
    'sections.offers.tabs.*.card.suffix': { label: 'After the price (smaller)', help: '“/mo” for a monthly price.' },
    'sections.offers.tabs.*.features': { label: 'Features', itemLabel: 'Feature', newItem: { icon: 'price', title: '', text: '' } },
    'sections.offers.tabs.*.features.*.icon': { kind: 'select', options: OFFER_ICON_OPTIONS },
    'sections.howItWorks': { label: 'How It Works', help: 'The homepage’s steps. {depotPage} is the page’s depot’s location page, {depotPlp} the listing at that depot.' },
    'sections.howItWorks.show': { label: 'Show it' },
    'sections.howItWorks.eyebrow': { label: 'Small red line over the heading', help: 'Blank: none.' },
    'sections.howItWorks.subtitle': { label: 'Line under the heading', help: '[{city}, {ST}]({depotPage}) links the city to its depot’s page.' },
    'sections.howItWorks.steps': { label: 'Steps', itemLabel: 'Step', newItem: { title: '', desc: '' } },
    'sections.howItWorks.steps.*.desc': { label: 'Text', multiline: true, help: '{phone} is the sales line; [text](/path) a link.' },
    'sections.howItWorks.button': { label: 'Button under the steps', help: 'Blank: no button.' },
    'sections.howItWorks.buttonHref': { label: 'Its link', help: '{depotPlp}: the listing at the page’s main depot (the default). {depotPage}: its location page. Or any link.' },
    media: { label: 'Images and video' },
    'media.heroBackground': { label: 'Hero photo', help: 'A CDN link (onsite-cdn.sfo3.cdn.digitaloceanspaces.com) or a site path.' },
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
