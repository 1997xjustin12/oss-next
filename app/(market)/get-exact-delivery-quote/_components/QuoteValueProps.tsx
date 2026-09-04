import { Headphones, RefreshCw, ShieldCheck, Truck } from 'lucide-react'

const ITEMS = [
  { icon: ShieldCheck, title: 'Quality containers', copy: 'Inspected, secure, built to last' },
  { icon: Headphones, title: 'Expert support', copy: 'Real people, real answers' },
  { icon: Truck, title: 'Nationwide delivery', copy: 'Fast, reliable to your location' },
  { icon: RefreshCw, title: 'Rent & rent-to-own', copy: 'Flexible options for your budget' },
] as const

/** Reassurance below the form, for the visitor deciding whether to fill it in. */
export function QuoteValueProps() {
  return (
    <section className="mt-6 rounded-lg border border-theme-border bg-theme-bg px-5 py-7 shadow-sm sm:px-8 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="text-center text-lg font-bold text-theme-dark sm:text-xl dark:text-white">
        Why buy from On Site Storage?
      </h2>

      <ul className="mt-6 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map(({ icon: Icon, title, copy }) => (
          <li key={title} className="flex flex-col items-center text-center">
            <Icon className="h-6 w-6 text-theme-primary" aria-hidden />
            <h3 className="mt-3 text-sm font-bold text-theme-dark dark:text-white">{title}</h3>
            <p className="mt-1 max-w-[22ch] text-sm text-theme-muted">{copy}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
