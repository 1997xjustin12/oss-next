'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { PDP_SHIPPING_CONTAINERS } from '@/lib/data/pdpShippingContainers'
import type { ContainerVariantKey } from '@/lib/containerVariant'

type Props = { variant: ContainerVariantKey }

export function FaqAccordion({ variant }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const faqs = PDP_SHIPPING_CONTAINERS[variant].faq

  return (
    <div className="border border-theme-border rounded-lg overflow-hidden divide-y divide-theme-border">
      {faqs.map((f, i) => {
        const open = openFaq === i
        return (
          <div key={`faq-${f.question}-${i}`}>
            <button
              onClick={() => setOpenFaq(open ? null : i)}
              className={`w-full text-left flex items-center justify-between gap-4 px-4 sm:px-5 py-4 transition-colors
                ${open ? 'bg-theme-primary-light text-theme-primary' : 'bg-theme-bg hover:bg-theme-primary-light hover:text-theme-primary'}`}
            >
              <span className="font-bold text-sm sm:text-[15px]">{f.question}</span>
              <Plus className={`w-4.5 h-4.5 shrink-0 transition-transform duration-300 ${open ? 'rotate-45 text-theme-primary' : 'text-theme-muted'}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-60' : 'max-h-0'}`}>
              <p className="text-sm text-theme-muted leading-relaxed px-4 sm:px-5 pb-4">{f.answer}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
