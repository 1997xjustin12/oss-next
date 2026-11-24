'use client'

import { EditorShell, type AdminActionResult } from '@/components/admin/EditorShell'
import { SectionDrawers, type DrawerSection } from '@/components/admin/SectionDrawers'
import { type FieldHints } from '@/components/admin/ValueEditor'
import { ALL_CITY_TEMPLATE_DEFAULT } from '@/lib/data/allCityTemplate'
import { ALL_CITY_PLACEHOLDER_HELP } from './AllCityPageEditor'
import type { AllCityTemplate } from '@/types/allCity'

type Props = {
  initialValue: AllCityTemplate
  /** What the pages show now: the list marks the sections the draft changes. */
  published: AllCityTemplate
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
  { value: 'convert', label: 'Convert (hand and coin)' },
]

const SECTION_HERO_HELP =
  'Also: {h1} the page’s own heading (city part in amber), {depot} its depot, {price} the depot’s lowest used container price (a figure using it is hidden when there is none), {depotCount} “1 Depot”.'

/** The template every /all-city/ page renders: its sections, top to bottom, and the hero photo. */
export function AllCityTemplateEditor({ initialValue, published, previewPages, previewHref, specOptions, ...props }: Props) {
  const hints: FieldHints = {
    sections: { label: 'Sections (every page)', help: `Top of the page, in order. ${ALL_CITY_PLACEHOLDER_HELP}` },
    'sections.breadcrumbs': { label: 'Breadcrumbs', help: 'Home / state / city above the hero. The state links to its list on /all-city.' },
    'sections.breadcrumbs.home': { label: 'First crumb (links to the homepage)' },
    'sections.breadcrumbs.state': { label: 'Second crumb (the state)' },
    'sections.breadcrumbs.city': { label: 'Last crumb (this page)' },
    'sections.hero': { label: 'Hero', help: SECTION_HERO_HELP },
    'sections.hero.badge': { label: 'Red label', help: 'Blank: no label.' },
    'sections.hero.heading': { label: 'Heading (the page’s h1)', help: '{h1} is each page’s own heading (its screen), which matches its title and keyword: keep it for SEO.' },
    'sections.hero.body': { label: 'Text under the heading', multiline: true },
    'sections.hero.stats': { label: 'Figures under the hero', itemLabel: 'Figure', newItem: { value: '', label: '' } },
    'sections.hero.quote': { label: 'Free-quote card', help: 'Hidden for now: its button is not connected to a Zoho form yet. Turn it on once it is.' },
    'sections.hero.quote.show': { label: 'Show it' },
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
    'sections.difference': {
      label: 'The On-Site Storage Difference',
      help: '[[text]] is red; [{depot}]({depotPage}) names the page’s depot and links its location page.',
    },
    'sections.difference.show': { label: 'Show it' },
    'sections.difference.body': { label: 'Text under the heading', multiline: true },
    'sections.difference.points': { label: 'Points', itemLabel: 'Point', newItem: { title: '', desc: '' } },
    'sections.difference.points.*.desc': { label: 'Text', multiline: true },
    'sections.difference.button': { label: 'Call button', help: 'Calls the sales line. Blank: no button.' },
    'sections.difference.image': { label: 'Photo', help: 'Blank: each page’s depot banner (Depots screen). Or a CDN link / site path for every page.' },
    'sections.deliveries': {
      label: 'Recently Delivered Containers',
      help: 'The newest deliveries from the page’s depot (Admin → Delivered Containers), photo only. Hidden on a page whose depot has none.',
    },
    'sections.deliveries.show': { label: 'Show it' },
    'sections.deliveries.body': { label: 'Text under the heading', multiline: true },
    'sections.deliveries.placeLabel': { label: 'Line under each card’s title', help: '{place}: where it was delivered (city only).' },
    'sections.deliveries.limit': { label: 'How many cards', help: '1 to 20, newest first; four show at a time on desktop, the arrows scroll the rest.' },
    'sections.popular': {
      label: 'Popular Cities',
      help: 'Links to other city pages of the state (its Popular Cities list, set per page on its screen), then the closed “View all cities” list of every other city page of the state.',
    },
    'sections.popular.show': { label: 'Show it' },
    'sections.popular.body': { label: 'Text under the heading', multiline: true, help: '{depot} is the page’s depot, {state} the state’s name.' },
    'sections.popular.limit': { label: 'How many cities', help: '1 to 20 (a state lists at most 20).' },
    'sections.popular.viewAllLabel': {
      label: '“View all cities” button',
      help: 'Opens the full list of the state’s other city pages, under the cities above. Keep it: it is how search engines reach every city page. It stays even with this section off; blank removes it.',
    },
    'sections.popular.button': { label: 'Call button', help: 'Calls the sales line. Blank: no button.' },
    'sections.quote': {
      label: 'Get A Free Quote (form)',
      help: 'The homepage’s quote section: the Zoho pricing form (its fields are Zoho’s) beside these words. A lead lands in Zoho as one from the homepage.',
    },
    'sections.quote.show': { label: 'Show it' },
    'sections.quote.body': { label: 'Paragraph', multiline: true },
    'sections.quote.points': { label: 'Ticked points', itemLabel: 'Point', newItem: '', help: 'Up to six.' },
    'sections.faq': {
      label: 'Frequently Asked Questions',
      help: 'An accordion, the first question open; also the page’s FAQ structured data (Google can show it in results). Also: {price} the depot’s lowest used container price, {rentFrom} and {rtoFrom} its lowest monthly rent and rent-to-own. A question whose answer needs a price the depot lacks is left out.',
    },
    'sections.faq.show': { label: 'Show it' },
    'sections.faq.items': { label: 'Questions', itemLabel: 'Question', newItem: { question: '', answer: '' }, help: 'Up to 12.' },
    'sections.faq.items.*.answer': { label: 'Answer', multiline: true, help: '{phone} is the sales line, as a call link.' },
    'sections.howItWorks.buttonHref': { label: 'Its link', help: '{depotPlp}: the listing at the page’s main depot (the default). {depotPage}: its location page. Or any link.' },
    media: { label: 'Images' },
    'media.heroBackground': { label: 'Hero photo', help: 'A CDN link (onsite-cdn.sfo3.cdn.digitaloceanspaces.com) or a site path.' },
  }

  return (
    <EditorShell initialValue={initialValue} preview={{ href: previewHref, locations: previewPages }} scope="every /all-city/ page" layout="split" {...props}>
      {(value, setValue, { showInPreview }) => (
        <SectionDrawers
          value={value}
          onChange={setValue}
          sections={DRAWERS}
          hints={hints}
          published={published}
          defaults={ALL_CITY_TEMPLATE_DEFAULT}
          showInPreview={showInPreview}
          title="Sections, top to bottom"
          intro={<>Open a section to edit it. {ALL_CITY_PLACEHOLDER_HELP}</>}
        />
      )}
    </EditorShell>
  )
}

