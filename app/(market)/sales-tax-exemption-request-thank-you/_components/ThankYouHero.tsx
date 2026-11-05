import Image from 'next/image'
import { Check } from 'lucide-react'
import { TAX_EXEMPTION_HERO, TAX_EXEMPTION_THANK_YOU } from '@/lib/data/taxExemptionContent'

/** The request form's hero, so the two pages read as one flow. The photo is the LCP element. */
export function ThankYouHero() {
  const { heading } = TAX_EXEMPTION_THANK_YOU

  return (
    <section className="relative isolate overflow-hidden bg-neutral-900 px-[5%] py-14 text-center sm:py-20">
      <Image src={TAX_EXEMPTION_HERO.image} alt="" fill preload fetchPriority="high" sizes="100vw" className="-z-20 object-cover" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-black/60" />

      <span aria-hidden className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-theme-primary text-white shadow-lg sm:h-20 sm:w-20">
        <Check className="h-9 w-9 sm:h-11 sm:w-11" strokeWidth={3} />
      </span>
      <h1 className="mx-auto mt-5 max-w-4xl text-3xl font-extrabold leading-tight text-white text-shadow-lg sm:text-5xl lg:text-6xl">
        <span className="text-[#F4BF3C]">{heading.accent}</span> {heading.rest}
      </h1>
    </section>
  )
}
