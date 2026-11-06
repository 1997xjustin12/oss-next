import Image from 'next/image'
import { FOR_SALE_INTRO } from '@/lib/data/forSaleContent'

/** "Buy Shipping Containers At The Best Price": the BUY container and the intro. */
export function ForSaleIntro() {
  const { heading, body, image } = FOR_SALE_INTRO

  return (
    <section aria-labelledby="for-sale-intro" className="bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
      <div className="grid items-center gap-8 md:grid-cols-[2fr_3fr] lg:gap-12">
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="(max-width: 768px) 90vw, 35vw"
          className="mx-auto h-auto w-full max-w-md"
        />
        <div>
          <h2 id="for-sale-intro" className="font-anton text-3xl leading-tight tracking-wide text-theme-primary sm:text-4xl dark:text-red-400">
            {heading}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-theme-mid sm:text-lg dark:text-neutral-300">{body}</p>
        </div>
      </div>
    </section>
  )
}
