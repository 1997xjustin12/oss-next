import { LocationSearch } from '@/components/shared/LocationSearch'
import { CARGO_AVAILABILITY, CARGO_COST } from '@/lib/data/cargoWorthyContent'

/**
 * Availability, with the ZIP finder where WordPress shows its broken
 * store-locator shortcode, then the cost line. The finder is made for a dark
 * background ("Use my current location" is white), so this band is dark.
 */
export function CargoAvailability() {
  return (
    <>
      <section aria-labelledby="cargo-availability" className="bg-[#0F3A59] px-[5%] py-12 text-white sm:py-16">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <h2 id="cargo-availability" className="text-2xl font-extrabold leading-tight sm:text-3xl">{CARGO_AVAILABILITY.heading}</h2>
          <p className="mt-3 text-base leading-relaxed text-white/90 sm:text-lg">{CARGO_AVAILABILITY.body}</p>
          <div className="mt-7 flex w-full justify-center text-left">
            <LocationSearch />
          </div>
        </div>
      </section>

      <section aria-labelledby="cargo-cost" className="bg-white px-[5%] py-12 text-center sm:py-14 dark:bg-neutral-950">
        <h2 id="cargo-cost" className="text-2xl font-extrabold text-theme-primary sm:text-3xl dark:text-red-400">{CARGO_COST.heading}</h2>
        <p className="mx-auto mt-3 max-w-3xl text-base leading-relaxed text-theme-mid sm:text-lg dark:text-neutral-300">{CARGO_COST.body}</p>
      </section>
    </>
  )
}
