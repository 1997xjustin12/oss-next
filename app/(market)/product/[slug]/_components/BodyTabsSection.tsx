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

// The 5 condition/grade combinations actually offered — New is only sold at
// IICL grade, Used spans all four grades. Confirmed by the user; marketing/
// sales should still review this copy.
const conditionTable = [
  { grade: 'Used – As Is', badge: 'bg-neutral-500', desc: 'Sold as-is with no certification — may show dents, rust, or holes. Not guaranteed weather-tight.', wear: 'Heavy', wwt: false, best: 'Budget storage, modification projects, non-weather-critical use' },
  { grade: 'Used – Wind & Watertight', badge: 'bg-amber-500', desc: 'Structurally sound and inspected for leaks — fully weather-sealed with some cosmetic wear.', wear: 'Moderate', wwt: true, best: 'General storage, construction sites, farms' },
  { grade: 'Used – Cargo Worthy', badge: 'bg-blue-500', desc: 'IICL-inspected and certified to meet international shipping standards, with only minor cosmetic wear.', wear: 'Minor', wwt: true, best: 'Shipping, international transport, resale' },
  { grade: 'Used – IICL', badge: 'bg-indigo-600', desc: 'Highest used-grade standard — thoroughly inspected and certified, minimal wear throughout.', wear: 'Minimal', wwt: true, best: 'Premium storage, retail conversions, resale' },
  { grade: 'New – IICL (One-Trip)', badge: 'bg-emerald-600', desc: 'Used once overseas to ship cargo — essentially new condition with factory paint and no structural wear.', wear: 'None', wwt: true, best: 'Modifications, retail builds, premium or long-term use' },
]

// Warranty terms don't vary by container size — same copy for all variants.
const warrantySteps = [
  { Icon: Truck, title: 'Container Arrives', desc: 'Your container is delivered and placed exactly where you need it.' },
  { Icon: Eye, title: 'Inspect It Same Day', desc: "Take a look. If it doesn't meet your expectations, just let us know before the day is over." },
  { Icon: RotateCcw, title: 'Get a Full Refund', desc: "We'll refund your purchase in full, minus the shipping fee — no hassle, no stress." },
]

const bodyTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'specs', label: 'Specifications' },
  { id: 'conditions', label: 'Container Conditions' },
  { id: 'delivery', label: 'Delivery Info' },
  { id: 'warranty', label: 'Warranty' },
] as const

type BodyTab = typeof bodyTabs[number]['id']

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

  return (
    <section className="px-4 sm:px-[5%] py-10 sm:py-16">
      <div className="flex gap-1 overflow-x-auto border-b-2 border-theme-border mb-8 -mx-1 px-1 scrollbar-none">
        {bodyTabs.map((t, index) => (
          <button
            key={`body-tabs-${t.id}-${index}`}
            onClick={() => setBodyTab(t.id)}
            className={`relative font-bold text-sm sm:text-base px-3 sm:px-5 py-1 whitespace-nowrap transition-colors
              ${bodyTab === t.id ? 'text-white bg-theme-primary rounded-tr-[15px]' : 'text-theme-muted hover:text-theme-dark'}`}
          >
            {t.label}
            {bodyTab === t.id && <span className="absolute bottom-[-2px] left-0 right-0 h-[2.5px] bg-theme-primary rounded-t" />}
          </button>
        ))}
      </div>

      {bodyTab === 'overview' && (
        variant === '40S' ? <Overview40S condition={condition} grade={grade} /> :
        variant === '40H' ? <Overview40H condition={condition} grade={grade} /> :
        <Overview20S condition={condition} grade={grade} />
      )}

      {bodyTab === 'specs' && <Specifications variant={variant} />}

      {bodyTab === 'conditions' && (
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-2">Understanding Container Conditions</h3>
          <p className="text-sm sm:text-base text-theme-muted mb-6 leading-relaxed">
            We offer five condition and grade combinations. Choose the one that matches your use case and budget.
          </p>
          <div className="overflow-x-auto rounded-lg border border-theme-border">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="bg-theme-dark text-white text-left">
                  <th className="px-4 py-3 font-extrabold text-sm">Condition &amp; Grade</th>
                  <th className="px-4 py-3 font-extrabold text-sm">Description</th>
                  <th className="px-4 py-3 font-extrabold text-sm">Wear</th>
                  <th className="px-4 py-3 font-extrabold text-sm">W&amp;T</th>
                  <th className="px-4 py-3 font-extrabold text-sm">Best For</th>
                </tr>
              </thead>
              <tbody>
                {conditionTable.map((c, i) => (
                  <tr key={`condition-table-${c.grade}-${i}`} className={`${i % 2 === 1 ? 'bg-theme-subtle' : 'bg-theme-bg'} hover:bg-theme-primary-light transition-colors`}>
                    <td className="px-4 py-3 border-t border-theme-border">
                      <span className={`text-white text-[11px] font-bold uppercase px-2 py-1 rounded ${c.badge}`}>{c.grade}</span>
                    </td>
                    <td className="px-4 py-3 border-t border-theme-border text-theme-mid">{c.desc}</td>
                    <td className="px-4 py-3 border-t border-theme-border text-theme-mid">{c.wear}</td>
                    <td className="px-4 py-3 border-t border-theme-border">
                      <span className={c.wwt ? 'text-emerald-600 font-bold' : 'text-theme-muted'}>{c.wwt ? '✓ Yes' : '✗ No'}</span>
                    </td>
                    <td className="px-4 py-3 border-t border-theme-border text-theme-mid">{c.best}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {bodyTab === 'delivery' && <DeliveryInfo variant={variant} />}

      {bodyTab === 'warranty' && (
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
      )}
    </section>
  )
}
