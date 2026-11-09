import Image from 'next/image'
import { SnapCarousel } from '@/components/shared/SnapCarousel'
import type { LocationImage } from '@/types/locationPage'

type Props = {
  heading: string
  photos: readonly LocationImage[]
}

/**
 * "Shipping Containers Delivered": the delivery photos on the red band, in a
 * row that swipes (arrows from `sm` up). Each photo's caption is part of the
 * image, so its alt text names the place. Off-screen photos load lazily.
 */
export function LocationDelivered({ heading, photos }: Props) {
  if (photos.length === 0) return null

  return (
    <section aria-labelledby="location-delivered" className="bg-theme-primary px-[5%] py-10 sm:py-12">
      <h2 id="location-delivered" className="text-center text-3xl font-semibold text-white sm:text-4xl">
        {heading}
      </h2>
      <SnapCarousel label={heading} itemName="photos" className="mt-8">
        {photos.map((photo) => (
          <li key={photo.src} className="w-[80%] shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)] xl:w-[calc((100%-3.75rem)/4)]">
            <Image
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              sizes="(max-width: 640px) 80vw, (max-width: 1024px) 45vw, (max-width: 1280px) 30vw, 22vw"
              className="aspect-square h-auto w-full rounded-lg bg-white object-cover"
            />
          </li>
        ))}
      </SnapCarousel>
    </section>
  )
}
