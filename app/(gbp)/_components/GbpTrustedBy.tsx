import Image from 'next/image'
import { AccentText } from '@/components/shared/AccentText'
import { GBP_TRUSTED_LOGOS } from '@/lib/data/gbpShared'
import { GBP_ACCENT, GBP_H2 } from './gbpStyles'

/**
 * "Trusted By Organizations Like": the client logos, scrolling. Hidden on
 * phones, as on WordPress.
 *
 * The strip is the list twice, so the loop has no seam; the copy is hidden
 * from screen readers. Pauses on hover, and stands still for visitors who ask
 * for reduced motion.
 */
export function GbpTrustedBy({ heading }: { heading: string }) {
  return (
    <section aria-label="Organizations that trust us" className="hidden bg-white py-10 md:block dark:bg-neutral-950">
      <h2 className={GBP_H2}>
        <AccentText text={heading} accentClassName={GBP_ACCENT} />
      </h2>
      <div className="mt-8 overflow-hidden">
        <div className="flex w-max animate-[gbp-marquee_30s_linear_infinite] hover:[animation-play-state:paused] motion-reduce:animate-none">
          {[0, 1].map((copy) => (
            <ul key={copy} aria-hidden={copy === 1 || undefined} className="flex shrink-0 items-center">
              {GBP_TRUSTED_LOGOS.map((logo) => (
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