type SectionKey = keyof AllCityTemplate['sections']

/** A section with a "Show it" switch: its `show` field, as the row's switch. */
const shown = (key: SectionKey): DrawerSection<AllCityTemplate>['shown'] => ({
  get: (value) => (value.sections[key] as { show?: boolean }).show !== false,
  set: (value, on) => ({ ...value, sections: { ...value.sections, [key]: { ...value.sections[key], show: on } } }),
  path: ['sections', key, 'show'],
})

/** The page's sections in order (components/allCity/AllCityPage.tsx), and the hero photo. Anchors: the section's id on the page. */
const DRAWERS: readonly DrawerSection<AllCityTemplate>[] = [
  { id: 'breadcrumbs', label: 'Breadcrumbs', parts: [{ path: ['sections', 'breadcrumbs'] }] },
  { id: 'hero', label: 'Hero', parts: [{ path: ['sections', 'hero'] }], anchor: 'city-hero-title' },
  { id: 'products', label: 'Find The Right Shipping Container', parts: [{ path: ['sections', 'products'] }], anchor: 'city-products' },
  { id: 'trustedBy', label: 'Trusted By (logo carousel)', parts: [{ path: ['sections', 'trustedBy'] }], shown: shown('trustedBy') },
  { id: 'offers', label: 'Buy / Rent / Rent-To-Own', parts: [{ path: ['sections', 'offers'] }], shown: shown('offers') },
  { id: 'howItWorks', label: 'How It Works', parts: [{ path: ['sections', 'howItWorks'] }], shown: shown('howItWorks'), anchor: 'hiw-title' },
  { id: 'difference', label: 'The On-Site Storage Difference', parts: [{ path: ['sections', 'difference'] }], shown: shown('difference'), anchor: 'osd-title' },
  { id: 'deliveries', label: 'Recently Delivered Containers', parts: [{ path: ['sections', 'deliveries'] }], shown: shown('deliveries'), anchor: 'city-deliveries' },
  { id: 'popular', label: 'Popular Cities', parts: [{ path: ['sections', 'popular'] }], shown: shown('popular'), anchor: 'city-popular-cities' },
  { id: 'quote', label: 'Get A Free Quote (form)', parts: [{ path: ['sections', 'quote'] }], shown: shown('quote'), anchor: 'quote-section' },
  { id: 'faq', label: 'Frequently Asked Questions', parts: [{ path: ['sections', 'faq'] }], shown: shown('faq'), anchor: 'city-faq' },
  { id: 'media', label: 'Hero photo', parts: [{ path: ['media'] }], anchor: 'city-hero-title' },
]
