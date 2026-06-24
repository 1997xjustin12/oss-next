'use client'

import { useState } from 'react'
import {
  Shield, CheckCircle2, Lock, CloudRain, Layers, Hammer,
  Truck, MapPin, Calendar,
} from 'lucide-react'

const useCases = [
  'Residential Storage', 'Construction Sites', 'Farm & Agriculture', 'Retail Overflow',
  'Workshop Space', 'Event Storage', 'Moving & Relocation', 'Disaster Relief',
  'Military Storage', 'Pop-up Retail',
]

const features = [
  { Icon: Shield, title: 'Cor-Ten Steel Construction', desc: 'Military-grade weathering steel resists corrosion and withstands extreme climates worldwide.' },
  { Icon: CheckCircle2, title: 'ISO Certified & CSC Plated', desc: 'Meets international shipping standards. CSC safety approval plate included on cargo-worthy units.' },
  { Icon: Lock, title: 'Lockbox Ready & Secure', desc: 'Standard double cargo doors with lockrod system. Compatible with standard container padlocks.' },
  { Icon: CloudRain, title: '100% Wind & Watertight', desc: 'All used containers are inspected and certified wind & watertight before delivery to your site.' },
  { Icon: Layers, title: 'Hardwood Timber Floor', desc: 'Durable tropical hardwood floor supports forklifts up to 9,900 lbs. Easy to clean and replace.' },
  { Icon: Hammer, title: 'Modification Friendly', desc: 'Add doors, windows, ventilation, insulation, shelving, or electrical. We offer custom modifications.' },
]

const specsList = [
  { key: 'External Length', val: '20', unit: 'ft (6.058 m)' },
  { key: 'External Width', val: '8', unit: 'ft (2.438 m)' },
  { key: 'External Height', val: '8\'6"', unit: '(2.591 m)' },
  { key: 'Internal Length', val: '19\'4"', unit: '(5.900 m)' },
  { key: 'Internal Width', val: '7\'8"', unit: '(2.352 m)' },
  { key: 'Internal Height', val: '7\'10"', unit: '(2.393 m)' },
  { key: 'Floor Area', val: '160', unit: 'sq ft (14.87 m²)' },
  { key: 'Volume', val: '1,170', unit: 'cu ft (33.2 m³)' },
  { key: 'Tare Weight', val: '4,850', unit: 'lbs (2,200 kg)' },
  { key: 'Max Payload', val: '47,900', unit: 'lbs (21,727 kg)' },
  { key: 'Door Opening Width', val: '7\'8"', unit: '(2.340 m)' },
  { key: 'Door Opening Height', val: '7\'5"', unit: '(2.280 m)' },
  { key: 'Wall Thickness', val: '2mm', unit: 'Cor-Ten Steel' },
  { key: 'Floor Material', val: '28mm', unit: 'Tropical Hardwood' },
  { key: 'ISO Standard', val: '668', unit: 'Type 1C' },
]

const conditionTable = [
  { grade: 'One-Trip', badge: 'bg-emerald-600', desc: 'Used once overseas — essentially new', wear: 'None', wwt: true, cw: true, best: 'Modifications, retail, premium use' },
  { grade: 'Cargo Worthy', badge: 'bg-amber-500', desc: 'IICL certified, fully functional', wear: 'Minor', wwt: true, cw: true, best: 'Shipping, international transport' },
  { grade: 'Wind & Watertight', badge: 'bg-neutral-500', desc: 'Structurally sound, weather-tight', wear: 'Moderate', wwt: true, cw: false, best: 'Storage, construction sites, farms' },
]

const deliveryInfo = [
  { Icon: Truck, title: 'Tilt-Bed Delivery', desc: 'We use specialized tilt-bed trucks to place containers precisely where you need them — no crane required in most cases.' },
  { Icon: MapPin, title: '130+ Depot Locations', desc: 'With depots across all 50 states, we always find the closest container to minimize your delivery cost and timeline.' },
  { Icon: Calendar, title: '1–5 Business Days', desc: 'Most orders deliver within 1–5 business days. Rush delivery available. We coordinate a delivery window with you directly.' },
]

const siteTips = [
  'Ensure a flat, level surface (gravel, asphalt, or concrete ideal)',
  'Allow at least 25ft of clearance for the delivery truck',
  'Mark your preferred placement location before delivery day',
  'Check local zoning regulations for container placement rules',
  'Our drivers will call 30–60 minutes before arrival',
]

const bodyTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'specs', label: 'Specifications' },
  { id: 'conditions', label: 'Container Conditions' },
  { id: 'delivery', label: 'Delivery Info' },
] as const

type BodyTab = typeof bodyTabs[number]['id']

