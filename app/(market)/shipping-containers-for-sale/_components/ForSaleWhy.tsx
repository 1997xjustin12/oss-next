import { YouTubeEmbed } from '@/components/product/YouTubeEmbed'
import { PillLink } from '@/components/shared/PillLink'
import { FOR_SALE_LINKS, FOR_SALE_WHY } from '@/lib/data/forSaleContent'

/**
 * "Why Buy from On-Site Storage?": the video beside three reasons and the quote
 * button. WordPress autoplayed the video muted on a loop; here it plays on
 * click, so it costs nothing until someone wants it (migration doc §4).
 */
export function ForSaleWhy() {
  const { heading, points, cta, video } = FOR_SALE_WHY

  return (
    <section aria-labelledby="for-sale-why" className="bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <YouTubeEmbed video={video} />
        </div>
        <div className="order-1 lg:order-2">
          <h2 id="for-sale-why" className="font-anton text-3xl leading-tight tracking-wide text-theme-primary sm:text-4xl dark:text-red-400">
            {heading}
          </h2>
          <ul className="mt-6 list-disc space-y-3 pl-5 text-base leading-relaxed text-theme-mid sm:text-lg dark:text-neutral-300">
            {points.map((point) => (
              <li key={point.title}>
                <strong className="font-bold text-theme-dark dark:text-white">{point.title}</strong> {point.body}
              </li>
            ))}
          </ul>
          <PillLink href={FOR_SALE_LINKS.quote} tone="amber" className="mt-7">
            {cta}
          </PillLink>
        </div>
      </div>
    </section>
  )
}
