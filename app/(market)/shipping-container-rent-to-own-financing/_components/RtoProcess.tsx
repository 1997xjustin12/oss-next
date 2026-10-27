import { FilePenLine, Package, ShieldCheck, ShoppingCart } from 'lucide-react'
import { RTO_PAYMENT_TABLE, RTO_PROCESS, type RtoStepIcon } from '@/lib/data/rentToOwnContent'
import type { LucideIcon } from 'lucide-react'

const STEP_ICONS: Record<RtoStepIcon, LucideIcon> = {
  cart: ShoppingCart,
  approved: ShieldCheck,
  autopay: FilePenLine,
  own: Package,
}

/**
 * "How It Works": the four steps, each with its red icon disc, and the payment
 * table under the first ("Pick Your Rent-to-Own Payment Plan").
 *
 * An ordered list, since the steps are a sequence. The WordPress section ended
 * with a "Get Instantly Approved" ZIP box (a plugin shortcode); that is a
 * feature still to build.
 */
export function RtoProcess() {
  const { heading, steps } = RTO_PROCESS

  return (
    <section aria-labelledby="rto-process" className="bg-white px-[5%] pb-12 sm:pb-16 dark:bg-neutral-950">
      <h2 id="rto-process" className="text-center text-2xl font-extrabold leading-tight text-theme-dark sm:text-4xl dark:text-white">
        {heading.rest} <span className="text-theme-primary dark:text-red-400">{heading.accent}</span>
      </h2>

      <ol className="mt-10 space-y-10">
        {steps.map((step, index) => {
          const Icon = STEP_ICONS[step.icon]
          return (
            <li key={step.title} className="flex flex-col gap-4 sm:flex-row sm:gap-8">
              <span
                aria-hidden
                className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-theme-primary text-white sm:h-28 sm:w-28"
              >
                <Icon className="h-9 w-9 sm:h-12 sm:w-12" strokeWidth={2.25} />
              </span>
              <div className="min-w-0 flex-1 sm:pt-4">
                <h3 className="text-xl font-bold text-theme-dark sm:text-2xl dark:text-white">{step.title}</h3>
                <p className="mt-1 text-base leading-relaxed text-theme-mid sm:text-lg dark:text-neutral-300">{step.body}</p>
                {index === 0 && <PaymentTable />}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

/** Monthly payment by container amount and term. Scrolls inside itself on a phone. */
function PaymentTable() {
  const { caption, terms, rows } = RTO_PAYMENT_TABLE

  return (
    <div className="mt-6 overflow-x-auto rounded-sm border border-neutral-300 dark:border-neutral-700">
      <table className="w-full min-w-[34rem] border-collapse text-right text-sm">
        <caption className="bg-black py-2.5 text-center text-sm font-bold text-white">{caption}</caption>
        <thead>
          <tr className="bg-black text-white">
            <th scope="col" className="px-3 pb-2.5 text-center font-semibold">Amount</th>
            {terms.map((term) => (
              <th key={term} scope="col" className="px-3 pb-2.5 text-center font-semibold">{term}</th>
            ))}
          </tr>
        </thead>
        <tbody className="text-theme-dark dark:text-neutral-200">
          {rows.map((row) => (
            <tr key={row.amount} className="odd:bg-white even:bg-theme-subtle dark:odd:bg-neutral-900 dark:even:bg-neutral-800">
              <th scope="row" className="border border-neutral-300 px-3 py-1.5 font-semibold dark:border-neutral-700">{row.amount}</th>
              {row.monthly.map((value, i) => (
                <td key={terms[i]} className="border border-neutral-300 px-3 py-1.5 dark:border-neutral-700">{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
