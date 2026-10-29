import Image from 'next/image'
import Link from 'next/link'
import { CircleArrowRight } from 'lucide-react'
import { AccentText } from '@/components/shared/AccentText'
import { GBP_ACCENT, GBP_CONTAINER, GBP_H2 } from './gbpStyles'
import type { GbpBlogCard } from '@/types/gbp'

type Props = { heading: string; cards: readonly GbpBlogCard[] }

/** The post's path, so the link stays on whatever host serves the page (staging included). */
function postPath(url: string): string {
  return new URL(url).pathname
}

/**
 * "{City} Container Resources": four local blog posts. The whole card is the
 * link (the title's link stretched over it), so the target is the card, not
 * just WordPress's small arrow. A card with no post renders without a link.
 */
export function GbpResources({ heading, cards }: Props) {
  if (cards.length === 0) return null
  return (
    <section aria-labelledby="gbp-resources" className="bg-white py-10 sm:py-12 dark:bg-neutral-950">
      <div className={GBP_CONTAINER}>
        <h2 id="gbp-resources" className={GBP_H2}>
          <AccentText text={heading} accentClassName={GBP_ACCENT} />
        </h2>
        <ul className="mt-8 space-y-6">
          {cards.map((card) => (
            <li key={card.title}>
              <article className="group relative grid items-center gap-4 sm:grid-cols-[minmax(0,1fr)_2fr_auto] sm:gap-6">
                <Image
                  src={card.image}
                  alt={card.imageAlt}
                  width={768}
                  height={432}
                  sizes="(max-width: 640px) 92vw, 340px"
                  className="aspect-video h-auto w-full rounded-sm object-cover shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
                />
                <div>
                  <h3 className="text-lg font-bold leading-snug text-gbp sm:text-xl dark:text-red-400">
                    {card.url ? (
                      <Link
                        href={postPath(card.url)}
                        prefetch={false}
                        className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-focus-within:underline"
                      >
                        {card.title}
                      </Link>
                    ) : (
                      card.title
                    )}
                  </h3>
                  <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-black dark:text-neutral-300">{card.excerpt}</p>
                </div>
                {card.url && (
                  <CircleArrowRight
                    aria-hidden
                    className="hidden h-9 w-9 fill-gbp text-white transition-transform group-hover:translate-x-1 sm:block dark:fill-red-500"
                  />
                )}
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
