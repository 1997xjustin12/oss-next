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
        {/* Measured from WordPress (Elementor), at every width: the row
            stretches the cards to one height; inside, a fixed 20px between
            parts, 10px padding, and the image a fixed 170px tall (contained),
            so the cards keep the same shape as the page narrows. The row sits
            as far from the edge as there (20px on phones, 10px from tablets
            up), not the 16/24px gutter. */}
        <ul className="mx-1 mt-8 grid gap-5 sm:-mx-1 md:-mx-3.5 md:grid-cols-3">
          {cards.map((card, i) => (
            <li
              key={card.title}
              className="flex flex-col gap-5 rounded-[5px] border border-transparent bg-white p-2.5 text-center shadow-[0_0_10px_rgba(233,25,25,0.5)]
                         dark:border-red-950 dark:bg-neutral-900"
            >
              <div className="p-2.5">
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
                  className="h-[170px] w-full object-contain dark:rounded-md dark:bg-white dark:p-2"
                />
              </div>
              <h3 className={`text-[23px] font-bold leading-none ${GBP_HEADING}`}>{card.title}</h3>
              {/* One block, centred, its lines left-aligned: the ticks form a column. */}
              <ul className="self-center text-left text-base font-normal leading-normal text-black dark:text-neutral-200">
                {card.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-[5px]">
                    <Check aria-hidden className="h-4 w-4 shrink-0" strokeWidth={3} />
                    {feature}
                  </li>
                ))}
              </ul>
              {/* Pinned to the card's bottom (mt-auto), so the three buttons line up
                  whatever each card's title and list need. WordPress doesn't do this. */}
              <div className="mt-auto flex justify-center">
                <GbpCallButton
                  phone={phone}
                  telHref={telHref}
                  className="rounded-none! px-[30px]! py-[15px]! text-base leading-[30px]! md:text-xl"
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
