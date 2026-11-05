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
    // The whole card is the link, so what looks like a button inside it is a span:
    // a link can't hold another link.
    <PlpLink
      prefetch={false}
      href={featuredListingHref(item.spec)}
      className="group flex flex-col gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-theme-primary"
    >
      <div className="relative aspect-square bg-stone-200 dark:bg-stone-700 overflow-hidden rounded-sm">
        <Image
          src={image}
          alt={item.type}
          fill
          sizes="(max-width: 640px) 75vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover"
        />
      </div>
      <div className="text-xl sm:text-[24px] font-semibold dark:text-white">
        {item.type}
      </div>
      <div className="text-xs sm:text-[12px] font-light line-clamp-3 min-h-[54px] text-gray-600 dark:text-gray-400">
        {item.desc}
      </div>
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex-1 min-w-0">
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
        <span className="shrink-0 bg-theme-primary text-center text-white py-2 px-4 text-xs sm:text-sm font-semibold whitespace-nowrap group-hover:bg-[#a00f24] transition-colors">
          {item.ctaLabel}
        </span>
      </div>
    </PlpLink>
  )
}
