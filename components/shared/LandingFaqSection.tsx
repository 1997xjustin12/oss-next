import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { LandingRichText } from '@/components/shared/LandingRichText'
import { LANDING_FAQ_HEADING, type LandingFaq } from '@/lib/data/containerLandingContent'

type Props = { faqs: readonly LandingFaq[] }

/**
 * The for-sale and rental pages' FAQ: the shared accordion, each answer's
 * paragraphs and lists with their links. Every answer is in the HTML; the page
 * emits FAQPage from the same list (landingFaqText).
 */
export function LandingFaqSection({ faqs }: Props) {
  return (
    <div className="bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
      <FaqAccordion
        id="landing-faq"
        heading={LANDING_FAQ_HEADING}
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
