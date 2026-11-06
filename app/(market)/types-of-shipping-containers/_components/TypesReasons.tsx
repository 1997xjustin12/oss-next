import Image from 'next/image'
import { CircleCheck } from 'lucide-react'
import { CONTAINER_TYPES_REASONS } from '@/lib/data/containerTypesContent'

/** "Top Reasons to Purchase a Container From Us", under the "Why choose" band. */
export function TypesReasons() {
  const { heading, items, image } = CONTAINER_TYPES_REASONS

  return (
    <section aria-labelledby="types-reasons" className="bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="min-w-0">
          <h2 id="types-reasons" className="text-2xl font-extrabold leading-tight text-theme-dark sm:text-3xl dark:text-white">{heading}</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[15px] font-semibold text-theme-dark dark:text-neutral-200">
                <CircleCheck aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-theme-primary dark:text-red-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="mx-auto w-full max-w-lg overflow-hidden rounded-xl bg-white ring-1 ring-theme-border dark:ring-neutral-800">
          <Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(max-width: 1024px) 90vw, 512px" className="h-auto w-full" />
        </div>
      </div>
    </section>
  )
}
