import Image from 'next/image'
import { Check, Mail } from 'lucide-react'
import { AccentText } from '@/components/shared/AccentText'
import { GBP_HERO } from '@/lib/data/gbpShared'
import { GbpCallButton } from './GbpCallButton'
import { GBP_ACCENT, GBP_CONTAINER } from './gbpStyles'

type Props = { heading: string; phone: string; telHref: string }

/**
 * The hero: the h1, promises, the call and quote buttons, and the trust
 * badges, over the container-yard photo with its white curve.
 *
 * The photo is the LCP image, so it is a preloaded next/image rather than a
 * CSS background. On phones the copy is centred over a faded photo, as on
 * WordPress; in dark mode a gradient keeps the photo's white half from
 * putting light text on white.
 */
export function GbpHero({ heading, phone, telHref }: Props) {
  return (
    <section className="relative isolate overflow-hidden bg-white dark:bg-neutral-950">
      <Image
        src={GBP_HERO.background}
        alt=""
        fill
        preload
        fetchPriority="high"
        sizes="100vw"
        className="-z-20 object-cover object-[75%_center]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-white/80 md:bg-transparent
                   dark:bg-neutral-950/85 md:dark:bg-transparent md:dark:bg-linear-to-r md:dark:from-neutral-950 md:dark:via-neutral-950/90 md:dark:to-transparent"
      />

      <div className={`${GBP_CONTAINER} py-8 text-center md:py-12 md:text-left lg:py-14`}>
        <div className="md:max-w-[62%]">
          <h1 className="text-[26px] font-bold leading-tight text-black sm:text-4xl lg:text-[42px] dark:text-white">
            <AccentText text={heading} accentClassName={GBP_ACCENT} />
          </h1>
          <p className="mt-3 text-base font-medium text-black sm:text-lg dark:text-neutral-100">{GBP_HERO.tagline}</p>

          <ul className="mx-auto mt-5 w-fit space-y-1 text-left text-sm font-medium text-black md:mx-0 dark:text-neutral-100">
            {GBP_HERO.bullets.map((bullet) => (
              <li key={bullet} className="flex items-center gap-2">
                <Check aria-hidden className="h-4 w-4 shrink-0 text-gbp dark:text-red-400" strokeWidth={3} />
                {bullet}
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap justify-center gap-3 md:justify-start">
            <GbpCallButton phone={phone} telHref={telHref} icon className="min-w-44" />
            <a
              href={GBP_HERO.quoteCta.href}
              className="inline-flex min-w-44 items-center justify-center gap-2 rounded-sm bg-gbp px-6 py-3 font-semibold text-white transition-colors
                         hover:bg-[#a30a22] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gbp dark:focus-visible:outline-white"
            >
              <Mail aria-hidden className="h-4 w-4" />
              {GBP_HERO.quoteCta.label}
            </a>
          </div>

          <ul aria-label="Trust and verification badges" className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-3 md:justify-start">
            {GBP_HERO.badges.map((badge) => (
              <li key={badge.src}>
                <Image
                  src={badge.src}
                  alt={badge.alt}
                  width={badge.width}
                  height={badge.height}
                  sizes="160px"
                  className="h-11 w-auto sm:h-13"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
