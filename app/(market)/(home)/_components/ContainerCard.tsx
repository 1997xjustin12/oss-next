import Image from 'next/image'
import { PlpLink } from '@/components/shared/PlpLink'
import { featuredListingHref, type FeaturedContainer } from '@/config/featuredContainers'
import { formatMoney } from '@/lib/formatters'

type Props = {
  item: FeaturedContainer
  image: string
  /** Null when the depot has no price for this container; the line stays empty. */
  price: number | null
  /** The visitor's depot is still being worked out, so no price can be shown yet. */
  pricePending: boolean
}

export function ContainerCard({ item, image, price, pricePending }: Props) {
  return (
    <PlpLink
      prefetch={false}
      href={featuredListingHref(item.spec)}
      className="flex h-full flex-col gap-3 rounded-md border border-stone-300 p-4 transition-colors hover:border-theme-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-theme-primary dark:border-gray-700"
    >
      {/* White in both schemes, and the whole photo in frame: most of these are
          cut-outs on white, so the box and the photo read as one. */}
      <div className="relative aspect-square overflow-hidden rounded-sm bg-white">
        <Image
          src={image}
          alt={item.type}
          fill
          sizes="(max-width: 640px) 75vw, (max-width: 1024px) 50vw, 25vw"
          className="object-contain"
        />
      </div>
      <div className="text-xl sm:text-[24px] font-semibold dark:text-white">
        {item.type}
      </div>
      <div className="text-xs sm:text-[12px] font-light line-clamp-3 min-h-[54px] text-gray-600 dark:text-gray-400">
        {item.desc}
      </div>
      <div className="mt-auto">
        {/* min-h holds the line while the price loads, or when there is none. */}
        <div className="min-h-7 text-lg sm:text-[18px] font-bold dark:text-white">
          {pricePending ? (
            <span aria-hidden className="inline-block h-5 w-36 animate-pulse rounded bg-stone-200 dark:bg-stone-700" />
          ) : price !== null ? (
            <>Starts at {formatMoney(price)}</>
          ) : null}
        </div>
        <div className="text-xs text-green-700 font-bold dark:text-green-400">
          Buy &middot; Rent &middot; Rent-To-Own
        </div>
      </div>
    </PlpLink>
  )
}
