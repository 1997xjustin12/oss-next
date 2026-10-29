import Image from 'next/image'
import Link from 'next/link'
import { CircleArrowRight } from 'lucide-react'
import { AccentText } from '@/components/shared/AccentText'
import { ROUTES } from '@/config/routes'
import { getCachedBlog } from '@/services/blog.service'
import { GBP_ACCENT, GBP_BG_WHITE, GBP_BRAND_TEXT, GBP_CONTAINER, GBP_H2, sectionPadding, sectionVars } from './gbpStyles'
import type { GbpBlogCard, GbpManualBlogCard, GbpSectionStyle } from '@/types/gbp'

type Props = { heading: string; cards: readonly GbpBlogCard[]; style?: GbpSectionStyle }

/** The post's path, so the link stays on whatever host serves the page (staging included). */
function postPath(url: string): string {
  return new URL(url, 'https://onsitestorage.com').pathname
}

/**
 * A post's excerpt cut to about the length of a hand-written card's. The API's
 * is often the post's whole first paragraph.
 */
function shorten(excerpt: string, max = 220): string {
  if (excerpt.length <= max) return excerpt
  const cut = excerpt.slice(0, max)
  return `${cut.slice(0, cut.lastIndexOf(' ') > 0 ? cut.lastIndexOf(' ') : max).replace(/[\s,;:.–-]+$/, '')}…`
}

/**
 * A card as rendered: a manual card as typed, a post card from the post itself
 * (cached reads, so the page stays static). A post that is no longer published
 * comes back null and the card is left out.
 */
async function resolveCard(card: GbpBlogCard): Promise<GbpManualBlogCard | null> {
  if (!('post' in card)) return card
  const post = await getCachedBlog(card.post)
  if (!post) return null
  return { title: post.title, excerpt: shorten(post.excerpt), url: ROUTES.BLOG(post.slug), image: post.imageUrl, imageAlt: post.imageAlt }
}

/**
 * "{City} Container Resources": local blog posts. The whole card is the
 * link (the title's link stretched over it), so the target is the card, not
 * just WordPress's small arrow. A card with no post renders without a link.
 */
export async function GbpResources({ heading, cards: configured, style }: Props) {
  const cards = (await Promise.all(configured.map(resolveCard))).filter((card) => card !== null)
  if (cards.length === 0) return null
  return (
    <section aria-labelledby="gbp-resources" className={`${GBP_BG_WHITE} ${sectionPadding(style, 'py-10 sm:py-12')}`} style={sectionVars(style)}>
      <div className={GBP_CONTAINER}>
        <h2 id="gbp-resources" className={GBP_H2}>
          <AccentText text={heading} accentClassName={GBP_ACCENT} />
        </h2>
        <ul className="mt-8 space-y-6">
          {cards.map((card) => (
            <li key={card.title}>
              <article className="group relative grid items-center gap-4 sm:grid-cols-[minmax(0,1fr)_2fr_auto] sm:gap-6">
                {card.image ? (
                  <Image
                    src={card.image}
                    alt={card.imageAlt}
                    width={768}
                    height={432}
                    sizes="(max-width: 640px) 92vw, 340px"
                    className="aspect-video h-auto w-full rounded-sm object-cover shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
                  />
                ) : (
                  <span aria-hidden className="aspect-video w-full rounded-sm bg-neutral-200 dark:bg-neutral-800" />
                )}
                <div>
                  <h3 className={`text-center text-xl font-bold leading-normal sm:text-left md:text-[25px] ${GBP_BRAND_TEXT}`}>
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
                  <p className="mt-2 text-center text-[15.5px] font-light leading-[1.3] text-black sm:text-left dark:text-neutral-300">{card.excerpt}</p>
                </div>
                {card.url && (
                  <CircleArrowRight
                    aria-hidden
                    className="hidden h-9 w-9 fill-[var(--gbp-brand,#C60C29)] text-white transition-transform group-hover:translate-x-1 sm:block dark:fill-red-500"
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
