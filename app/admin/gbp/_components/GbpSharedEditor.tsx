'use client'

import { discardGbpRecordAction, publishGbpRecordAction, saveGbpSharedDraftAction } from '@/actions/gbp'
import { EditorShell } from './EditorShell'
import { ValueEditor, type FieldHints } from './ValueEditor'
import type { GbpSharedContent } from '@/types/gbp'

const ACCENT_HELP = 'Mark the red part with [[double brackets]].'
const IMAGE = { src: '', alt: '', width: 500, height: 500 }

const HINTS: FieldHints = {
  header: { label: 'Header' },
  'header.announcement': { label: 'Announcement bar', help: '{phone} becomes the page’s own number.' },
  'header.nav': { label: 'Navigation', itemLabel: 'Link', newItem: { label: '', href: '#' }, help: 'In-page anchors (#about, #types, #choose, #faqs) or a /path.' },
  hero: { label: 'Hero' },
  'hero.bullets': { label: 'Ticks', itemLabel: 'Tick', newItem: '' },
  'hero.quoteCtaLabel': { label: '"Request a Quote" button' },
  'hero.background': { label: 'Background image URL', help: 'The LCP image: keep it optimised.' },
  'hero.badges': { label: 'Trust badges', itemLabel: 'Badge', newItem: IMAGE },
  trustedLogos: { label: 'Trusted By logos', itemLabel: 'Logo', newItem: { src: '', alt: '' } },
  productCards: { label: 'Product cards', itemLabel: 'Card', newItem: { title: '', features: [''], image: IMAGE } },
  'productCards.*.features': { itemLabel: 'Tick', newItem: '' },
  reviewsHeading: { label: 'Reviews heading', help: ACCENT_HELP },
  containerTypes: { label: 'Container types', itemLabel: 'Row', newItem: { accent: '', rest: '', body: '', image: IMAGE } },
  'containerTypes.*.accent': { label: 'Red word(s)' },
  'containerTypes.*.rest': { label: 'Rest of the heading' },
  'containerTypes.*.body': { multiline: true },
  whyChoose: { label: 'Why Choose Us' },
  'whyChoose.items': { itemLabel: 'Card', newItem: { icon: 'medal', title: '', body: '' } },
  'whyChoose.items.*.icon': {
    kind: 'select',
    options: [
      { value: 'user-shield', label: 'Staff (shield)' },
      { value: 'medal', label: 'Satisfaction (medal)' },
      { value: 'money-bill', label: 'Prices (banknote)' },
      { value: 'retweet', label: 'Returns (arrows)' },
    ],
  },
  'whyChoose.items.*.body': { multiline: true },
  about: { label: 'About Us (shared part)' },
  'about.cta': { label: 'Call button text' },
  quote: { label: 'Quote form' },
  'quote.heading': { help: ACCENT_HELP },
  newsletter: { label: 'Newsletter band' },
  'newsletter.heading': { help: ACCENT_HELP },
  'newsletter.body': { multiline: true },
  'newsletter.background': { label: 'Background image URL' },
  faqHeading: { label: 'FAQ heading', help: ACCENT_HELP },
  footer: { label: 'Footer' },
  'footer.logoHref': { label: 'Logo link' },
}

type Props = {
  initialValue: GbpSharedContent
  hasDraft: boolean
  status: { draft?: string; published?: string }
  previewHref: string
  locations: readonly { slug: string; label: string }[]
}

/** Content every GBP page shows: header, hero, logos, cards, types, Why Choose Us, form copy, footer. */
export function GbpSharedEditor({ previewHref, locations, ...props }: Props) {
  return (
    <EditorShell
      {...props}
      scope="every GBP page"
      preview={{ href: previewHref, locations }}
      save={(value) => saveGbpSharedDraftAction(value as unknown as Record<string, unknown>)}
      publish={() => publishGbpRecordAction('shared')}
      discard={() => discardGbpRecordAction('shared')}
    >
      {(value, setValue) => (
        <div className="rounded-lg border border-theme-border bg-theme-bg p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <ValueEditor value={value} onChange={(next) => setValue(next as GbpSharedContent)} hints={HINTS} />
        </div>
      )}
    </EditorShell>
  )
}
