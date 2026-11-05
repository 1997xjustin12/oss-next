import { Check, Clock, Mail } from 'lucide-react'
import { TAX_EXEMPTION_THANK_YOU } from '@/lib/data/taxExemptionContent'

const ICONS = { done: Check, current: Clock, upcoming: Mail } as const

const DISC = {
  done: 'bg-theme-primary text-white',
  current: 'bg-[#F4BF3C] text-theme-dark',
  upcoming: 'border-2 border-neutral-300 bg-white text-theme-mid dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-300',
} as const

/** Where the request stands: an ordered list, with the current step marked for screen readers. */
export function ThankYouSteps() {
  const { stepsHeading, steps } = TAX_EXEMPTION_THANK_YOU

  return (
    <section
      aria-labelledby="thank-you-steps"
      className="min-w-0 rounded-xl border border-theme-border bg-white p-5 shadow-sm sm:p-6 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <h2 id="thank-you-steps" className="text-lg font-extrabold text-theme-dark dark:text-white">
        {stepsHeading}
      </h2>
      <ol className="mt-5">
        {steps.map((step, index) => {
          const Icon = ICONS[step.state]
          const last = index === steps.length - 1
          return (
            <li key={step.title} aria-current={step.state === 'current' ? 'step' : undefined} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span aria-hidden className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${DISC[step.state]}`}>
                  <Icon className="h-5 w-5" strokeWidth={2.5} />
                </span>
                {!last && <span aria-hidden className="my-1 w-0.5 flex-1 bg-neutral-300 dark:bg-neutral-700" />}
              </div>
              <div className={`min-w-0 pt-1.5 ${last ? '' : 'pb-6'}`}>
                <h3 className="text-base font-bold text-theme-dark dark:text-white">{step.title}</h3>
                <p className="mt-0.5 text-[15px] leading-relaxed text-theme-mid dark:text-neutral-300">{step.body}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
