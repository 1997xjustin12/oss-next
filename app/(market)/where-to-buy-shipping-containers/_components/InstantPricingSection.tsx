import Image from "next/image";
import { INSTANT_PRICING } from "@/lib/data/whereToBuyContent";
import { DepotLocationList } from "./DepotLocationList";

/** "With more than 60 locations…" and the depot list, under the "Get instant pricing" tagline. */
export function InstantPricingSection() {
  return (
    <section className="bg-white px-4 py-12 sm:px-[5%] sm:py-16 dark:bg-neutral-950">
      <div className="mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-[2fr_3fr]">
        <div className="relative mx-auto aspect-[800/833] w-full max-w-md lg:sticky lg:top-6">
          <Image
            src={INSTANT_PRICING.image.src}
            alt={INSTANT_PRICING.image.alt}
            fill
            sizes="(max-width: 1024px) 90vw, 40vw"
            className="object-contain"
          />
        </div>
        <div>
          <h3 className="text-2xl font-extrabold uppercase leading-tight text-theme-dark sm:text-3xl dark:text-gray-100">
            {INSTANT_PRICING.heading}
          </h3>
          <p className="mt-4 text-base leading-relaxed text-theme-mid dark:text-gray-300">{INSTANT_PRICING.body}</p>
          <h3 className="mt-8 mb-4 text-xl font-extrabold text-theme-dark dark:text-gray-100">
            {INSTANT_PRICING.locationsHeading}
          </h3>
          <DepotLocationList />
        </div>
      </div>
    </section>
  );
}
