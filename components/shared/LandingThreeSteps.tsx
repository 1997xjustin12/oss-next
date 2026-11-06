import Image from 'next/image'
import { LocateFixed, ShoppingBag, Truck } from 'lucide-react'
import { AccentText } from '@/components/shared/AccentText'
import { LocationSearch } from '@/components/shared/LocationSearch'
import { THREE_STEPS } from '@/lib/data/containerLandingContent'

type Props = {
  /** Which listing the ZIP opens. */
  ptype: 'buy' | 'rental'
}

const ICONS = [LocateFixed, ShoppingBag, Truck] as const

/**
 * "Purchase or Rent Your Shipping Container in 3 Easy Steps": the map, the three
 * steps and WordPress's "Get Instant Local Pricing" ZIP box (LocationSearch).
 */
export function LandingThreeSteps({ ptype }: Props) {
  const { heading, steps, image, submitLabel, placeholder } = THREE_STEPS

  return (
    <section aria-labelledby="three-steps" className="bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="(max-width: 1024px) 90vw, 45vw"
          className="mx-auto h-auto w-full max-w-xl dark:rounded-xl dark:bg-white dark:p-4"
        />

        <div>
          <h2 id="three-steps" className="text-3xl font-extrabold leading-tight text-theme-dark sm:text-4xl dark:text-white">
            <AccentText text={heading} accentClassName="text-theme-primary dark:text-red-400" />
          </h2>

          <ol className="mt-8 space-y-6">
            {steps.map((step, i) => {
              const Icon = ICONS[i]
              return (
                <li key={step} className="flex items-center gap-5">
                  <span
                    aria-hidden
                    className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-theme-primary sm:h-20 sm:w-20 dark:border-red-400 ${
                      i === 0 ? 'bg-theme-primary text-white dark:bg-red-400 dark:text-neutral-950' : 'text-theme-primary dark:text-red-400'
                    }`}
                  >
                    <Icon className="h-8 w-8 sm:h-9 sm:w-9" />
                  </span>
                  <p className="text-base leading-relaxed text-theme-dark sm:text-lg dark:text-neutral-200">
                    <span className="sr-only">Step {i + 1}: </span>
                    {step}
                  </p>
                </li>
              )
            })}
          </ol>

          <div className="mt-8">
            <LocationSearch ptype={ptype} tone="onLight" submitLabel={submitLabel} placeholder={placeholder} />
          </div>
        </div>
      </div>
    </section>
  )
}
