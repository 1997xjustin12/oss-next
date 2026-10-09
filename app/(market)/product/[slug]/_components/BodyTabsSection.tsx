'use client'

import { useState } from 'react'
import { ShieldCheck, Truck, Eye, RotateCcw } from 'lucide-react'
import type { ContainerVariantKey } from '@/lib/containerVariant'
import { resolveCombination } from '@/lib/containerOverview'
import type { ProductHit } from '@/types/product'
import { Overview20S } from './overview/Overview20S'
import { Overview40S } from './overview/Overview40S'
import { Overview40H } from './overview/Overview40H'
import { Specifications } from './Specifications'
import { DeliveryInfo } from './DeliveryInfo'
import { PDP_BODY_TABS, PDP_SHIPPING_CONTAINERS, type PdpBodyTabId } from '@/lib/data/pdpShippingContainers'
import { TabSections } from './TabSections'

// Warranty terms don't vary by container size — same copy for all variants.
const warrantySteps = [
  { Icon: Truck, title: 'Container Arrives', desc: 'Your container is delivered and placed exactly where you need it.' },
  { Icon: Eye, title: 'Inspect It Same Day', desc: "Take a look. If it doesn't meet your expectations, just let us know before the day is over." },
  { Icon: RotateCcw, title: 'Get A Full Refund', desc: "We'll refund your purchase in full, minus the shipping fee — no hassle, no stress." },
]

// The tab list lives in lib/data/pdpShippingContainers.ts, beside the content
// keyed by it: a tab renamed in one place and not the other is then a type
// error rather than a panel that silently loses its copy.
type BodyTab = PdpBodyTabId

/**
 * Tabs with a panel built into this component, whatever the data says.
 *
 * Everything else only appears once its size has copy — which today means
 * `upgrades`, whose tab stays hidden rather than opening onto an empty panel.
 * Drop `sections` into a size's `tabs.upgrades` and the tab appears for it.
 */
const ALWAYS_RENDERED: readonly BodyTab[] = ['overview', 'specs', 'delivery', 'warranty']

type Props = {
  variant: ContainerVariantKey
  /**
   * The container on screen. Its condition and grade choose which overview
   * renders, so the copy follows the option pickers rather than describing
   * whichever variant the page happened to load on.
   */
  product: ProductHit
}

export function BodyTabsSection({ variant, product }: Props) {
  const [bodyTab, setBodyTab] = useState<BodyTab>('overview')
  const { condition, grade } = resolveCombination(product)

  const tabContent = PDP_SHIPPING_CONTAINERS[variant].tabs
  const upgrades = tabContent.upgrades
  const bodyTabs = PDP_BODY_TABS.filter(
    (t) => ALWAYS_RENDERED.includes(t.id) || tabContent[t.id],
  )

  // Every panel is rendered; only the active one is shown.
  //
  // This used to render just the active tab, so the Specifications text was not
  // in the server HTML at all, and a separate <noscript> copy was added to give
  // crawlers something to read. React treats <noscript> contents as ordinary
  // markup, but a browser with JavaScript on parses them as plain text. On a
  // cold render React split that copy into streamed pieces whose placeholders
  // sat inside the <noscript>, never became elements, and made React's swap
  // script throw "Cannot read properties of null (reading 'parentNode')" —
  // reproduced on the first product-page load after a server start.
  //
  // With the panels in the page, the specs are in the HTML for everyone and the
  // <noscript> copy is gone, so that failure has nowhere left to happen. `hidden`
  // keeps inactive panels out of layout and out of the accessibility tree.
  const panelProps = (id: BodyTab) => ({
    role: 'tabpanel' as const,
    id: `body-panel-${id}`,
    'aria-labelledby': `body-tab-${id}`,
    hidden: bodyTab !== id,
  })

  return (
    <section className="px-4 sm:px-[5%]">
      <div
        role="tablist"
        aria-label="Product details"
        className="flex gap-1 overflow-x-auto border-b-2 border-theme-border mb-8 -mx-1 px-1 scrollbar-none"
      >
        {bodyTabs.map((t, index) => (
          <button
            key={`body-tabs-${t.id}-${index}`}
            type="button"
            role="tab"
            id={`body-tab-${t.id}`}
            aria-selected={bodyTab === t.id}
            aria-controls={`body-panel-${t.id}`}
            onClick={() => setBodyTab(t.id)}
            className={`relative font-bold text-sm sm:text-base px-3 sm:px-5 py-1 whitespace-nowrap transition-colors
              ${bodyTab === t.id ? 'text-white bg-theme-primary rounded-tr-[15px]' : 'text-theme-muted hover:text-theme-dark'}`}
          >
            {t.label}
            {bodyTab === t.id && <span className="absolute bottom-[-2px] left-0 right-0 h-[2.5px] bg-theme-primary rounded-t" />}
          </button>
        ))}
      </div>

      <div {...panelProps('overview')}>
        {variant === '40S' ? <Overview40S condition={condition} grade={grade} /> :
         variant === '40H' ? <Overview40H condition={condition} grade={grade} /> :
         <Overview20S condition={condition} grade={grade} />}
      </div>

      <div {...panelProps('specs')}>
        <Specifications variant={variant} />
      </div>

      {upgrades && (
        <div {...panelProps('upgrades')}>
          <TabSections heading="Upgrade & Customizations" sections={upgrades.sections} />
        </div>
      )}

      <div {...panelProps('delivery')}>
        <DeliveryInfo variant={variant} />
      </div>

      <div {...panelProps('warranty')}>
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-2">Shipping Container Warranty</h3>

          <div className="flex items-center gap-4 bg-theme-dark rounded-xl p-5 sm:p-6 mb-6 text-white">
            <ShieldCheck className="w-9 h-9 sm:w-10 sm:h-10 text-theme-primary shrink-0" />
            <div>
              <div className="font-extrabold text-lg sm:text-xl">Money-Back Guarantee</div>
              <p className="text-xs sm:text-sm text-white/60">No traditional manufacturer warranty — something simpler instead.</p>
            </div>
          </div>

          <p className="text-sm sm:text-base text-theme-muted leading-relaxed mb-6">
            We know it can be hard to know exactly what to expect until your container arrives. That&apos;s why every purchase is backed by our money-back guarantee, with no fine print and no runaround.
          </p>

          <h4 className="text-lg sm:text-xl font-extrabold tracking-tight mb-4">How It Works</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            {warrantySteps.map((s, index) => (
              <div
                key={`warranty-steps-${s.title}-${index}`}
                className="flex gap-3.5 items-start p-4 sm:p-4.5 rounded-lg border border-theme-border bg-theme-subtle"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-md bg-theme-primary-light flex items-center justify-center shrink-0">
                  <s.Icon className="w-4.5 h-4.5 text-theme-primary" />
                </div>
                <div>
                  <h5 className="font-extrabold text-sm sm:text-base mb-1">{s.title}</h5>
                  <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-theme-primary-light border border-theme-border rounded-lg p-4 sm:p-5">
            <p className="text-sm text-theme-mid leading-relaxed">
              If your container doesn&apos;t meet your expectations, just let us know on the day of delivery — we&apos;ll provide a full refund, minus the shipping fee.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
