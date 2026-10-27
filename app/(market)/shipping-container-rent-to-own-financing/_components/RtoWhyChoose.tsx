import Image from 'next/image'
import { RTO_WHY } from '@/lib/data/rentToOwnContent'

/**
 * "Why Choose Rent-To-Own": the delivery photo, with the early-payoff badge on
 * its corner, beside the four reasons. Stacked on phones, side by side from lg.
 *
 * The WordPress section also held a "See My Monthly Payment" ZIP box (a plugin
 * shortcode); that is a feature still to build.
 */
export function RtoWhyChoose() {
  const { heading, image, badge, points } = RTO_WHY

  return (
    <section aria-labelledby="rto-why" className="bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-theme-subtle dark:bg-neutral-800">
            <Image src={image.src} alt={image.alt} fill sizes="(max-width: 1024px) 90vw, 45vw" className="object-cover" />
          </div>
          <Image
            src={badge.src}
            alt={badge.alt}
            width={800}
            height={755}
            sizes="(max-width: 640px) 112px, 160px"
            className="absolute -left-2 -top-4 h-auto w-28 drop-shadow-lg sm:-left-4 sm:-top-6 sm:w-40"
          />
        </div>

        <div>
          <h2 id="rto-why" className="text-3xl font-extrabold leading-tight text-theme-dark sm:text-4xl dark:text-white">
            {heading.rest} <span className="text-theme-primary dark:text-red-400">{heading.accent}</span>
          </h2>
          <ul className="mt-5 list-disc space-y-3 pl-5 text-base leading-relaxed text-theme-dark marker:text-theme-dark sm:text-lg dark:text-neutral-200 dark:marker:text-neutral-400">
            {points.map((point) => (
              <li key={point.title}>
                <strong className="font-extrabold">{point.title} —</strong> {point.body}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
