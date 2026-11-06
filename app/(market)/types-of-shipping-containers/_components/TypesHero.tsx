import Image from 'next/image'
import { CONTAINER_TYPES_HERO } from '@/lib/data/containerTypesContent'

/**
 * WordPress's banner photo under a dark wash, with the page's h1. The photo is
 * the LCP element, so it is preloaded.
 */
export function TypesHero() {
  const { heading, background } = CONTAINER_TYPES_HERO

  return (
    <section className="relative isolate overflow-hidden bg-neutral-900 px-[5%] py-16 text-center sm:py-24 lg:py-28">
      <Image src={background.src} alt={background.alt} fill preload fetchPriority="high" sizes="100vw" className="-z-20 object-cover" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-black/55" />
      <h1 className="font-extrabold leading-tight text-white text-shadow-lg">
        <span className="block text-2xl sm:text-4xl lg:text-5xl">{heading.first}</span>
        <span className="mt-1 block text-4xl text-[#F4BF3C] sm:text-6xl lg:text-7xl">{heading.second}</span>
      </h1>
    </section>
  )
}
