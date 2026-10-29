import Image from 'next/image'
import { GbpCallButton } from './GbpCallButton'
import { GBP_ACCENT, GBP_BG_WHITE, GBP_CONTAINER, GBP_HEADING, sectionPadding, sectionVars } from './gbpStyles'
import type { GbpSectionStyle, GbpSharedContent } from '@/types/gbp'

type Props = {
  paragraphs: readonly string[]
  phone: string
  telHref: string
  content: GbpSharedContent['about']
  style?: GbpSectionStyle
}

/** "About Us" (`#about`): the page's local copy beside the store photo. */
export function GbpAbout({ paragraphs, phone, telHref, content, style }: Props) {
  return (
    <section
      id="about"
      aria-labelledby="gbp-about"
      className={`scroll-mt-4 ${GBP_BG_WHITE} ${sectionPadding(style, 'py-10 sm:py-14')}`}
      style={sectionVars(style)}
    >
      <div className={`${GBP_CONTAINER} grid items-center gap-8 md:grid-cols-[3fr_2fr]`}>
        <div className="text-center md:text-left">
          <h2 id="gbp-about" className={`text-2xl font-bold leading-[1.1] md:text-[30px] ${GBP_HEADING}`}>
            <span className={GBP_ACCENT}>About</span> Us
          </h2>
          <div className="mt-6 space-y-3 text-base font-normal leading-normal text-black md:text-lg dark:text-neutral-200">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <GbpCallButton phone={phone} telHref={telHref} label={content.cta} className="mt-6 text-xl" />
        </div>
        <Image
          src={content.image.src}
          alt={content.image.alt}
          width={content.image.width}
          height={content.image.height}
          sizes="(max-width: 768px) 92vw, 540px"
          className="h-auto w-full rounded-sm shadow-[0_2px_10px_rgba(0,0,0,0.25)]"
        />
      </div>
    </section>
  )
}
