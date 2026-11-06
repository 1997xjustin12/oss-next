import Image from 'next/image'
import { Phone } from 'lucide-react'
import { REFURB_COST, REFURB_LEVELS } from '@/lib/data/refurbishedContent'
import { CONTACT_NUMBER, telHref } from '@/lib/helpers'

/** The three refurbishment levels, then availability and cost with the call-us photo. */
export function RefurbDetails() {
  return (
    <>
      <section aria-labelledby="refurb-levels" className="bg-[#0F3A59] px-[5%] py-12 text-white sm:py-16">
        <h2 id="refurb-levels" className="text-xl font-extrabold leading-snug sm:text-2xl">{REFURB_LEVELS.intro}</h2>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {REFURB_LEVELS.levels.map((level) => (
            <article key={level.title} className="rounded-xl border border-white/15 bg-white/5 p-6">
              <h3 className="text-lg font-extrabold text-[#F4BF3C]">{level.title}</h3>
              {'lead' in level && <p className="mt-2 text-[15px] leading-relaxed text-white/90">{level.lead}</p>}
              <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-white/90 marker:text-[#F4BF3C]">
                {level.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="refurb-availability" className="bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-14">
          <div className="min-w-0 text-base leading-relaxed text-theme-mid sm:text-lg dark:text-neutral-300">
            <h2 id="refurb-availability" className="text-2xl font-extrabold leading-tight text-theme-dark sm:text-3xl dark:text-white">
              {REFURB_COST.availabilityHeading}
            </h2>
            {REFURB_COST.availability.map((text) => (
              <p key={text} className="mt-3">{text}</p>
            ))}

            <h2 className="mt-10 text-2xl font-extrabold leading-tight text-theme-dark sm:text-3xl dark:text-white">{REFURB_COST.costHeading}</h2>
            <p className="mt-3">{REFURB_COST.costIntro}</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 marker:text-theme-primary dark:marker:text-red-400">
              {REFURB_COST.costItems.map((item) => (
                <li key={item.text}>
                  {'label' in item && <strong className="font-bold text-theme-dark dark:text-white">{item.label}</strong>}
                  {item.text}
                </li>
              ))}
            </ul>
            {REFURB_COST.after.map((text) => (
              <p key={text} className="mt-4">{text}</p>
            ))}
            <a
              href={telHref(CONTACT_NUMBER)}
              className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-theme-primary px-8 text-base font-bold text-white shadow-lg transition-colors
                         hover:bg-theme-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary"
            >
              <Phone aria-hidden className="h-5 w-5" />
              {REFURB_COST.cta}
            </a>
          </div>
          <div className="mx-auto w-full max-w-sm overflow-hidden rounded-xl ring-1 ring-theme-border dark:ring-neutral-800">
            <Image
              src={REFURB_COST.image.src}
              alt={REFURB_COST.image.alt}
              width={REFURB_COST.image.width}
              height={REFURB_COST.image.height}
              sizes="(max-width: 1024px) 90vw, 384px"
              className="h-auto w-full"
            />
          </div>
        </div>
      </section>
    </>
  )
}
