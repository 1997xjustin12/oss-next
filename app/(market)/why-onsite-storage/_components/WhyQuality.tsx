import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import { WHY_MODIFICATION, WHY_QUALITY, WHY_QUOTE_CTA, WHY_SERVICE } from '@/lib/data/whyOnsiteContent'

/** The free-quote button, quality with its four photos, customer service and modifications. */
export function WhyQuality() {
  return (
    <>
      <section aria-label="Free quote" className="bg-white px-[5%] pb-12 text-center sm:pb-16 dark:bg-neutral-950">
        <Link
          href={WHY_QUOTE_CTA.href}
          className="inline-flex min-h-12 items-center gap-2 rounded-md bg-theme-primary px-8 text-base font-bold text-white shadow-sm transition-colors hover:bg-theme-primary-dark
                     focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary"
        >
          {WHY_QUOTE_CTA.text}
          <ArrowRight aria-hidden className="h-5 w-5" />
        </Link>
      </section>

      <section aria-labelledby="why-quality" className="bg-[#0F3A59] px-[5%] py-12 text-white sm:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 id="why-quality" className="text-2xl font-extrabold leading-tight sm:text-3xl">{WHY_QUALITY.heading}</h2>
          <p className="mt-4 text-base leading-relaxed text-white/90 sm:text-lg">{WHY_QUALITY.body}</p>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {WHY_QUALITY.images.map((img) => (
            <li key={img.src} className="relative aspect-4/5 overflow-hidden rounded-lg bg-white/10">
              <Image src={img.src} alt={img.alt} fill sizes="(max-width: 1024px) 45vw, 22vw" className="object-cover" />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="why-service" className="bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-xl border border-theme-border border-t-4 border-t-theme-primary bg-white p-6 shadow-sm sm:p-8 dark:border-neutral-800 dark:border-t-theme-primary dark:bg-neutral-900">
            <h2 id="why-service" className="text-xl font-extrabold leading-tight text-theme-dark sm:text-2xl dark:text-white">{WHY_SERVICE.heading}</h2>
            <p className="mt-3 text-base leading-relaxed text-theme-mid dark:text-neutral-300">{WHY_SERVICE.body}</p>
          </article>
          <article className="rounded-xl border border-theme-border border-t-4 border-t-theme-primary bg-white p-6 shadow-sm sm:p-8 dark:border-neutral-800 dark:border-t-theme-primary dark:bg-neutral-900">
            <h2 className="text-xl font-extrabold leading-tight text-theme-dark sm:text-2xl dark:text-white">{WHY_MODIFICATION.heading}</h2>
            <p className="mt-3 text-base leading-relaxed text-theme-mid dark:text-neutral-300">{WHY_MODIFICATION.body}</p>
          </article>
        </div>
      </section>
    </>
  )
}
