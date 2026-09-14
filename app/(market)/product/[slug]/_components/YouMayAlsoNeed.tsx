import Image from "next/image";
import { PlpLink } from "@/components/shared/PlpLink";
import { BASE_URL } from "@/lib/helpers";
import { formatMoney } from "@/lib/formatters";
import { lowestPrice } from "@/lib/pricing";
import { FEATURED_CONTAINERS, featuredListingHref, type FeaturedContainer } from "@/config/featuredContainers";
import type { ProductHit } from "@/types/product";
import { CardCarousel } from "./CardCarousel";

// The four featured containers, priced from this page's depot; each button
// opens the listing filtered to that container.

function Card({ item, price }: { item: FeaturedContainer; price: number | null }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square bg-stone-200 dark:bg-stone-700 overflow-hidden rounded-sm">
        <Image
          src={item.image}
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
          {/* No price when this depot has no such listing — min-h keeps the
              cards aligned either way. */}
          <div className="min-h-7 text-lg sm:text-[18px] font-bold dark:text-white">
            {price !== null && `Starts at ${formatMoney(price)}`}
          </div>
          <div className="text-xs text-[#04B761] font-bold">
            Buy &middot; Rent &middot; Rent-To-Own
          </div>
        </div>
        <PlpLink
          prefetch={false}
          href={featuredListingHref(item.spec)}
          className="shrink-0 bg-theme-primary text-center text-white py-2 px-4 text-xs sm:text-sm font-semibold whitespace-nowrap hover:bg-[#a00f24] transition-colors"
        >
          {item.ctaLabel}
        </PlpLink>
      </div>
    </div>
  );
}

/**
 * Adapted from (home)/_components/RightContainer.tsx for the product page.
 *
 * Priced from `relatedProducts` — every container at this page's depot — rather
 * than fetched: the page already holds them.
 *
 * The heading defaults to its own copy rather than the homepage's
 * `rightContainer.h2`. Sharing that key would mean editing homepage copy in the
 * Content Editor silently rewrote a section of every product page — and this is
 * a Client Component, so it cannot resolve admin copy itself. If this heading
 * should become editable, give it its own key and pass it down from
 * product/[slug]/page.tsx.
 */
export function YouMayAlsoNeed({
  heading = "You may also need:",
  relatedProducts,
}: {
  heading?: string;
  relatedProducts: ProductHit[];
}) {
  return (
    <div className="flex flex-col gap-[10px]">
      <h2 className="text-[16px] md:text-[24px] font-bold">{heading}</h2>
      <CardCarousel label="Containers you may also need">
        {FEATURED_CONTAINERS.map((item) => (
          <Card key={item.key} item={item} price={lowestPrice(relatedProducts, item.spec)} />
        ))}
      </CardCarousel>
      <div className="mt-[30px] text-center hidden md:block">
        <PlpLink
          prefetch={false}
          href={`${BASE_URL}/sale-shipping-containers/?ptype=buy`}
          className="font-semibold text-lg sm:text-[20px] py-2 px-8 border transition-colors bg-theme-primary text-white border-theme-primary hover:bg-[#a00f24] sm:bg-transparent sm:text-inherit sm:border-stone-700 sm:hover:bg-stone-100 sm:dark:border-gray-400 sm:dark:text-white sm:dark:hover:bg-gray-800"
        >
          View All Containers &amp; Pricing
        </PlpLink>
      </div>
    </div>
  );
}
