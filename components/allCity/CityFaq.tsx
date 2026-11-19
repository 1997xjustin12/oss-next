import { Minus, Plus } from 'lucide-react'
import { TemplateRichText } from '@/components/shared/TemplateRichText'
import type { AllCityFaqText } from '@/types/allCity'

const LINK = 'font-semibold text-theme-primary underline underline-offset-2 hover:no-underline dark:text-red-400'

/**
 * "Frequently Asked Questions" (the 2026-11-19 design): red question bars,
 * the first one open, a plus or minus at the end of each. Plain `<details>`,
 * so it opens and closes with no script and every answer is in the HTML (the
 * same questions are the page's FAQPage structured data, AllCityPage).
 */
export function CityFaq({ text }: { text: AllCityFaqText }) {
  if (text.items.length === 0) return null

  return (
    <section aria-labelledby="city-faq" className="bg-white px-[5%] py-10 sm:py-14 dark:bg-neutral-950">
      <h2 id="city-faq" className="text-2xl font-bold tracking-wide text-neutral-800 uppercase sm:text-3xl dark:text-white">
        {text.heading}
      </h2>

      <div className="mt-5 divide-y divide-white/40 border border-theme-primary sm:mt-6 dark:divide-black/40">
        {text.items.map((item, i) => (
          <details key={i} open={i === 0} className="group">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 bg-theme-primary px-4 py-3 text-left text-base font-semibold text-white transition-colors hover:bg-theme-primary-dark focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white sm:text-lg [&::-webkit-details-marker]:hidden">
              <span>
                <TemplateRichText text={item.question} />
              </span>
              <Plus aria-hidden className="h-5 w-5 shrink-0 group-open:hidden" strokeWidth={2.5} />
              <Minus aria-hidden className="hidden h-5 w-5 shrink-0 group-open:block" strokeWidth={2.5} />
            </summary>
            <div className="bg-white px-4 py-4 text-[15px] leading-relaxed text-neutral-700 sm:min-h-32 sm:text-base dark:bg-neutral-900 dark:text-neutral-300">
              <TemplateRichText text={item.answer} linkClassName={LINK} />
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}
