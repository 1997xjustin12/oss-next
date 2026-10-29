import { ChevronDown } from 'lucide-react'
import { AccentText } from '@/components/shared/AccentText'
import { YouTubeEmbed } from '@/components/product/YouTubeEmbed'
import { GBP_FAQ_HEADING } from '@/lib/data/gbpShared'
import { GBP_ACCENT, GBP_CONTAINER } from './gbpStyles'
import type { GbpFaq as GbpFaqItem } from '@/types/gbp'

type Props = { faqs: readonly GbpFaqItem[]; youtubeId: string; city: string }

/**
 * "Frequently Asked Questions" (`#faqs`): red rows, one open at a time (the
 * shared `name` makes the <details> an exclusive group, as WordPress's
 * accordion is), beside the page's video. Every answer stays in the HTML; the
 * same list feeds the FAQPage structured data.
 *
 * The video is a poster until clicked, so YouTube's player costs nothing on
 * load.
 */
export function GbpFaq({ faqs, youtubeId, city }: Props) {
  return (
    <section id="faqs" aria-labelledby="gbp-faqs" className="scroll-mt-4 bg-white py-10 sm:py-12 dark:bg-neutral-950">
      <div className={`${GBP_CONTAINER} grid items-start gap-8 md:grid-cols-2`}>
        <div>
          <h2 id="gbp-faqs" className="text-center text-2xl font-bold leading-[1.1] text-black md:text-left md:text-[30px] dark:text-white">
            <AccentText text={GBP_FAQ_HEADING} accentClassName={GBP_ACCENT} />
          </h2>
          <div className="mt-6 space-y-2">
            {faqs.map((faq) => (
              <details key={faq.question} name="gbp-faq" className="group overflow-hidden rounded-sm">
                <summary
                  className="flex cursor-pointer list-none items-center gap-3 bg-[#C60C29] px-4 py-2.5 text-lg font-medium leading-normal text-white
                             hover:bg-[#a30a22] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white
                             dark:bg-[#9b0a20] [&::-webkit-details-marker]:hidden"
                >
                  <ChevronDown aria-hidden className="h-4 w-4 shrink-0 -rotate-90 transition-transform group-open:rotate-0" strokeWidth={3} />
                  <h3>{faq.question}</h3>
                </summary>
                <div className="border border-t-0 border-neutral-200 bg-white px-4 py-3 text-base leading-normal text-black dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
        <div className="md:pt-14">
          <YouTubeEmbed video={{ id: youtubeId, title: `On-Site Storage Solutions in ${city}` }} />
        </div>
      </div>
    </section>
  )
}
