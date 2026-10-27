import { Plus } from 'lucide-react'
import { EXTERNAL_HTML_ATTR } from '@/lib/linkEnrich'
import type { BlogFaq as BlogFaqItem } from '@/types/blog'

type Props = { faqs: BlogFaqItem[] }

/**
 * The post's FAQs from the backend, as the WordPress posts showed them: a dark
 * heading bar, then one red row per question with a "+" that turns into a
 * "×" when open.
 *
 * Each row is a <details>, so it opens without JavaScript and every answer
 * stays in the HTML for search engines; the page's FAQPage structured data is
 * built from the same list. The answer markup is the editor's (sanitized in
 * blog.service), rendered with the article body's `.blog-content` typography
 * so links, lists and dark mode match the rest of the post.
 *
 * The questions carry their own numbers ("1. What…") in the data, so the list
 * adds none.
 */
export function BlogFaq({ faqs }: Props) {
  if (faqs.length === 0) return null

  return (
    <section aria-labelledby="blog-faq-heading" className="mt-10">
      <h2
        id="blog-faq-heading"
        className="bg-[#333] px-4 py-3 text-center font-anton text-3xl uppercase leading-tight tracking-wide text-white
                   sm:text-4xl dark:bg-neutral-800"
      >
        Frequently Asked Questions
      </h2>

      <div className="mt-6 divide-y divide-white/40 overflow-hidden rounded-sm border border-theme-primary dark:divide-white/20 dark:border-red-900">
        {faqs.map((faq) => (
          <details key={faq.question} className="group">
            <summary
              className="flex min-h-12 cursor-pointer list-none items-start justify-between gap-4 bg-theme-primary px-4 py-3 text-white
                         transition-colors hover:bg-theme-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset
                         focus-visible:ring-white sm:px-5 [&::-webkit-details-marker]:hidden"
            >
              <h3 className="text-base font-bold leading-snug sm:text-lg">{faq.question}</h3>
              <Plus aria-hidden className="mt-0.5 h-5 w-5 shrink-0 transition-transform group-open:rotate-45" strokeWidth={3} />
            </summary>
            <div
              {...{ [EXTERNAL_HTML_ATTR]: '' }}
              className="blog-content bg-white px-4 py-3 text-[15px] text-theme-dark sm:px-5 dark:bg-neutral-900 dark:text-neutral-200"
              dangerouslySetInnerHTML={{ __html: faq.answerHtml }}
            />
          </details>
        ))}
      </div>
    </section>
  )
}
