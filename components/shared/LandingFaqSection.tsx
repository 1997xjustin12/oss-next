import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { LandingRichText } from '@/components/shared/LandingRichText'
import { LANDING_FAQ_HEADING, type LandingFaq } from '@/lib/data/containerLandingContent'

type Props = {
  faqs: readonly LandingFaq[]
  /** Default "FREQUENTLY ASKED QUESTIONS". `[[…]]` accent markers are dropped: the bar is one colour. */
  heading?: string
  /** Without its own section padding and background, for a parent that lays it out (the location pages' FAQ beside a video). */
  bare?: boolean
}

/**
 * The for-sale and rental pages' FAQ: the shared accordion, each answer's
 * paragraphs and lists with their links. Every answer is in the HTML; the page
 * emits FAQPage from the same list (landingFaqText).
 */
export function LandingFaqSection({ faqs, heading = LANDING_FAQ_HEADING, bare = false }: Props) {
  return (
    <div className={bare ? 'min-w-0' : 'bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950'}>
      <FaqAccordion
        id="landing-faq"
        heading={heading.replace(/\[\[|\]\]/g, '')}
        items={faqs.map((faq) => ({
          question: faq.question,
          answer: (
            <div className="space-y-3">
              {faq.answer.map((block, i) =>
                'p' in block ? (
                  <p key={i}>
                    <LandingRichText content={block.p} />
                  </p>
                ) : (
                  <ul key={i} className="list-disc space-y-2 pl-5">
                    {block.ul.map((item, j) => (
                      <li key={j}>
                        <LandingRichText content={item} />
                      </li>
                    ))}
                  </ul>
                ),
              )}
            </div>
          ),
        }))}
      />
    </div>
  )
}
