import Image from 'next/image'
import { AccentText } from '@/components/shared/AccentText'
import { GBP_ACCENT, GBP_BG_WHITE, GBP_H2, sectionPadding, sectionVars } from './gbpStyles'
import type { GbpSectionStyle, GbpSharedContent } from '@/types/gbp'

type Props = { heading: string; logos: GbpSharedContent['trustedLogos']; style?: GbpSectionStyle }

/**
 * "Trusted By Organizations Like": the client logos, scrolling. Hidden on
 * phones, as on WordPress.
 *
 * The strip is the list twice, so the loop has no seam; the copy is hidden
 * from screen readers. Pauses on hover, and stands still for visitors who ask
 * for reduced motion.
 */
export function GbpTrustedBy({ heading, logos, style }: Props) {
  if (logos.length === 0) return null
  return (
    <section
      aria-label="Organizations that trust us"
      className={`hidden md:block ${GBP_BG_WHITE} ${sectionPadding(style, 'py-10')}`}
      style={sectionVars(style)}
    >
      {/* Here rather than in globals.css, so the page carries its own styling. */}
      <style>{'@keyframes gbp-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}'}</style>
      <h2 className={GBP_H2}>
        <AccentText text={heading} accentClassName={GBP_ACCENT} />
      </h2>
      <div className="mt-8 overflow-hidden">
        <div className="flex w-max animate-[gbp-marquee_30s_linear_infinite] hover:[animation-play-state:paused] motion-reduce:animate-none">
          {[0, 1].map((copy) => (
            <ul key={copy} aria-hidden={copy === 1 || undefined} className="flex shrink-0 items-center">
              {logos.map((logo) => (
                <li key={logo.src} className="mx-6 flex h-24 w-36 items-center justify-center">
                  <Image
                    src={logo.src}
                    alt={copy === 1 ? '' : logo.alt}
                    width={150}
                    height={150}
                    sizes="144px"
                    className="max-h-24 w-auto object-contain dark:rounded-md dark:bg-white dark:p-1.5"
                  />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  )
}
