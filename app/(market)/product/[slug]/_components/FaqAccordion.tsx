'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

const faqs = [
  { q: 'How much does it cost to deliver a 20ft container?', a: 'Delivery costs vary based on your ZIP code and distance from our nearest depot. Most deliveries range from $150–$500. Enter your ZIP code above to get an estimated delivery fee. We always quote delivery costs upfront with no hidden charges.' },
  { q: 'Do I need a permit to place a shipping container on my property?', a: "Permit requirements vary by city, county, and state. Temporary use (under 30–90 days) typically doesn't require a permit. Permanent placement often does. We recommend checking with your local zoning office. Our team can guide you through this process." },
  { q: "What's the difference between Wind & Watertight and Cargo Worthy?", a: 'Wind & Watertight (WWT) containers are structurally sound and fully weather-sealed but may have cosmetic wear. Cargo Worthy (CW) containers meet IICL standards for international shipping, with less wear and a safety certification plate. For storage purposes, WWT is often the best value.' },
  { q: 'How long does delivery take?', a: "Most containers deliver within 1–5 business days of your order. We'll contact you to schedule a delivery window that works for you. Rush delivery is available in many areas. With 130+ depot locations, we're likely already near you." },
  { q: 'Can I modify my shipping container?', a: 'Absolutely. We offer custom modifications including doors, windows, ventilation, insulation, electrical, roll-up doors, shelving, and more. We recommend starting with a One-Trip or Cargo Worthy unit for modifications. Contact our team to discuss your project.' },
]

export function FaqAccordion() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="border border-theme-border rounded-lg overflow-hidden divide-y divide-theme-border">
      {faqs.map((f, i) => {
        const open = openFaq === i
        return (
          <div key={f.q}>
            <button
              onClick={() => setOpenFaq(open ? null : i)}
              className={`w-full text-left flex items-center justify-between gap-4 px-4 sm:px-5 py-4 transition-colors
                ${open ? 'bg-theme-primary-light text-theme-primary' : 'bg-theme-bg hover:bg-theme-primary-light hover:text-theme-primary'}`}
            >
              <span className="font-bold text-sm sm:text-[15px]">{f.q}</span>
              <Plus className={`w-4.5 h-4.5 shrink-0 transition-transform duration-300 ${open ? 'rotate-45 text-theme-primary' : 'text-theme-muted'}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-60' : 'max-h-0'}`}>
              <p className="text-sm text-theme-muted leading-relaxed px-4 sm:px-5 pb-4">{f.a}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
