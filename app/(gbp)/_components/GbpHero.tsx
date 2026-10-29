import Image, { getImageProps } from 'next/image'
import { preload } from 'react-dom'
import { Check, Mail } from 'lucide-react'
import { AccentText } from '@/components/shared/AccentText'
import { GBP_ZOHO_FORMS } from '@/lib/data/gbpShared'
import { GbpCallButton } from './GbpCallButton'
import { GBP_ACCENT, GBP_BG_WHITE, GBP_BUTTON, GBP_CONTAINER, GBP_HEADING, sectionPadding, sectionVars } from './gbpStyles'
import type { GbpSectionStyle, GbpSharedContent } from '@/types/gbp'

type Props = {
  heading: string
  phone: string
  telHref: string
  content: GbpSharedContent['hero']
  style?: GbpSectionStyle
}

/** Tablets and up: where the photo shows. Phones get the copy on a plain background. */
const PHOTO_MEDIA = '(min-width: 768px)'

/** A 1×1 transparent GIF: what phones "load" instead of the photo (no request). */
const BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

/**
 * The hero: the h1, promises, the call and quote buttons, and the trust
 * badges, over the container-yard photo with its white curve.
 *
 * The photo is the LCP image from tablets up, so it is preloaded at high
 * priority, for those widths only. **Phones don't download it:** WordPress
 * shows it there under an 80% white wash, nearly invisible, yet it was the
 * slowest thing on the page (mobile LCP 4.5 s). Without it the phone's LCP is
 * the h1, painted at first paint. Art direction per the Next.js docs
 * (getImageProps + <picture>); the plain <img> is a blank GIF, so a phone
 * fetches nothing. In dark mode a gradient keeps the photo's white half from
 * putting light text on white.
 */
export function GbpHero({ heading, phone, telHref, content, style }: Props) {
  const {
    props: { srcSet, sizes, src: photoSrc, ...photo },
  } = getImageProps({ src: content.background, alt: '', fill: true, sizes: '100vw' })
  preload(photoSrc, { as: 'image', imageSrcSet: srcSet, imageSizes: sizes, fetchPriority: 'high', media: PHOTO_MEDIA })

  return (
    <section className={`relative isolate overflow-hidden ${GBP_BG_WHITE}`} style={sectionVars(style)}>
      <picture className="hidden md:block">
        <source media={PHOTO_MEDIA} srcSet={srcSet} sizes={sizes} />
        {/* eslint-disable-next-line jsx-a11y/alt-text -- alt="" comes from getImageProps: decorative */}
        <img {...photo} src={BLANK} loading="eager" fetchPriority="high" className="-z-20 object-cover object-[75%_center]" />
      </picture>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 hidden md:block
                   md:dark:bg-linear-to-r md:dark:from-neutral-950 md:dark:via-neutral-950/90 md:dark:to-transparent"
      />

      <div className={`${GBP_CONTAINER} ${sectionPadding(style, 'py-8 md:py-12 lg:py-14')} text-center md:text-left`}>
        <div className="md:max-w-[62%]">
          {/* WordPress: 44px / 1.2 bold, 18px on phones. 19px here: at 18px bold
              it is just under "large text", where the red accent (#FF0000, 4.0:1 on
              white) fails WCAG AA; from 18.67px bold it needs only 3:1. */}
          <h1 className={`text-[19px] font-bold leading-[1.2] md:text-[44px] ${GBP_HEADING}`}>
            <AccentText text={heading} accentClassName={GBP_ACCENT} />
          </h1>
          <p className="mt-2 text-sm font-semibold leading-snug text-black md:mt-4 md:text-xl md:leading-normal dark:text-neutral-100">
            {content.tagline}
          </p>

          <ul className="mx-auto mt-4 w-fit space-y-0.5 text-left text-xs font-semibold leading-normal text-black md:mx-0 md:mt-5 md:text-base dark:text-neutral-100">
            {content.bullets.map((bullet) => (
              <li key={bullet} className="flex items-center gap-2">
                <Check aria-hidden className="h-4 w-4 shrink-0 text-[var(--gbp-brand,#C60C29)] dark:text-red-400" strokeWidth={3} />
                {bullet}
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap justify-center gap-3 md:justify-start">
            <GbpCallButton phone={phone} telHref={telHref} icon className="min-w-36 text-xs md:min-w-48 md:text-xl" />
            <a
              href={`#${GBP_ZOHO_FORMS.quote.anchor}`}
              className={`inline-flex min-w-36 items-center justify-center gap-2 rounded-none px-6 py-3 text-xs font-semibold leading-none md:min-w-48 md:text-xl ${GBP_BUTTON}`}
            >
              <Mail aria-hidden className="h-4 w-4" />
              {content.quoteCtaLabel}
            </a>
          </div>

          <ul aria-label="Trust and verification badges" className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-3 md:justify-start">
            {content.badges.map((badge) => (
              <li key={badge.src}>
                <Image
                  src={badge.src}
                  alt={badge.alt}
                  width={badge.width}
                  height={badge.height}
                  // Rendered 52px tall at most, so as wide as that at its own ratio.
                  sizes={`${Math.ceil((52 * badge.width) / badge.height)}px`}
                  className="h-11 w-auto sm:h-13"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
