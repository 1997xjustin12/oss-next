import { PlpLink } from "@/components/shared/PlpLink";
import { HOME_HEADING_DEFAULTS } from "@/config/homeContent";
import { ROUTES } from "@/config/routes";
import { FEATURED_CONTAINERS } from "@/config/featuredContainers";
import { toFeaturedCards } from "@/lib/featuredCards";
import { getNationalFeaturedContainers } from "@/services/search.service";
import { ContainerCardGrid } from "@/components/product/ContainerCardGrid";

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

  // Navy in both colour schemes, with a faint dot pattern in the lower corners
  // (decoration only). The cards are white on it (ContainerCard).
  return (
    <section className="relative isolate overflow-hidden bg-[#0f1c2e] bg-[radial-gradient(ellipse_at_top,#1e3352_0%,#0f1c2e_65%)] px-[5%] py-12 sm:py-16">
      <div
        aria-hidden
        className="absolute bottom-0 left-0 -z-10 h-40 w-56 bg-[radial-gradient(rgba(255,255,255,0.14)_1.5px,transparent_1.5px)] bg-size-[14px_14px] mask-[linear-gradient(to_top_right,black_20%,transparent_75%)]"
      />
      <div
        aria-hidden
        className="absolute right-0 bottom-0 -z-10 hidden h-40 w-56 bg-[radial-gradient(rgba(255,255,255,0.14)_1.5px,transparent_1.5px)] bg-size-[14px_14px] mask-[linear-gradient(to_top_left,black_20%,transparent_75%)] sm:block"
      />
      <div className="max-w-[1280px] mx-auto flex flex-col gap-3 items-center">
        <h2 className="font-extrabold text-3xl sm:text-[40px] leading-tight text-center text-white">
          {heading}
        </h2>
        <p className="max-w-3xl text-base sm:text-lg leading-relaxed text-center text-white/85">
          From Compact 20ft Units To Oversized High Cubes And
          Temperature-Controlled Reefers — We Stock Every Size And
          Configuration.
        </p>
        <ContainerCardGrid defaults={toFeaturedCards(defaults)} />
        <div className="mt-2">
          <PlpLink
            prefetch={false}
            href={`${ROUTES.PLP}?ptype=buy`}
            className="inline-block rounded-md bg-linear-to-r from-amber-500 to-amber-300 px-7 py-2.5 text-base font-bold text-neutral-900 shadow-lg transition-[filter] hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300 sm:text-lg"
          >
            View All Containers &amp; Pricing
          </PlpLink>
        </div>
      </div>
    </section>
  );
}
