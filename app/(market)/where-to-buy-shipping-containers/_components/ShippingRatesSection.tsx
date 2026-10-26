import Image from "next/image";
import { SHIPPING_RATES } from "@/lib/data/whereToBuyContent";

/** "Save money with our lowest shipping rates": intro, picture, then Buy / Rental / Rent-To-Own. */
export function ShippingRatesSection() {
  return (
    <section aria-labelledby="shipping-rates-heading" className="bg-theme-subtle px-4 py-12 sm:px-[5%] sm:py-16 dark:bg-neutral-900">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2
              id="shipping-rates-heading"
              className="text-2xl font-extrabold uppercase leading-tight text-theme-dark sm:text-3xl dark:text-gray-100"
            >
              {SHIPPING_RATES.heading}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-theme-mid dark:text-gray-300">{SHIPPING_RATES.body}</p>
          </div>
          <div className="relative mx-auto aspect-[800/566] w-full max-w-xl">
            <Image
              src={SHIPPING_RATES.image.src}
              alt={SHIPPING_RATES.image.alt}
              fill
              sizes="(max-width: 1024px) 90vw, 45vw"
              className="object-contain"
            />
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {SHIPPING_RATES.options.map((option) => (
            <div
              key={option.title}
              className="rounded-lg border-t-4 border-theme-primary bg-white p-6 shadow-sm dark:bg-neutral-950"
            >
              <h3 className="text-xl font-extrabold uppercase tracking-wide text-theme-dark dark:text-gray-100">
                {option.title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-theme-mid dark:text-gray-300">{option.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
