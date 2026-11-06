import { ZohoQuoteRequestForm } from '@/components/shared/ZohoQuoteRequestForm'
import { FAQ_GROUPS, FAQS_HERO } from '@/lib/data/faqsContent'

/**
 * The page's heading and introduction, with WordPress's quote request form
 * beside them from lg up (under them on phones), and a jump list to the three
 * FAQ groups made of their own headings.
 */
export function FaqsHero() {
  const { heading, intro } = FAQS_HERO

  return (
    <section aria-labelledby="faqs-heading" className="bg-theme-subtle px-[5%] py-10 sm:py-14 dark:bg-neutral-900">
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] lg:gap-12">
        <div className="min-w-0 lg:sticky lg:top-28">
          <h1 id="faqs-heading" className="text-3xl font-extrabold leading-tight text-theme-dark sm:text-5xl dark:text-white">
            {heading}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-theme-mid sm:text-lg dark:text-neutral-300">{intro}</p>
          <nav aria-label="FAQ sections" className="mt-8">
            <ul className="flex flex-wrap gap-3">
              {FAQ_GROUPS.map((group) => (
                <li key={group.id}>
                  <a
                    href={`#${group.id}`}
                    className="inline-flex min-h-11 items-center rounded-full border border-theme-primary px-5 text-sm font-bold text-theme-primary transition-colors
                               hover:bg-theme-primary hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary
                               dark:border-red-400 dark:text-red-400 dark:hover:bg-red-400 dark:hover:text-neutral-950"
                  >
                    {group.heading}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="min-w-0 rounded-xl border border-theme-border bg-white p-5 shadow-sm sm:p-8 dark:border-neutral-800 dark:bg-neutral-950">
          <ZohoQuoteRequestForm />
        </div>
      </div>
    </section>
  )
}
