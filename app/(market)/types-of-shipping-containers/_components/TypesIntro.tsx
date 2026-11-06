import Image from 'next/image'
import { CONTAINER_TYPES_INTRO } from '@/lib/data/containerTypesContent'

/** Who invented the shipping container, and why its types matter. */
export function TypesIntro() {
  const { before, isoLabel, isoHref, after, image, closing } = CONTAINER_TYPES_INTRO

  return (
    <section aria-label="About shipping containers" className="bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <p className="text-base leading-relaxed text-theme-mid sm:text-lg dark:text-neutral-300">
          {before}{' '}
          <a
            href={isoHref}
            rel="noopener noreferrer"
            className="font-semibold text-theme-primary underline underline-offset-2 hover:no-underline dark:text-red-400"
          >
            {isoLabel}
          </a>
          {after}
        </p>
        <div className="mx-auto w-full max-w-xl overflow-hidden rounded-xl bg-white ring-1 ring-theme-border dark:ring-neutral-800">
          <Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(max-width: 1024px) 90vw, 576px" className="h-auto w-full" />
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-4xl rounded-xl border-l-4 border-theme-primary bg-theme-subtle p-6 text-base leading-relaxed text-theme-dark sm:text-lg dark:bg-neutral-900 dark:text-neutral-200">
        {closing}
      </p>
    </section>
  )
}
