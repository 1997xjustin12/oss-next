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

/**
 * One of the homepage's four container cards. White in both colour schemes:
 * it sits on the section's navy (RightContainer), and the photos are cut-outs
 * on white, so the card and the photo read as one.
 */
export function ContainerCard({ item, image, price, pricePending }: Props) {
  return (
    <PlpLink
      prefetch={false}
      href={featuredListingHref(item.spec)}
      className="flex h-full flex-col gap-2 rounded-lg bg-white p-3 shadow-[0_0_0_3px_rgba(147,197,253,0.35),0_10px_30px_rgba(0,0,0,0.35)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_0_0_3px_rgba(147,197,253,0.7),0_14px_34px_rgba(0,0,0,0.45)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400 sm:p-4"
    >
      <div className="relative aspect-4/3 overflow-hidden rounded-md bg-white">
        <Image
          src={image}
          alt={item.type}
          fill
          sizes="(max-width: 640px) 75vw, (max-width: 1024px) 50vw, 25vw"
          className="object-contain"
        />
      </div>
      <div className="mt-1 text-lg font-bold leading-tight text-neutral-900 sm:text-xl">
        {item.type}
      </div>
      <div className="line-clamp-3 min-h-15 text-xs leading-snug text-neutral-600 sm:text-[13px]">
        {item.desc}
      </div>
      <div className="mt-auto">
        {/* min-h holds the line while the price loads, or when there is none. */}
        <div className="min-h-7 text-base font-bold text-neutral-900 sm:text-lg">
          {pricePending ? (
            <span aria-hidden className="inline-block h-5 w-36 animate-pulse rounded bg-stone-200" />
          ) : price !== null ? (
            <>Starts at {formatMoney(price)}</>
          ) : null}
        </div>
        <div className="text-xs font-bold text-green-700">
          Buy - Rent - Rent-To-Own
        </div>
      </div>
    </PlpLink>
  )
}
