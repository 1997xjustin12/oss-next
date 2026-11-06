import Image from 'next/image'
import { WHY_INTRO } from '@/lib/data/whyOnsiteContent'
import { WhyRichText } from './WhyRichText'

/** Who we are, beside the container photo. */
export function WhyIntro() {
  const { paragraphs, image } = WHY_INTRO

  return (
    <section aria-label="About On-Site Storage Solutions" className="bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-14">
        <div className="min-w-0 space-y-4 text-base leading-relaxed text-theme-mid sm:text-lg dark:text-neutral-300">
          {paragraphs.map((parts, i) => (
            <p key={i}>
              <WhyRichText parts={parts} />
            </p>
          ))}
        </div>
        <div className="mx-auto w-full max-w-md overflow-hidden rounded-xl">
          <Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(max-width: 1024px) 90vw, 416px" className="h-auto w-full" />
        </div>
      </div>
    </section>
  )
}
