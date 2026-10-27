import Image from 'next/image'
import { Phone } from 'lucide-react'
import { RTO_HERO } from '@/lib/data/rentToOwnContent'
import { CONTACT_NUMBER, telHref } from '@/lib/helpers'
import { CornerRibbon } from './CornerRibbon'

/**
 * The hero: the page's h1 over the container-yard photo, the call button, and
 * the red strip of four promises under it.
 *
 * The photo is the LCP element, so it is a preloaded next/image rather than a
 * CSS background. The dark overlay is what keeps the yellow and white heading
 * readable over a busy photo, in either colour scheme.
 */
export function RtoHero() {
  const { ribbon, heading, subheading, background, badges } = RTO_HERO

  return (
    <>
      <section className="relative isolate overflow-hidden bg-neutral-900 px-[5%] pb-12 pt-28 text-center sm:pb-14 sm:pt-20">
        <Image
          src={background.src}
          alt={background.alt}
          fill
          preload
          // On the preload as well as the <img>: Lighthouse flagged the LCP
          // request as found early but not prioritised.
          fetchPriority="high"
          sizes="100vw"
          className="-z-20 object-cover"
        />
        <div aria-hidden className="absolute inset-0 -z-10 bg-black/45" />

        {/* pt-28 on phones: the ribbon crosses the corner, and at that width the
            heading would otherwise run underneath it. */}
        <CornerRibbon text={ribbon} />

        <h1 className="font-anton text-4xl leading-tight text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)] sm:text-6xl">
          <span className="text-[#FBEE45]">{heading.accent}</span> {heading.rest}
        </h1>
        <p className="mt-2 font-anton text-xl leading-tight text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)] sm:text-3xl">
          <span className="text-[#FBEE45]">{subheading.accent}</span> {subheading.rest}
        </p>

        {/* The call button as on WordPress: a white pill with a red phone disc. */}
        <a
          href={telHref(CONTACT_NUMBER)}
          aria-label={`Call ${CONTACT_NUMBER}`}
          className="mt-7 inline-flex items-center gap-3 rounded-full bg-white py-1.5 pl-1.5 pr-6 shadow-lg ring-2 ring-theme-primary
                     transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          <span aria-hidden className="flex h-11 w-11 items-center justify-center rounded-full bg-theme-primary text-white sm:h-14 sm:w-14">
            <Phone className="h-5 w-5 sm:h-6 sm:w-6" />
          </span>
          <span className="text-2xl font-extrabold text-theme-primary sm:text-3xl">{CONTACT_NUMBER}</span>
        </a>
      </section>

      <section aria-label="Why rent to own with us" className="bg-theme-primary px-[5%] py-3">
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {badges.map((badge) => (
            <li key={badge} className="flex items-center gap-2 text-sm font-bold text-white sm:text-base">
              <svg aria-hidden viewBox="0 0 24 24" width="20" height="20" className="shrink-0">
                <circle cx="12" cy="12" r="10" fill="#FBEE45" />
                <path d="M7.5 12.5l3 3 6-6.5" fill="none" stroke="#BD112A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {badge}
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
