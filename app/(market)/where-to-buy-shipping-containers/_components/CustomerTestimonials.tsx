import { Star } from "lucide-react";
import { ALL_REVIEWS_PATH, TESTIMONIALS } from "@/lib/data/whereToBuyContent";
import { HoverPrefetchLink as Link } from "@/components/shared/HoverPrefetchLink";

/**
 * Four customer quotes and a link to every review. The button's hover is the
 * WordPress one: it turns white with red text and a red border.
 */
export function CustomerTestimonials() {
  return (
    <section aria-labelledby="testimonials-heading" className="bg-theme-subtle px-4 py-12 sm:px-[5%] sm:py-16 dark:bg-neutral-900">
      <div className="mx-auto max-w-7xl text-center">
        <h2 id="testimonials-heading" className="text-2xl font-extrabold text-theme-dark sm:text-3xl dark:text-gray-100">
          We&apos;ve Got A Lot of Happy Customers
        </h2>
        <ul className="mt-8 grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((t) => (
            <li key={t.name}>
              <figure className="flex h-full flex-col rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-950">
                <div role="img" aria-label="5 out of 5 stars" className="flex gap-0.5 text-amber-500">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} aria-hidden className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-theme-mid dark:text-gray-300">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-4 font-bold text-theme-dark dark:text-gray-100">{t.name}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <Link
          href={ALL_REVIEWS_PATH}
          className="mt-8 inline-flex min-h-11 items-center rounded-md border border-theme-primary bg-theme-primary px-8 font-bold text-white transition-colors hover:bg-white hover:text-theme-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2 dark:hover:bg-neutral-950 dark:hover:text-red-400"
        >
          View All Reviews
        </Link>
      </div>
    </section>
  );
}
