import Image from 'next/image'
import { REFURB_HERO } from '@/lib/data/refurbishedContent'

/**
 * WordPress's header photo under a dark wash, with the page's h1. Its second
 * line is part of the same heading on WordPress, so it stays inside the h1. The
 * photo is the LCP element, so it is preloaded.
 */
export function RefurbHero() {
  const { heading, subheading, background } = REFURB_HERO

  return (
    <section className="relative isolate overflow-hidden bg-neutral-900 px-[5%] py-16 text-center sm:py-24">
      <Image src={background.src} alt={background.alt} fill preload fetchPriority="high" sizes="100vw" className="-z-20 object-cover" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-black/55" />
      <h1 className="text-white uppercase text-shadow-lg">
        <span className="block text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">{heading}</span>
        <span className="mt-3 block text-lg font-bold tracking-wide text-[#F4BF3C] sm:text-2xl lg:text-3xl">{subheading}</span>
      </h1>
    </section>
  )
}
