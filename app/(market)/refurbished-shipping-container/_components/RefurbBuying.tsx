import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import { LocationSearch } from '@/components/shared/LocationSearch'
import { REFURB_BUY_BAND, REFURB_LINKS, REFURB_LOCATOR_HEADING, REFURB_STEPS } from '@/lib/data/refurbishedContent'

/**
 * The "buy now" band, the three steps, and the depot finder. WordPress's finder
 * was a store-locator shortcode it printed as raw text; `LocationSearch` (the
 * ZIP box built on useZipLookup) is the working version, on a dark band since
 * its "Use my current location" is white.
 */
export function RefurbBuying() {
  return (
    <>
      <section aria-labelledby="refurb-buy-band" className="bg-[#0F3A59] px-[5%] py-10 text-center">
        <h2 id="refurb-buy-band" className="text-xl font-extrabold leading-snug text-white sm:text-2xl">{REFURB_BUY_BAND.heading}</h2>
        <Link
          href={REFURB_LINKS.buy}
          className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-md bg-theme-primary px-8 text-base font-bold text-white transition-colors
                     hover:bg-theme-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {REFURB_BUY_BAND.cta}
          <ArrowRight aria-hidden className="h-5 w-5" />
        </Link>
      </section>

      <section aria-labelledby="refurb-steps" className="bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
        <h2 id="refurb-steps" className="text-center text-2xl font-extrabold leading-tight text-theme-dark sm:text-3xl dark:text-white">
          {REFURB_STEPS.heading}
        </h2>
        <ol className="mt-8 grid gap-5 md:grid-cols-3">
          {REFURB_STEPS.steps.map((step) => (
            <li
              key={step.label}
              className="flex flex-col items-center gap-3 rounded-xl border border-theme-border bg-white p-6 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
            >
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-theme-subtle ring-1 ring-theme-border dark:bg-white">
                <Image src={step.icon.src} alt={step.icon.alt} width={step.icon.width} height={step.icon.height} className="h-11 w-auto" />
              </span>
              <h3 className="text-lg font-extrabold text-theme-primary dark:text-red-400">{step.label}</h3>
              <p className="text-[15px] leading-relaxed text-theme-mid dark:text-neutral-300">
                {'link' in step && (
                  <Link
                    href={step.link.href}
                    className="font-semibold text-theme-primary underline underline-offset-2 hover:no-underline dark:text-red-400"
                  >
                    {step.link.text}
                  </Link>
                )}
                {step.text}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="refurb-locator" className="bg-[#0F3A59] px-[5%] py-12 sm:py-14">
        <h2 id="refurb-locator" className="text-center text-2xl font-extrabold leading-tight text-white sm:text-3xl">{REFURB_LOCATOR_HEADING}</h2>
        <div className="mt-6 flex justify-center">
          <LocationSearch />
        </div>
      </section>
    </>
  )
}
