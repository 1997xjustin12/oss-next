import Image from 'next/image'
import { Search, SquarePen, Truck, UserRound } from 'lucide-react'
import { FOR_SALE_STEPS } from '@/lib/data/forSaleContent'

const ICONS = { search: Search, quote: SquarePen, consult: UserRound, delivery: Truck } as const

/** "How to Buy Shipping Containers in 4 Easy Steps", with the phone mock-up beside them. */
export function ForSaleSteps() {
  const { heading, steps, image } = FOR_SALE_STEPS

  return (
    <section aria-labelledby="for-sale-steps" className="bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
      <div className="grid items-center gap-10 lg:grid-cols-[3fr_2fr]">
        <div>
          <h2 id="for-sale-steps" className="font-anton text-3xl leading-tight tracking-wide text-theme-primary sm:text-4xl dark:text-red-400">
            {heading}
          </h2>
          <ol className="mt-8 space-y-7">
            {steps.map((step) => {
              const Icon = ICONS[step.icon]
              return (
                <li key={step.title} className="flex gap-5">
                  <Icon aria-hidden className="mt-1 h-10 w-10 shrink-0 text-theme-dark dark:text-white" strokeWidth={2.25} />
                  <p className="text-base leading-relaxed text-theme-mid sm:text-lg dark:text-neutral-300">
                    <strong className="font-bold text-theme-dark dark:text-white">{step.title}</strong> {step.body}
                  </p>
                </li>
              )
            })}
          </ol>
        </div>
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="(max-width: 1024px) 70vw, 30vw"
          className="mx-auto h-auto w-full max-w-sm"
        />
      </div>
    </section>
  )
}
