import Image from 'next/image'
import { PillLink } from '@/components/shared/PillLink'
import { ROUTES } from '@/config/routes'
import type { AllCityStateSummary } from '@/services/allCity.service'

type Props = {
  /** The city pages' hero photo (the published template's), the LCP image. */
  background: string
  states: AllCityStateSummary[]
  /** "8,500+": the city-page count, rounded down to the hundred. */
  cityCount: string
  /** Where "Find Local Pricing" scrolls to: the ZIP box further down. */
  pricingAnchor: string
}

/**
 * The top band, in the city pages' style: navy over their port photo, with
 * the page's h1, two calls to action and a chip per state that jumps to its
 * list below (plain in-page anchors, no script).
 */
export function AllCityIndexHero({ background, states, cityCount, pricingAnchor }: Props) {
  return (
    <section aria-labelledby="all-city-title" className="relative isolate overflow-hidden bg-[#0f3a59] px-[5%] py-12 sm:py-16 lg:py-20">
      <Image src={background} alt="" fill preload fetchPriority="high" sizes="100vw" className="-z-20 object-cover object-right" />
      {/* A wash over the photo so the text keeps its contrast at every width. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[#0f3a59]/85 lg:bg-linear-to-r lg:from-[#0f3a59] lg:via-[#0f3a59]/90 lg:to-[#0f3a59]/40" />

      <div className="max-w-3xl">
        <p className="text-xs font-bold tracking-[.14em] text-amber-300 uppercase sm:text-sm">Shipping Containers Near You</p>
        <h1 id="all-city-title" className="mt-2 text-3xl leading-tight font-extrabold text-balance text-white sm:text-4xl lg:text-5xl">
          Shipping Containers For Sale &amp; Rent In Your City
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">
          Buy, rent or rent-to-own new and used shipping containers in {cityCount} cities across {states.length} states, delivered from
          the nearest of our depots. Pick your state to find your city, or check local pricing by ZIP code.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <PillLink href={`#${pricingAnchor}`}>Find Local Pricing</PillLink>
          <PillLink href={ROUTES.WHERE_TO_BUY} tone="amber">
            All Depot Locations
          </PillLink>
        </div>
      </div>

      <nav aria-label="Jump to a state" className="mt-8 sm:mt-10">
        <ul className="flex flex-wrap gap-2">
          {states.map((s) => (
            <li key={s.state}>
              {/* A plain anchor: an in-page jump needs no router (and next/link left the scroll where it was). */}
              <a
                href={`#state-${s.state.toLowerCase()}`}
                className="inline-flex min-h-9 items-center rounded-[3px] border border-white/25 bg-white/10 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:border-theme-primary hover:bg-theme-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {s.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  )
}
