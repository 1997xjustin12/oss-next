import Image from 'next/image'
import { YouTubeEmbed } from '@/components/product/YouTubeEmbed'
import { REEFER_NON_WORKING, REEFER_VIDEO } from '@/lib/data/reeferContent'

/**
 * The video, then the non-working reefer on WordPress's blue. The video is a
 * poster until played, so it costs no YouTube script on load.
 */
export function ReeferNonWorking() {
  const { heading, question, body, image } = REEFER_NON_WORKING

  return (
    <>
      <section aria-label="Video" className="bg-white px-[5%] pb-12 sm:pb-16 dark:bg-neutral-950">
        <div className="mx-auto max-w-4xl">
          <YouTubeEmbed video={REEFER_VIDEO} />
        </div>
      </section>

      <section aria-labelledby="reefer-non-working" className="bg-[#0F3A59] px-[5%] py-12 text-white sm:py-16">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-12">
          <div className="mx-auto w-full max-w-sm overflow-hidden rounded-xl bg-white">
            <Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(max-width: 1024px) 90vw, 352px" className="h-auto w-full" />
          </div>
          <div className="min-w-0">
            <h2 id="reefer-non-working" className="text-2xl font-extrabold uppercase leading-tight sm:text-3xl">{heading}</h2>
            <h3 className="mt-5 text-lg font-bold text-[#F4BF3C]">{question}</h3>
            <p className="mt-2 text-base leading-relaxed text-white/90 sm:text-lg">{body}</p>
          </div>
        </div>
      </section>
    </>
  )
}
