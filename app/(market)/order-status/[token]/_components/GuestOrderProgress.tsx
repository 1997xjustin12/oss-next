import { Check } from 'lucide-react'
import type { OrderStatus } from '@/types/order'

type Props = {
  status: OrderStatus
}

const STEPS = ['Ordered', 'Paid', 'On its way', 'Delivered'] as const

/** How far along each status is. `pending` sits with `paid`: received and being worked on. */
const STEP_REACHED: Partial<Record<OrderStatus, number>> = {
  unpaid: 0,
  pending: 1,
  paid: 1,
  shipped: 2,
  delivered: 3,
}

/**
 * Four-step progress line. Not rendered for cancelled or refunded orders —
 * those left the line, and showing where they stopped would read as progress.
 */
export function GuestOrderProgress({ status }: Props) {
  const reached = STEP_REACHED[status]
  if (reached === undefined) return null

  return (
    <ol className="grid grid-cols-4 gap-1" aria-label={`Order progress: ${STEPS[reached]}`}>
      {STEPS.map((label, index) => {
        const done = index <= reached
        return (
          <li key={label} className="flex flex-col items-center gap-1.5 text-center">
            <span className="relative flex w-full items-center justify-center">
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className={`absolute right-1/2 top-1/2 h-0.5 w-full -translate-y-1/2 ${
                    done ? 'bg-theme-primary dark:bg-red-400' : 'bg-theme-border dark:bg-gray-700'
                  }`}
                />
              )}
              <span
                className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                  done
                    ? 'border-theme-primary bg-theme-primary text-white dark:border-red-400 dark:bg-red-400'
                    : 'border-theme-border bg-white dark:border-gray-600 dark:bg-gray-900'
                }`}
              >
                {done && <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />}
              </span>
            </span>
            <span
              className={`text-[11px] sm:text-xs ${
                index === reached
                  ? 'font-bold text-theme-dark dark:text-white'
                  : done
                    ? 'text-theme-dark-2 dark:text-gray-300'
                    : 'text-theme-muted dark:text-gray-500'
              }`}
            >
              {label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
