import { Plus } from 'lucide-react'
import type { ReactNode } from 'react'

export type FaqAccordionItem = {
  question: string
  /** Rendered inside the answer panel: text, or markup the caller prepared. */
  answer: ReactNode
}

type Props = {
  /** Visible heading, e.g. "Frequently Asked Questions". */
  heading: string
  items: readonly FaqAccordionItem[]
  /** Unique per page: the heading's id, which labels the section. */
  id?: string
  className?: string
}

/**
 * FAQs as the WordPress pages show them: a dark heading bar, then one red row
 * per question with a "+" that turns into a "×" when open. Used by the blog
 * posts and the rent-to-own page.
 *
 * Each row is a <details>, so it opens without JavaScript and every answer
 * stays in the HTML for search engines. Pages that show FAQs also emit FAQPage
 * structured data (faqNode in lib/schema.ts) from the same list.
 */
export function FaqAccordion({ heading, items, id = 'faq-heading', className = '' }: Props) {
  if (items.length === 0) return null

  return (
    <section aria-labelledby={id} className={className}>
      <h2
        id={id}
        className="bg-[#333] px-4 py-3 text-center font-anton text-3xl uppercase leading-tight tracking-wide text-white
                   sm:text-4xl dark:bg-neutral-800"
      >
        {heading}
      </h2>

      <div className="mt-6 divide-y divide-white/40 overflow-hidden rounded-sm border border-theme-primary dark:divide-white/20 dark:border-red-900">
        {items.map((item) => (
          <details key={item.question} className="group">
            <summary
              className="flex min-h-12 cursor-pointer list-none items-start justify-between gap-4 bg-theme-primary px-4 py-3 text-white
                         transition-colors hover:bg-theme-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset
                         focus-visible:ring-white sm:px-5 [&::-webkit-details-marker]:hidden"
            >
              <h3 className="text-base font-bold leading-snug sm:text-lg">{item.question}</h3>
              <Plus aria-hidden className="mt-0.5 h-5 w-5 shrink-0 transition-transform group-open:rotate-45" strokeWidth={3} />
            </summary>
            <div className="bg-white px-4 py-3 text-[15px] leading-relaxed text-theme-dark sm:px-5 dark:bg-neutral-900 dark:text-neutral-200">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}
