import Image from 'next/image'
import { ArrowRight, Check } from 'lucide-react'
import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import { REFURB_EXAMPLES, REFURB_LINKS, REFURB_USES, REFURB_WHAT, REFURB_WHY } from '@/lib/data/refurbishedContent'

const H2 = 'text-2xl font-extrabold leading-tight text-theme-dark sm:text-3xl dark:text-white'
const BODY = 'text-base leading-relaxed text-theme-mid sm:text-lg dark:text-neutral-300'
const BUTTON =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-7 text-sm font-bold transition-colors ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary'

/** What a refurbished container is, the colour examples, its uses and why to choose one: WordPress's first four sections. */
export function RefurbAbout() {
  return (
    <>
      <section aria-labelledby="refurb-what" className="bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-12">
          <div className="min-w-0">
            <h2 id="refurb-what" className={H2}>{REFURB_WHAT.heading}</h2>
            <dl className="mt-6 space-y-4">
              {REFURB_WHAT.items.map((item) => (
                <div key={item.label} className="rounded-xl border-l-4 border-theme-primary bg-theme-subtle p-5 dark:bg-neutral-900">
                  <dt className="text-base font-extrabold text-theme-dark dark:text-white">{item.label}</dt>
                  <dd className="mt-1 text-[15px] leading-relaxed text-theme-mid dark:text-neutral-300">– {item.text}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="mx-auto w-full max-w-md overflow-hidden rounded-xl ring-1 ring-theme-border dark:ring-neutral-800">
            <Image
              src={REFURB_WHAT.image.src}
              alt={REFURB_WHAT.image.alt}
              width={REFURB_WHAT.image.width}
              height={REFURB_WHAT.image.height}
              sizes="(max-width: 1024px) 90vw, 448px"
              className="h-auto w-full"
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="refurb-examples" className="bg-theme-subtle px-[5%] py-12 sm:py-16 dark:bg-neutral-900">
        <h2 id="refurb-examples" className={`text-center ${H2}`}>{REFURB_EXAMPLES.heading}</h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {REFURB_EXAMPLES.images.map((photo) => (
            <li key={photo.src} className="relative aspect-4/3 overflow-hidden rounded-xl bg-theme-border dark:bg-neutral-800">
              <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 640px) 90vw, 30vw" className="object-cover" />
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href={REFURB_LINKS.morePhotos} className={`${BUTTON} bg-[#0F3A59] text-white hover:bg-[#0b2c44] dark:bg-sky-800 dark:hover:bg-sky-700`}>
            {REFURB_EXAMPLES.morePhotos}
          </Link>
          <Link href={REFURB_LINKS.quote} className={`${BUTTON} bg-theme-primary text-white hover:bg-theme-primary-dark`}>
            {REFURB_EXAMPLES.quote}
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section aria-labelledby="refurb-uses" className="bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="min-w-0">
            <h2 id="refurb-uses" className={H2}>{REFURB_USES.heading}</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {REFURB_USES.items.map((use) => (
                <li key={use} className="flex items-center gap-3 text-base font-semibold text-theme-dark dark:text-neutral-100">
                  <span aria-hidden className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-theme-primary text-white">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                  {use}
                </li>
              ))}
            </ul>
          </div>
          <div className="mx-auto w-full max-w-xl overflow-hidden rounded-xl ring-1 ring-theme-border dark:ring-neutral-800">
            <Image
              src={REFURB_USES.image.src}
              alt={REFURB_USES.image.alt}
              width={REFURB_USES.image.width}
              height={REFURB_USES.image.height}
              sizes="(max-width: 1024px) 90vw, 576px"
              className="h-auto w-full"
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="refurb-why" className="bg-theme-subtle px-[5%] py-12 sm:py-16 dark:bg-neutral-900">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-12">
          <div className="min-w-0">
            <h2 id="refurb-why" className={H2}>{REFURB_WHY.heading}</h2>
            <ul className="mt-6 space-y-5">
              {REFURB_WHY.items.map((item) => (
                <li key={item.title} className="rounded-xl border border-theme-border bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                  <h3 className="text-lg font-extrabold text-theme-dark dark:text-white">{item.title}</h3>
                  <p className={`mt-2 ${BODY}`}>{item.body}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="mx-auto w-full max-w-sm overflow-hidden rounded-xl ring-1 ring-theme-border lg:sticky lg:top-28 dark:ring-neutral-800">
            <Image
              src={REFURB_WHY.image.src}
              alt={REFURB_WHY.image.alt}
              width={REFURB_WHY.image.width}
              height={REFURB_WHY.image.height}
              sizes="(max-width: 1024px) 90vw, 384px"
              className="h-auto w-full"
            />
          </div>
        </div>
      </section>
    </>
  )
}
