import Image, { getImageProps } from 'next/image'
import { preload } from 'react-dom'
import { Check } from 'lucide-react'
import { AccentText } from '@/components/shared/AccentText'
import { GbpCallButton } from './GbpCallButton'
import { GBP_ACCENT, GBP_BG_WHITE, GBP_CONTAINER, GBP_H2, GBP_HEADING, sectionPadding, sectionVars } from './gbpStyles'
import type { GbpSectionStyle, GbpSharedContent } from '@/types/gbp'

type Props = { heading: string; phone: string; telHref: string; cards: GbpSharedContent['productCards']; style?: GbpSectionStyle }

/** Rent / Buy / Rent-To-Own: three cards, each ending in the page's call button. */
/**
 * Phones only: without the hero photo (see GbpHero), the first card's image is
 * in the first screen and is the LCP element, so it is preloaded there. From
 * tablets up it is below the fold and stays lazy.
 */
const PHONE_MEDIA = '(max-width: 767px)'
const SIZES = '(max-width: 768px) calc(100vw - 96px), 400px'

export function GbpProducts({ heading, phone, telHref, cards, style }: Props) {
  const first = cards[0]?.image
  if (first) {
    const { props } = getImageProps({ src: first.src, alt: first.alt, width: first.width, height: first.height, sizes: SIZES })
    preload(props.src, { as: 'image', imageSrcSet: props.srcSet, imageSizes: props.sizes, fetchPriority: 'high', media: PHONE_MEDIA })
  }
  return (
    <section aria-labelledby="gbp-products" className={`${GBP_BG_WHITE} ${sectionPadding(style, 'py-10 sm:py-12')}`} style={sectionVars(style)}>
      <div className={GBP_CONTAINER}>
        <h2 id="gbp-products" className={GBP_H2}>
          <AccentText text={heading} accentClassName={GBP_ACCENT} />
        </h2>
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {cards.map((card, i) => (
            <li
              key={card.title}
              className="flex flex-col items-center rounded-md border border-red-100 bg-white px-6 pb-7 pt-5 text-center shadow-[0_0_10px_rgba(198,12,41,0.25)]
                         dark:border-red-950 dark:bg-neutral-900"
            >
              <Image
                src={card.image.src}
                alt={card.image.alt}
                width={card.image.width}
                height={card.image.height}
                // The card's content width: the viewport less gutters and padding on phones.
                sizes={SIZES}
                // The first one is the phone LCP: not lazy (its preload is phone-only).
                loading={i === 0 ? 'eager' : 'lazy'}
                // White behind it in dark mode: "RENT"'s letters are cut out of the image.
                className="h-auto w-full max-w-sm dark:rounded-md dark:bg-white dark:p-2"
              />
              <h3 className={`mt-4 text-[23px] font-bold leading-none ${GBP_HEADING}`}>{card.title}</h3>
              <ul className="mt-4 text-base font-normal leading-normal text-black dark:text-neutral-200">
                {card.features.map((feature) => (
                  <li key={feature} className="flex items-center justify-center gap-2">
                    <Check aria-hidden className="h-4 w-4 shrink-0" strokeWidth={3} />
                    {feature}
                  </li>
                ))}
              </ul>
              <GbpCallButton phone={phone} telHref={telHref} className="mt-6 min-w-44 text-base md:text-xl" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
