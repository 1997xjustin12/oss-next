import Image from 'next/image'
import { PillLink } from '@/components/shared/PillLink'
import { LocationRichText } from './LocationRichText'
import type { LocationBlockText, LocationImage } from '@/types/locationPage'

type Props = {
  id: string
  text: LocationBlockText
  image: LocationImage
  href: string
  imageSide: 'left' | 'right'
}

/** The Purchase, Rental and Rent-To-Own blocks: heading, paragraph and button beside a photo. */
export function LocationBlock({ id, text, image, href, imageSide }: Props) {
  return (
    <section aria-labelledby={id} className="bg-white px-[5%] py-10 sm:py-12 dark:bg-neutral-950">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="(max-width: 1024px) 90vw, 45vw"
          className={`h-auto w-full rounded-xl shadow-md ${imageSide === 'right' ? 'lg:order-2' : ''}`}
        />
        <div>
          <h2 id={id} className="text-2xl font-semibold leading-tight text-theme-primary sm:text-3xl dark:text-red-400">
            {text.heading}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-theme-mid sm:text-lg dark:text-neutral-300">
            <LocationRichText text={text.body} />
          </p>
          <PillLink href={href} className="mt-6">
            {text.cta}
          </PillLink>
        </div>
      </div>
    </section>
  )
}
