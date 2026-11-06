import Image from 'next/image'
import { WHY_HERO } from '@/lib/data/whyOnsiteContent'

/**
 * WordPress's banner photo under a dark wash, with the page's h1. The photo is
 * the LCP element, so it is preloaded.
 */
export function WhyHero() {
  const { heading, subheading, tagline, background } = WHY_HERO

  return (
    <section className="relative isolate overflow-hidden bg-neutral-900 px-[5%] py-16 text-center sm:py-24">
      <Image src={background.src} alt={background.alt} fill preload fetchPriority="high" sizes="100vw" className="-z-20 object-cover" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-black/60" />

      <h1 className="mx-auto max-w-4xl text-4xl font-extrabold uppercase leading-tight text-white text-shadow-lg sm:text-5xl lg:text-6xl">
        {heading}
      </h1>
      <p className="mt-4 text-xl font-extrabold uppercase tracking-wide text-[#F4BF3C] text-shadow-lg sm:text-3xl">{subheading}</p>
      <p className="mx-auto mt-3 max-w-2xl text-lg font-medium text-white text-shadow-lg sm:text-xl">{tagline}</p>
    </section>
  )
}
