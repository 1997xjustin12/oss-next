import Image from 'next/image'
import { BellRing, Droplets, FileDown, Gauge, Phone, ShieldCheck, Snowflake, Thermometer } from 'lucide-react'
import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import {
  REEFER_FEATURES,
  REEFER_GALLERY,
  REEFER_LINKS,
  REEFER_POWER,
  REEFER_QUOTE_CTA,
  type ReeferFeatureIcon,
} from '@/lib/data/reeferContent'
import { CONTACT_NUMBER, telHref } from '@/lib/helpers'
import type { LucideIcon } from 'lucide-react'

const ICONS: Record<ReeferFeatureIcon, LucideIcon> = {
  temperature: Thermometer,
  cooling: Snowflake,
  range: Gauge,
  humidity: Droplets,
  monitoring: BellRing,
  security: ShieldCheck,
}

/**
 * Everything under the "Reefers power requirements" band, in WordPress's order:
 * how a reefer works, the call-to-quote panel, the six features and the photos.
 */
export function ReeferPower() {
  const { heading, body, cta, ctaHref, image } = REEFER_POWER

  return (
    <section aria-labelledby="reefer-power" className="bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="min-w-0">
          <h2 id="reefer-power" className="text-2xl font-extrabold leading-tight text-theme-dark sm:text-3xl dark:text-white">{heading}</h2>
          <p className="mt-4 text-base leading-relaxed text-theme-mid sm:text-lg dark:text-neutral-300">{body}</p>
          <a
            href={ctaHref}
            className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-md bg-[#0F3A59] px-6 text-sm font-bold text-white transition-colors hover:bg-[#0b2c44]
                       focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F3A59] dark:bg-sky-800 dark:hover:bg-sky-700"
          >
            <FileDown aria-hidden className="h-5 w-5" />
            {cta}
            <span className="sr-only"> (PDF)</span>
          </a>
        </div>
        <div className="mx-auto w-full max-w-lg overflow-hidden rounded-xl bg-white ring-1 ring-theme-border dark:ring-neutral-800">
          <Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(max-width: 1024px) 90vw, 512px" className="h-auto w-full" />
        </div>
      </div>

      <div className="mt-12 flex flex-col items-center gap-5 rounded-xl bg-theme-dark px-6 py-8 text-center sm:px-10 dark:bg-neutral-900">
        <h2 className="max-w-3xl text-xl font-extrabold leading-snug text-white sm:text-2xl">{REEFER_QUOTE_CTA.heading}</h2>
        <a
          href={telHref(CONTACT_NUMBER)}
          className="inline-flex min-h-12 items-center gap-2 rounded-full bg-theme-primary px-8 text-base font-bold text-white shadow-lg transition-colors
                     hover:bg-theme-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <Phone aria-hidden className="h-5 w-5" />
          {REEFER_QUOTE_CTA.cta}
        </a>
      </div>

      <h2 className="mt-14 text-2xl font-extrabold leading-tight text-theme-dark sm:text-3xl dark:text-white">{REEFER_FEATURES.heading}</h2>
      <ul className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {REEFER_FEATURES.items.map((item) => {
          const Icon = ICONS[item.icon]
          return (
            <li key={item.title} className="flex gap-4 rounded-xl border border-theme-border bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-theme-primary text-white">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h3 className="text-base font-extrabold text-theme-dark dark:text-white">{item.title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-theme-mid dark:text-neutral-300">{item.body}</p>
              </div>
            </li>
          )
        })}
      </ul>

      <ul className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {REEFER_GALLERY.images.map((photo) => (
          <li key={photo.src} className="relative aspect-4/3 overflow-hidden rounded-lg bg-theme-subtle dark:bg-neutral-800">
            <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 1024px) 45vw, 22vw" className="object-cover" />
          </li>
        ))}
      </ul>
      <div className="mt-6 text-center">
        <Link
          href={REEFER_LINKS.morePhotos}
          className="inline-flex min-h-12 items-center rounded-md bg-theme-primary px-8 text-base font-bold text-white transition-colors hover:bg-theme-primary-dark
                     focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary"
        >
          {REEFER_GALLERY.cta}
        </Link>
      </div>
    </section>
  )
}
