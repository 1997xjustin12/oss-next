import { Check } from 'lucide-react'

/**
 * Where the visitor is in the delivery-quote flow.
 *
 * Four steps, two of which this route does not own: picking a container and
 * giving a ZIP both happen on the product page. They are still shown, and shown
 * as complete, because a visitor who arrived here has genuinely done them — a
 * progress bar that started at "Contact Info" would make a four-step errand
 * look like it had barely begun.
 *
 * `<ol>` because the order is the meaning. The state of each step is announced
 * to screen readers in words rather than left to the colour of a circle.
 */

const STEPS = ['Product', 'Location', 'Contact Info', 'Review'] as const

export function QuoteStepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <nav aria-label="Quote progress" className="shrink-0">
      <ol className="flex items-center justify-between gap-1 sm:justify-start sm:gap-0">
        {STEPS.map((label, index) => {
          const step = index + 1
          const isComplete = step < currentStep
          const isCurrent = step === currentStep

          return (
            <li key={label} className="flex items-center">
              <div className="flex w-14 flex-col items-center gap-1.5 sm:w-16">
                <span
                  aria-hidden
                  className={[
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold sm:h-9 sm:w-9',
                    isCurrent
                      ? 'bg-theme-primary text-white ring-4 ring-theme-primary/25'
                      : isComplete
                        ? 'bg-white/30 text-white'
                        : 'bg-white/10 text-white/50',
                  ].join(' ')}
                >
                  {isComplete ? <Check className="h-4 w-4" /> : step}
                </span>

                <span
                  className={[
                    'text-center text-[10px] leading-tight sm:text-[11px]',
                    isCurrent ? 'font-semibold text-white' : 'text-white/60',
                  ].join(' ')}
                >
                  {label}
                </span>

                <span className="sr-only">
                  {isComplete ? 'Completed' : isCurrent ? 'Current step' : 'Not started'}
                </span>
              </div>

              {step < STEPS.length && (
                <span aria-hidden className="mb-5 h-px w-4 bg-white/25 sm:w-8" />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
