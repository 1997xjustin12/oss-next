import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { EXTERNAL_HTML_ATTR } from '@/lib/linkEnrich'
import type { BlogFaq as BlogFaqItem } from '@/types/blog'

type Props = { faqs: BlogFaqItem[] }

/**
 * The post's FAQs from the backend, in the shared FAQ accordion.
 *
 * The answers are the editor's markup (sanitized in blog.service), rendered
 * with the article body's `.blog-content` typography so links, lists and dark
 * mode match the rest of the post. The questions carry their own numbers
 * ("1. What…") in the data, so the list adds none.
 */
export function BlogFaq({ faqs }: Props) {
  return (
    <FaqAccordion
      id="blog-faq-heading"
      heading="Frequently Asked Questions"
      className="mt-10"
      items={faqs.map((faq) => ({
        question: faq.question,
        answer: (
          <div
            {...{ [EXTERNAL_HTML_ATTR]: '' }}
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: faq.answerHtml }}
          />
        ),
      }))}
    />
  )
}
