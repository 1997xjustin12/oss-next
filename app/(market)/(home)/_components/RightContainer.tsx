import { HOME_HEADING_DEFAULTS } from "@/config/homeContent";
import { FEATURED_CONTAINERS } from "@/config/featuredContainers";
import { toFeaturedCards } from "@/lib/featuredCards";
import { getNationalFeaturedContainers } from "@/services/search.service";
import { ContainerCardGrid } from "@/components/product/ContainerCardGrid";
import { ViewAllContainersLink } from "./ViewAllContainersLink";

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

  // Light mode (the 2026-11-18 design): light grey, a red heading, a red
  // full-width button. Dark mode keeps the earlier navy with a faint dot
  // pattern in the lower corners (decoration only) and the amber button. The
  // cards are white in both (ContainerCard).
  return (
    <section className="relative isolate overflow-hidden bg-neutral-100 px-[5%] py-12 sm:py-16 dark:bg-[#0f1c2e] dark:bg-[radial-gradient(ellipse_at_top,#1e3352_0%,#0f1c2e_65%)]">
      <div
        aria-hidden
        className="absolute bottom-0 left-0 -z-10 hidden h-40 w-56 bg-[radial-gradient(rgba(255,255,255,0.14)_1.5px,transparent_1.5px)] bg-size-[14px_14px] mask-[linear-gradient(to_top_right,black_20%,transparent_75%)] dark:block"
      />
      <div
        aria-hidden
        className="absolute right-0 bottom-0 -z-10 hidden h-40 w-56 bg-[radial-gradient(rgba(255,255,255,0.14)_1.5px,transparent_1.5px)] bg-size-[14px_14px] mask-[linear-gradient(to_top_left,black_20%,transparent_75%)] sm:dark:block"
      />
      {/* 1480px wide at most, as the design: four cards wide enough for the price beside its button. */}
      <div className="max-w-370 mx-auto flex flex-col gap-3 items-center">
        <h2 className="font-extrabold text-3xl sm:text-[40px] leading-tight text-center text-theme-primary dark:text-white">
          {heading}
        </h2>
        <p className="max-w-6xl text-base sm:text-xl xl:max-w-none xl:text-[21px] leading-relaxed text-center text-neutral-700 dark:text-white/85">
          From Compact 20ft Units To Oversized High Cubes And
          Temperature-Controlled Reefers — We Stock Every Size And
          Configuration.
        </p>
        <ContainerCardGrid defaults={toFeaturedCards(defaults)} />
        <ViewAllContainersLink darkTone="amber" className="mt-2" />
      </div>
    </section>
  );
}
