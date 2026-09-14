import Image from "next/image";
import { PlpLink } from "@/components/shared/PlpLink";
import { BASE_URL } from "@/lib/helpers";
import { HOME_HEADING_DEFAULTS } from "@/config/homeContent";
import { FEATURED_CONTAINERS, featuredListingHref, type FeaturedContainer } from "@/config/featuredContainers";
import { StartingPriceLabel } from "./StartingPriceLabel";

function Card({ item }: { item: FeaturedContainer }) {
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
          {/* min-h holds the line while the price loads, or when there is none. */}
          <div className="min-h-7 text-lg sm:text-[18px] font-bold dark:text-white">
            <StartingPriceLabel cardKey={item.key} />
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

// Headings default to their shipped copy, so this still renders standalone;
// (home)/page.tsx passes the admin-authored text in. See config/homeContent.ts.
export function RightContainer({
  heading = HOME_HEADING_DEFAULTS['rightContainer.h2'],
}: {
  heading?: string;
}) {
  return (
    <section className="p-5 sm:p-10 dark:bg-gray-950">
      <div className="max-w-[1280px] mx-auto flex flex-col gap-[10px] items-center">
        <h2 className="font-extrabold text-3xl sm:text-[40px] lg:text-[46px] leading-tight text-center dark:text-white">
          {heading}
        </h2>
        <p className="font-light text-lg sm:text-[20px] leading-relaxed text-center text-gray-700 dark:text-gray-300">
          From Compact 20ft Units To Oversized High Cubes And
          Temperature-Controlled Reefers — We Stock Every Size And
          Configuration.
        </p>
        <div className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-4 -mx-5 px-5 pb-2 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-8 sm:mx-0 sm:px-0 sm:pb-0 sm:overflow-visible sm:snap-none py-8 sm:py-10 w-full">
          {FEATURED_CONTAINERS.map((item) => (
            <div
              key={item.key}
              className="w-[75%] shrink-0 snap-start sm:w-auto sm:shrink"
            >
              <Card item={item} />
            </div>
          ))}
        </div>
        <div className="mt-[30px]">
          <PlpLink
            prefetch={false}
            href={`${BASE_URL}/sale-shipping-containers/?ptype=buy`}
            className="font-semibold text-lg sm:text-[20px] py-2 px-8 border transition-colors bg-theme-primary text-white border-theme-primary hover:bg-[#a00f24] sm:bg-transparent sm:text-inherit sm:border-stone-700 sm:hover:bg-stone-100 sm:dark:border-gray-400 sm:dark:text-white sm:dark:hover:bg-gray-800"
          >
            View All Containers &amp; Pricing
          </PlpLink>
        </div>
      </div>
    </section>
  );
}
