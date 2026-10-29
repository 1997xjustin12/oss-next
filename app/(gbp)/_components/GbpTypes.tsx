import Image from 'next/image'
import { AccentText } from '@/components/shared/AccentText'
import { GbpCallButton } from './GbpCallButton'
import { GBP_ACCENT, GBP_BG_WHITE, GBP_CONTAINER, GBP_H2, GBP_HEADING, sectionPadding, sectionVars } from './gbpStyles'
import type { GbpSectionStyle, GbpSharedContent } from '@/types/gbp'

type Props = { heading: string; phone: string; telHref: string; types: GbpSharedContent['containerTypes']; style?: GbpSectionStyle }

/**
 * "Types of Shipping Containers…" (`#types`): three rows, text beside an
 * image, alternating sides, a red bar on the text's outer edge.
 */
export function GbpTypes({ heading, phone, telHref, types, style }: Props) {
  return (
    <section
      id="types"
      aria-labelledby="gbp-types"
      className={`scroll-mt-4 ${GBP_BG_WHITE} ${sectionPadding(style, 'py-10 sm:py-12')}`}
      style={sectionVars(style)}
    >
      <div className={GBP_CONTAINER}>
        <h2 id="gbp-types" className={GBP_H2}>
          <AccentText text={heading} accentClassName={GBP_ACCENT} />
        </h2>
        <div className="mt-8 space-y-10">
          {types.map((type, i) => {
            const flipped = i % 2 === 1
            return (
              <article key={`${type.accent}-${i}`} className="grid items-center gap-6 md:grid-cols-2 md:gap-10">
                <div
                  className={`border-[var(--gbp-brand,#C60C29)] py-4 dark:border-red-500 ${
                    // Centred on phones, as WordPress; to the bar's side from tablets up.
                    flipped ? 'border-r-[6px] pr-5 text-center md:order-2 md:text-right' : 'border-l-[6px] pl-5 text-center md:text-left'
                  }`}
                >
                  <h3 className={`text-2xl font-bold leading-[1.1] md:text-[30px] ${GBP_HEADING}`}>
                    <span className={GBP_ACCENT}>{type.accent}</span> {type.rest}
                  </h3>
                  <p className="mt-5 text-lg font-normal leading-normal text-black dark:text-neutral-200">{type.body}</p>
                  <GbpCallButton phone={phone} telHref={telHref} className="mt-6 min-w-44 text-base md:text-xl" />
                </div>
                <Image
                  src={type.image.src}
                  alt={type.image.alt}
                  width={type.image.width}
                  height={type.image.height}
                  sizes="(max-width: 768px) 90vw, 560px"
                  className={`mx-auto h-auto w-full max-w-md ${flipped ? 'md:order-1' : ''}`}
                />
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
