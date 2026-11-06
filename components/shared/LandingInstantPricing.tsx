import { LocationSearch } from '@/components/shared/LocationSearch'
import { INSTANT_PRICING_BAND, INSTANT_PRICING_BOX } from '@/lib/data/containerLandingContent'

type Props = {
  /** Red on the for-sale page, blue on the rental page, as WordPress has them. */
  bg: 'red' | 'blue'
  /** Which listing the ZIP opens. */
  ptype: 'buy' | 'rental'
}

/** A lookup, so Tailwind sees both classes. Blue is SectionTagline2's #0F3A59. */
const BACKGROUNDS = { red: 'bg-theme-primary', blue: 'bg-[#0F3A59]' } as const

/**
 * "GET INSTANT PRICING NOW!" and WordPress's ZIP box beside it, which opens the
 * listing for the visitor's depot (LocationSearch, on useZipLookup).
 */
export function LandingInstantPricing({ bg, ptype }: Props) {
  return (
    <section aria-labelledby="instant-pricing" className={`${BACKGROUNDS[bg]} px-[5%] py-8 sm:py-10`}>
      <div className="grid items-center gap-6 lg:grid-cols-2">
        <h2 id="instant-pricing" className="text-center text-3xl font-extrabold uppercase text-yellow-300 sm:text-4xl lg:text-left">
          {INSTANT_PRICING_BAND}
        </h2>
        <div className="flex justify-center lg:justify-end">
          <LocationSearch ptype={ptype} submitLabel={INSTANT_PRICING_BOX.submitLabel} placeholder={INSTANT_PRICING_BOX.placeholder} />
        </div>
      </div>
    </section>
  )
}
