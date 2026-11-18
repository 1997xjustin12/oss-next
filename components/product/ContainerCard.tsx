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
 * One of the homepage's four container cards (RightContainer). White in both
 * colour schemes.
 *
 * Light mode is the 2026-11-18 design: a soft shadow on the section's light
 * grey, and a red border with a deeper shadow on hover. Dark mode keeps the
 * earlier look (the blue glow on the section's navy) and gains the same red
 * border on hover.
 *
 * The whole card is one link to the listing, filtered to this container; the
 * red "button" is part of it (a link cannot hold another link).
 */
export function ContainerCard({ item, image, price, pricePending }: Props) {
  const desc = item.home?.desc ?? item.desc
  const ctaLabel = item.home?.ctaLabel ?? item.ctaLabel

  return (
    <PlpLink
      prefetch={false}
      href={featuredListingHref(item.spec)}
      className="group flex h-full flex-col rounded-lg bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.12)] ring-2 ring-transparent transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(0,0,0,0.28)] hover:ring-theme-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-theme-primary sm:p-5 dark:shadow-[0_0_0_3px_rgba(147,197,253,0.35),0_10px_30px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_14px_34px_rgba(0,0,0,0.45)] dark:focus-visible:outline-amber-400"
    >
      <div className="relative aspect-7/6 overflow-hidden bg-white">
        <Image
          src={image}
          alt={item.type}
          fill
          sizes="(max-width: 640px) 75vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover"
        />
      </div>

      <div className="mt-4 text-xl leading-tight font-medium text-neutral-800 sm:text-2xl">{item.type}</div>
      <p className="mt-2 line-clamp-4 min-h-[3.75rem] text-justify text-[13px] leading-snug text-neutral-600">{desc}</p>

      {/*
        Price and button side by side when the card is wide enough (the design),
        stacked when it is not: the card measures itself (a container query), so
        this holds at every screen width and in the phone's scrolling row.
      */}
      <div className="@container mt-auto border-t border-neutral-300 pt-3">
      <div className="flex flex-col items-start gap-2 @[18.5rem]:flex-row @[18.5rem]:items-center @[18.5rem]:justify-between @[18.5rem]:gap-3">
        <div className="min-w-0">
          {/* min-h holds the line while the price loads, or when there is none. */}
          <div className="min-h-7 text-xl leading-tight font-medium whitespace-nowrap text-neutral-800 @[18.5rem]:text-2xl">
            {pricePending ? (
              <span aria-hidden className="inline-block h-6 w-36 animate-pulse rounded bg-stone-200" />
            ) : price !== null ? (
              <>Starts at {formatMoney(price).replace(/\.00$/, '')}</>
            ) : null}
          </div>
          <div className="mt-0.5 text-xs font-bold whitespace-nowrap text-green-700">Buy &middot; Rent &middot; Rent-To-Own</div>
        </div>
        <span className="w-full shrink-0 bg-theme-primary px-3 py-2 text-center text-[13px] font-medium whitespace-nowrap text-white transition-colors group-hover:bg-theme-primary-dark sm:text-sm @[18.5rem]:w-auto">
          {ctaLabel}
        </span>
      </div>
      </div>
    </PlpLink>
  )
}
