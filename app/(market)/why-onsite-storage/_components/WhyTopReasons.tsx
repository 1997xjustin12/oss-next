import Image from 'next/image'
import { CircleCheck } from 'lucide-react'
import { WHY_TOP_REASONS } from '@/lib/data/whyOnsiteContent'
import { WhyRichText } from './WhyRichText'

/** The eleven reasons, checked, beside the container photo. */
export function WhyTopReasons() {
  const { heading, items, image } = WHY_TOP_REASONS

  return (
    <section aria-labelledby="why-top-reasons" className="bg-theme-subtle px-[5%] py-12 sm:py-16 dark:bg-neutral-900">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="min-w-0">
          <h2 id="why-top-reasons" className="text-2xl font-extrabold uppercase leading-tight text-theme-dark sm:text-3xl dark:text-white">{heading}</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {items.map((parts, i) => (
              <li key={i} className="flex gap-3 text-base font-semibold leading-snug text-theme-dark dark:text-neutral-100">
                <CircleCheck aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-theme-primary dark:text-red-400" />
                <span>
                  <WhyRichText parts={parts} />
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mx-auto w-full max-w-md overflow-hidden rounded-xl bg-white">
          <Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(max-width: 1024px) 90vw, 448px" className="h-auto w-full" />
        </div>
      </div>
    </section>
  )
}
