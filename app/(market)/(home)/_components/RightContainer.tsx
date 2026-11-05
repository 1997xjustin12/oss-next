import { PlpLink } from "@/components/shared/PlpLink";
import { HOME_HEADING_DEFAULTS } from "@/config/homeContent";
import { ROUTES } from "@/config/routes";
import { FEATURED_CONTAINERS } from "@/config/featuredContainers";
import { toFeaturedCards } from "@/lib/featuredCards";
import { getNationalFeaturedContainers } from "@/services/search.service";
import { ContainerCardGrid } from "./ContainerCardGrid";

// Headings default to their shipped copy, so this still renders standalone;
// (home)/page.tsx passes the admin-authored text in. See config/homeContent.ts.
export async function RightContainer({
  heading = HOME_HEADING_DEFAULTS['rightContainer.h2'],
}: {
  heading?: string;
}) {
  // A failed search must not take the homepage down: the cards fall back to their
  // own photos, and the browser asks again.
  const defaults = await getNationalFeaturedContainers(
    FEATURED_CONTAINERS.map((item) => item.depotSpec),
  ).catch((err) => {
    console.error("[RightContainer] featured lookup failed:", err);
    return [];
  });

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
        <ContainerCardGrid defaults={toFeaturedCards(defaults)} />
        <div className="mt-[30px]">
          <PlpLink
            prefetch={false}
            href={`${ROUTES.PLP}?ptype=buy`}
            className="font-semibold text-lg sm:text-[20px] py-2 px-8 border transition-colors bg-theme-primary text-white border-theme-primary hover:bg-[#a00f24] sm:bg-transparent sm:text-inherit sm:border-stone-700 sm:hover:bg-stone-100 sm:dark:border-gray-400 sm:dark:text-white sm:dark:hover:bg-gray-800"
          >
            View All Containers &amp; Pricing
          </PlpLink>
        </div>
      </div>
    </section>
  );
}
