import Image from 'next/image'
import { RTO_BANNER_BACKGROUND } from '@/lib/data/rentToOwnContent'
import { CornerRibbon } from './CornerRibbon'
import { RtoCallButton } from './RtoCallButton'

type Props = {
  heading: string
  cta: string
  /**
   * 'light': a pale wash over the photo, dark text (the $99 offer and "Ready
   * to lock in"). 'dark': a dark band, white text ("Own your own").
   */
  tone: 'light' | 'dark'
  ribbon?: string
  /** The cut-out picture on the left (truck, workers). Hidden on phones. */
  sideImage?: { src: string; alt: string }
}

/**
 * The page's three call-to-action banners, over the same container-yard photo.
 *
 * The wash over the photo is what makes the text readable, so it flips with
 * the colour scheme: in dark mode the light banners take a dark wash and light
 * text, like every other section here.
 */
export function RtoBanner({ heading, cta, tone, ribbon, sideImage }: Props) {
  const dark = tone === 'dark'

  return (
    // A banner with a ribbon starts lower on phones, so the heading clears it.
    <section className={`relative isolate overflow-hidden px-[5%] pb-12 sm:py-14 ${ribbon ? 'pt-24' : 'pt-12'}`}>
      <Image src={RTO_BANNER_BACKGROUND.src} alt="" fill sizes="100vw" className="-z-20 object-cover" />
      <div
        aria-hidden
        className={`absolute inset-0 -z-10 ${dark ? 'bg-black/60' : 'bg-white/80 dark:bg-neutral-950/80'}`}
      />

      {ribbon && <CornerRibbon text={ribbon} />}

      <div className={`flex flex-col items-center gap-6 ${sideImage ? 'lg:flex-row lg:items-center lg:gap-10' : ''}`}>
        {sideImage && (
          <div className="relative hidden aspect-[4/3] w-full max-w-sm shrink-0 lg:block">
            <Image src={sideImage.src} alt={sideImage.alt} fill sizes="384px" className="object-contain" />
          </div>
        )}
        <div className="flex flex-1 flex-col items-center gap-5 text-center">
          <h2
            className={`max-w-4xl text-2xl font-extrabold leading-tight sm:text-4xl ${
              dark ? 'text-white' : 'text-theme-dark dark:text-white'
            }`}
          >
            {heading}
          </h2>
          <RtoCallButton label={cta} />
        </div>
      </div>
    </section>
  )
}
