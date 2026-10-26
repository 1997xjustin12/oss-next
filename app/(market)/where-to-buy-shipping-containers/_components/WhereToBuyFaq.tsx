import { Plus } from "lucide-react";
import { WHERE_TO_BUY_FAQS, WHERE_TO_BUY_VIDEO } from "@/lib/data/whereToBuyContent";
import { YouTubeEmbed } from "@/components/product/YouTubeEmbed";

/**
 * The video and the FAQ, side by side from lg up. Answers are <details>, so
 * they open without JavaScript and stay in the HTML for search engines (the
 * page's FAQPage structured data is built from the same list).
 */
export function WhereToBuyFaq() {
  return (
    <section aria-labelledby="faq-heading" className="bg-white px-4 py-12 sm:px-[5%] sm:py-16 dark:bg-neutral-950">
      <div className="mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg">
          <YouTubeEmbed video={WHERE_TO_BUY_VIDEO} />
        </div>
        <div>
          <h2 id="faq-heading" className="mb-5 text-2xl font-extrabold uppercase text-theme-dark sm:text-3xl dark:text-gray-100">
            Frequently asked questions
          </h2>
          <div className="divide-y divide-theme-border overflow-hidden rounded-lg border border-theme-border dark:divide-neutral-800 dark:border-neutral-800">
            {WHERE_TO_BUY_FAQS.map((faq) => (
              <details key={faq.question} className="group bg-white dark:bg-neutral-900">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 font-bold text-theme-dark transition-colors hover:text-theme-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-theme-primary dark:text-gray-100 dark:hover:text-red-400 [&::-webkit-details-marker]:hidden">
                  <h3 className="text-base">{faq.question}</h3>
                  <Plus aria-hidden className="h-5 w-5 shrink-0 transition-transform group-open:rotate-45" />
                </summary>
                <p className="px-5 pb-5 text-[15px] leading-relaxed text-theme-mid dark:text-gray-300">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
