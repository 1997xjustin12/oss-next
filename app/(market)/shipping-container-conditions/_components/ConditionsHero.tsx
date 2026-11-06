import Image from 'next/image'
import { CONDITIONS_HERO } from '@/lib/data/containerConditionsContent'

/**
 * WordPress's banner photo under a dark wash, with the page's heading. Its two
 * lines (WordPress's h1 and the h2 under it) read as one heading, so they are
 * one h1 here. The photo is the LCP element, so it is preloaded.
 */
export function ConditionsHero() {
  const { heading, subheading, background } = CONDITIONS_HERO

  return (
    <section className="relative isolate overflow-hidden bg-neutral-900 px-[5%] py-16 text-center sm:py-24">
      <Image src={background.src} alt={background.alt} fill preload fetchPriority="high" sizes="100vw" className="-z-20 object-cover" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-black/55" />
      <h1 className="text-white text-shadow-lg">
        <span className="block text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">{heading}</span>
        <span className="mt-3 block text-lg font-bold tracking-wide text-[#F4BF3C] sm:text-2xl lg:text-3xl">{subheading}</span>
      </h1>
    </section>
  )
}
