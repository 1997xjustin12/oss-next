import Image from 'next/image'
import { FileDown } from 'lucide-react'
import { REEFER_INTRO } from '@/lib/data/reeferContent'

const H2 = 'text-2xl font-extrabold leading-tight text-theme-dark sm:text-3xl dark:text-white'

/** What a reefer is, its dimensions drawing and the buyer's guide, beside the dimensions table. */
export function ReeferIntro() {
  const { heading, body, dimensionsHeading, dimensionsImage, guideHeading, guideCta, guideHref, tableImage } = REEFER_INTRO

  return (
    <section aria-labelledby="reefer-intro" className="bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-14">
        <div className="min-w-0">
          <h2 id="reefer-intro" className={H2}>{heading}</h2>
          <p className="mt-4 text-base leading-relaxed text-theme-mid sm:text-lg dark:text-neutral-300">{body}</p>

          <h2 className={`mt-10 ${H2}`}>{dimensionsHeading}</h2>
          <div className="mt-5 rounded-xl bg-white p-4 ring-1 ring-theme-border dark:ring-neutral-800">
            <Image
              src={dimensionsImage.src}
              alt={dimensionsImage.alt}
              width={dimensionsImage.width}
              height={dimensionsImage.height}
              sizes="(max-width: 640px) 90vw, 420px"
              className="mx-auto h-auto w-full max-w-md"
            />
          </div>

          <div className="mt-10 rounded-xl border-l-4 border-theme-primary bg-theme-subtle p-6 dark:bg-neutral-900">
            <h2 className="text-lg font-extrabold leading-snug text-theme-dark sm:text-xl dark:text-white">{guideHeading}</h2>
            <a
              href={guideHref}
              className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-md bg-[#0F3A59] px-6 text-sm font-bold text-white transition-colors hover:bg-[#0b2c44]
                         focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F3A59] dark:bg-sky-800 dark:hover:bg-sky-700"
            >
              <FileDown aria-hidden className="h-5 w-5" />
              {guideCta}
              <span className="sr-only"> (PDF)</span>
            </a>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md overflow-hidden rounded-xl bg-white ring-1 ring-theme-border lg:sticky lg:top-28 dark:ring-neutral-800">
          <Image
            src={tableImage.src}
            alt={tableImage.alt}
            width={tableImage.width}
            height={tableImage.height}
            sizes="(max-width: 1024px) 90vw, 416px"
            className="h-auto w-full"
          />
        </div>
      </div>
    </section>
  )
}
