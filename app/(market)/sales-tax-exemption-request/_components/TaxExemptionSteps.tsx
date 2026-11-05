import { TAX_EXEMPTION_STEPS } from '@/lib/data/taxExemptionContent'

/** How a request works, from the WordPress page's introduction. */
export function TaxExemptionSteps() {
  return (
    <section aria-label="How it works" className="bg-theme-subtle px-[5%] py-10 sm:py-12 dark:bg-neutral-900">
      <ol className="grid gap-6 md:grid-cols-3 md:gap-8">
        {TAX_EXEMPTION_STEPS.map((step, index) => (
          <li key={step.title} className="flex gap-4">
            <span
              aria-hidden
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-theme-primary text-lg font-extrabold text-white"
            >
              {index + 1}
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold text-theme-dark dark:text-white">{step.title}</h2>
              <p className="mt-1 text-[15px] leading-relaxed text-theme-mid dark:text-neutral-300">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