export function BodyTabsSection() {
  const [bodyTab, setBodyTab] = useState<BodyTab>('overview')

  return (
    <section className="px-4 sm:px-[5%] py-10 sm:py-16">
      <div className="flex gap-1 overflow-x-auto border-b-2 border-theme-border mb-8 -mx-1 px-1 scrollbar-none">
        {bodyTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setBodyTab(t.id)}
            className={`relative font-bold text-sm sm:text-base px-3 sm:px-5 py-3.5 whitespace-nowrap transition-colors
              ${bodyTab === t.id ? 'text-theme-primary' : 'text-theme-muted hover:text-theme-dark'}`}
          >
            {t.label}
            {bodyTab === t.id && <span className="absolute bottom-[-2px] left-0 right-0 h-[2.5px] bg-theme-primary rounded-t" />}
          </button>
        ))}
      </div>

      {bodyTab === 'overview' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3.5">
                The Most Versatile Container in Our Lineup
              </h2>
              <p className="text-sm sm:text-base text-theme-muted leading-relaxed mb-3.5">
                Our 20ft standard shipping containers are the workhorse of the storage world. Compact enough to fit in most residential driveways, yet spacious enough for serious storage — 160 square feet of secure, lockable, weather-tight space.
              </p>
              <p className="text-sm sm:text-base text-theme-muted leading-relaxed">
                Built from Cor-Ten steel to ISO specifications, these containers are designed to withstand the harshest conditions — from coastal salt spray to scorching desert heat. Whether you need temporary construction-site storage or a permanent solution, the 20ft delivers.
              </p>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold tracking-tight mb-3.5">Ideal For</h3>
              <div className="flex flex-wrap gap-2">
                {useCases.map((u) => (
                  <span
                    key={u}
                    className="bg-theme-subtle border border-theme-border text-theme-accent px-3 py-1.5 rounded text-xs sm:text-sm font-semibold cursor-pointer hover:bg-theme-accent hover:text-white transition-colors"
                  >
                    {u}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-4">Key Features</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="group flex gap-3.5 items-start p-4 sm:p-4.5 rounded-lg border border-theme-border bg-theme-subtle hover:border-theme-primary hover:-translate-y-0.5 transition-all"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-md bg-theme-primary-light flex items-center justify-center shrink-0 group-hover:bg-theme-primary transition-colors">
                  <f.Icon className="w-4.5 h-4.5 text-theme-primary group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base mb-1">{f.title}</h4>
                  <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {bodyTab === 'specs' && (
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-4">Full Technical Specifications</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-theme-border rounded-lg overflow-hidden">
            {specsList.map((s, i) => (
              <div key={s.key} className={`p-4 sm:p-5 ${i % 2 === 0 ? 'bg-theme-bg' : 'bg-theme-subtle'}`}>
                <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wide text-theme-muted mb-1">{s.key}</div>
                <div className="font-extrabold text-base sm:text-lg">
                  {s.val} <span className="text-xs font-normal text-theme-muted">{s.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {bodyTab === 'conditions' && (
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-2">Understanding Container Conditions</h3>
          <p className="text-sm sm:text-base text-theme-muted mb-6 leading-relaxed">
            All our containers are graded by condition. Choose the grade that matches your use case and budget.
          </p>
          <div className="overflow-x-auto rounded-lg border border-theme-border">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="bg-theme-dark text-white text-left">
                  <th className="px-4 py-3 font-extrabold text-sm">Grade</th>
                  <th className="px-4 py-3 font-extrabold text-sm">Description</th>
                  <th className="px-4 py-3 font-extrabold text-sm">Wear</th>
                  <th className="px-4 py-3 font-extrabold text-sm">W&amp;T</th>
                  <th className="px-4 py-3 font-extrabold text-sm">Cargo Worthy</th>
                  <th className="px-4 py-3 font-extrabold text-sm">Best For</th>
                </tr>
              </thead>
              <tbody>
                {conditionTable.map((c, i) => (
                  <tr key={c.grade} className={`${i % 2 === 1 ? 'bg-theme-subtle' : 'bg-theme-bg'} hover:bg-theme-primary-light transition-colors`}>
                    <td className="px-4 py-3 border-t border-theme-border">
                      <span className={`text-white text-[11px] font-bold uppercase px-2 py-1 rounded ${c.badge}`}>{c.grade}</span>
                    </td>
                    <td className="px-4 py-3 border-t border-theme-border text-theme-mid">{c.desc}</td>
                    <td className="px-4 py-3 border-t border-theme-border text-theme-mid">{c.wear}</td>
                    <td className="px-4 py-3 border-t border-theme-border">
                      <span className={c.wwt ? 'text-emerald-600 font-bold' : 'text-theme-muted'}>{c.wwt ? '✓ Yes' : '✗ No'}</span>
                    </td>
                    <td className="px-4 py-3 border-t border-theme-border">
                      <span className={c.cw ? 'text-emerald-600 font-bold' : 'text-theme-muted'}>{c.cw ? '✓ Yes' : '✗ No'}</span>
                    </td>
                    <td className="px-4 py-3 border-t border-theme-border text-theme-mid">{c.best}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {bodyTab === 'delivery' && (
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-4">Delivery Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 bg-theme-dark rounded-xl p-6 sm:p-8 mb-6 text-white">
            {deliveryInfo.map((d) => (
              <div key={d.title} className="text-center">
                <d.Icon className="w-7 h-7 mx-auto mb-2.5 text-theme-primary" />
                <div className="font-extrabold text-base sm:text-lg mb-1">{d.title}</div>
                <p className="text-xs sm:text-sm text-white/55 leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-theme-primary-light border border-theme-border rounded-lg p-4 sm:p-5">
            <h4 className="text-base sm:text-lg font-extrabold text-theme-primary mb-2">Site Preparation Tips</h4>
            <ul className="text-sm text-theme-mid leading-relaxed space-y-1.5 list-disc pl-5">
              {siteTips.map((tip) => <li key={tip}>{tip}</li>)}
            </ul>
          </div>
        </div>
      )}
    </section>
  )
}
