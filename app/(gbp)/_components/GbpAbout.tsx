import Image from 'next/image'
import { GBP_ABOUT } from '@/lib/data/gbpShared'
import { GbpCallButton } from './GbpCallButton'
import { GBP_ACCENT, GBP_CONTAINER } from './gbpStyles'

type Props = { paragraphs: readonly string[]; phone: string; telHref: string }

/** "About Us" (`#about`): the page's local copy beside the store photo. */
export function GbpAbout({ paragraphs, phone, telHref }: Props) {
  return (
    <section id="about" aria-labelledby="gbp-about" className="scroll-mt-4 bg-white py-10 sm:py-14 dark:bg-neutral-950">
      <div className={`${GBP_CONTAINER} grid items-center gap-8 md:grid-cols-[3fr_2fr]`}>
        <div className="text-center md:text-left">
          <h2 id="gbp-about" className="text-2xl font-bold leading-[1.1] text-black md:text-[30px] dark:text-white">
            <span className={GBP_ACCENT}>About</span> Us
          </h2>
          <div className="mt-6 space-y-3 text-base font-normal leading-normal text-black md:text-lg dark:text-neutral-200">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <GbpCallButton phone={phone} telHref={telHref} label={GBP_ABOUT.cta} className="mt-6 text-xl" />
        </div>
        <Image
          src={GBP_ABOUT.image.src}
          alt={GBP_ABOUT.image.alt}
          width={GBP_ABOUT.image.width}
          height={GBP_ABOUT.image.height}
          sizes="(max-width: 768px) 92vw, 540px"
          className="h-auto w-full rounded-sm shadow-[0_2px_10px_rgba(0,0,0,0.25)]"
        />
      </div>
    </section>
  )
}
