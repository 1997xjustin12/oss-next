import Image from 'next/image'
import { ArrowDown, Phone } from 'lucide-react'
import { TAX_EXEMPTION_FORM, TAX_EXEMPTION_HERO } from '@/lib/data/taxExemptionContent'
import { CONTACT_NUMBER, telHref } from '@/lib/helpers'

/**
 * The homepage's hero treatment: its yard photo under a dark wash, a red label,
 * a white heading with a gold accent. The photo is the LCP element, so it is
 * preloaded. The wash keeps the text readable in either colour scheme.
 */
export function TaxExemptionHero() {
  const { eyebrow, heading, intro, cta, image } = TAX_EXEMPTION_HERO

  return (
    <section className="relative isolate overflow-hidden bg-neutral-900 px-[5%] py-14 sm:py-20">
      <Image src={image} alt="" fill preload fetchPriority="high" sizes="100vw" className="-z-20 object-cover" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-black/60" />

      <p className="inline-block rounded-sm bg-theme-primary px-3 py-1 text-sm font-semibold text-white shadow-lg sm:text-base">
        {eyebrow}
      </p>
      <h1 className="mt-5 text-4xl font-extrabold leading-tight text-white text-shadow-lg sm:text-5xl lg:text-6xl">
        <span className="text-[#F4BF3C]">{heading.accent}</span> {heading.rest}
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-relaxed text-white text-shadow-lg sm:text-xl">{intro}</p>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <a
          href={`#${TAX_EXEMPTION_FORM.id}`}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-theme-primary px-7 text-base font-bold text-white shadow-lg transition-colors
                     hover:bg-theme-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {cta}
          <ArrowDown aria-hidden className="h-5 w-5" />
        </a>
        <a
          href={telHref(CONTACT_NUMBER)}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/70 px-7 text-base font-bold text-white transition-colors
                     hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <Phone aria-hidden className="h-5 w-5" />
          <span>
            <span className="sr-only">Call us at </span>
            {CONTACT_NUMBER}
          </span>
        </a>
      </div>
    </section>
  )
}
