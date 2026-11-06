import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import { REEFER_HERO, REEFER_LINKS } from '@/lib/data/reeferContent'

/**
 * The container-yard photo under a dark wash, the reefer cut-out and the page's
 * h1, as WordPress lays them out. The yard photo is the LCP element, so it is
 * preloaded; the cut-out loads eagerly beside it.
 */
export function ReeferHero() {
  const { heading, subheading, cta, background, image } = REEFER_HERO

  return (
    <section className="relative isolate overflow-hidden bg-neutral-900 px-[5%] py-12 sm:py-16 lg:py-20">
      <Image src={background.src} alt={background.alt} fill preload fetchPriority="high" sizes="100vw" className="-z-20 object-cover" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-black/55" />

      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="order-2 lg:order-1">
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            loading="eager"
            sizes="(max-width: 1024px) 90vw, 45vw"
            className="mx-auto h-auto w-full max-w-xl drop-shadow-2xl"
          />
        </div>
        <div className="order-1 text-center lg:order-2 lg:text-left">
          <h1 className="text-4xl font-extrabold leading-tight text-white text-shadow-lg sm:text-5xl lg:text-6xl">{heading}</h1>
          <p className="mt-3 text-lg font-semibold text-[#F4BF3C] text-shadow-lg sm:text-2xl">{subheading}</p>
          <Link
            href={REEFER_LINKS.pricing}
            className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-theme-primary px-8 text-base font-bold text-white shadow-lg transition-colors
                       hover:bg-theme-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {cta}
            <ArrowRight aria-hidden className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
