import Image from 'next/image'
import { SELECTION_INTRO, SELECTION_OPTIONS } from '@/lib/data/containerConditionsContent'

/** The three ways to pick a container from the depot, under the "selection" band. */
export function ConditionsSelection() {
  return (
    <section aria-labelledby="conditions-selection" className="bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
      <p id="conditions-selection" className="text-center text-lg font-bold text-theme-dark sm:text-xl dark:text-white">
        {SELECTION_INTRO}
      </p>
      <ul className="mt-8 grid gap-6 md:grid-cols-3">
        {SELECTION_OPTIONS.map((option) => (
          <li key={option.title} className="flex flex-col overflow-hidden rounded-xl border border-theme-border bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <Image
              src={option.image.src}
              alt={option.image.alt}
              width={option.image.width}
              height={option.image.height}
              sizes="(max-width: 768px) 90vw, 30vw"
              className="h-auto w-full"
            />
            <div className="p-5 sm:p-6">
              <h3 className="text-xl font-extrabold tracking-wide text-theme-dark dark:text-white">{option.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-theme-mid dark:text-neutral-300">{option.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
