import Image from 'next/image'
import { RENTAL_INTRO } from '@/lib/data/rentalContent'

/** "Rent Temporary Storage - We make it easy.": the intro, its five points and the photo. */
export function RentalIntro() {
  const { heading, body, points, image } = RENTAL_INTRO

  return (
    <section aria-labelledby="rental-intro" className="bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
      <div className="grid items-center gap-8 lg:grid-cols-[3fr_2fr] lg:gap-12">
        <div>
          <h2 id="rental-intro" className="font-anton text-3xl leading-tight tracking-wide text-theme-primary sm:text-4xl dark:text-red-400">
            {heading}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-theme-mid sm:text-lg dark:text-neutral-300">{body}</p>
          <ul className="mt-5 list-disc space-y-1.5 pl-5 text-base text-theme-dark sm:text-lg dark:text-neutral-200">
            {points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="(max-width: 1024px) 90vw, 35vw"
          className="mx-auto h-auto w-full max-w-md rounded-lg"
        />
      </div>
    </section>
  )
}
