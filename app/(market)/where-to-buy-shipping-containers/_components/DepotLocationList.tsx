import { MapPin } from "lucide-react";
import { DEPOTS, depotPagePath } from "@/lib/locations";
import { fetchPageSitemap } from "@/services/sitemap.service";
import { HoverPrefetchLink as Link } from "@/components/shared/HoverPrefetchLink";

/** Shown before "See more locations"; the rest open below it. */
const VISIBLE = 24;

/** Location records use "38" for Canada; the list shows the US first, as the WordPress page did. */
const CANADA = "38";

const ITEM = "flex items-center gap-2 py-1 text-[15px] text-theme-dark dark:text-gray-200";
const LINK = `${ITEM} transition-colors hover:text-theme-primary dark:hover:text-red-400`;

/**
 * Every depot, linking to its page where it has one. Built from the depot
 * records rather than the WordPress page's hand-typed list, so it stays in step
 * with the network (and drops the typos the old list had). A depot whose page
 * is not live is listed without a link rather than linked to a 404.
 *
 * Hover turns the name and pin brand red, as the WordPress list did.
 */
export async function DepotLocationList() {
  const livePaths = new Set((await fetchPageSitemap()).map((p) => p.path.replace(/\/+$/, "").toLowerCase()));
  const depots = [...DEPOTS].sort(
    (a, b) => Number(a.location.country === CANADA) - Number(b.location.country === CANADA),
  );

  const items = depots.map((depot) => {
    const path = depotPagePath(depot);
    const live = path && livePaths.has(path.toLowerCase());
    const label = (
      <>
        <MapPin aria-hidden className="h-4 w-4 shrink-0 text-theme-primary dark:text-red-400" />
        <span>{depot.location.title}</span>
      </>
    );
    return (
      <li key={depot.path}>
        {live ? (
          <Link href={path} className={LINK}>
            {label}
          </Link>
        ) : (
          <span className={ITEM}>{label}</span>
        )}
      </li>
    );
  });

  const grid = "grid grid-cols-1 gap-x-6 sm:grid-cols-2 xl:grid-cols-3";

  return (
    <>
      <ul className={grid}>{items.slice(0, VISIBLE)}</ul>
      {items.length > VISIBLE && (
        <details className="group/more mt-2">
          <summary className="mt-4 inline-flex min-h-11 cursor-pointer list-none items-center rounded-md border border-theme-primary bg-theme-primary px-6 text-sm font-bold text-white transition-colors hover:bg-white hover:text-theme-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2 dark:hover:bg-neutral-950 dark:hover:text-red-400 [&::-webkit-details-marker]:hidden">
            <span className="group-open/more:hidden">See more locations</span>
            <span className="hidden group-open/more:inline">See fewer locations</span>
          </summary>
          <ul className={`${grid} mt-4`}>{items.slice(VISIBLE)}</ul>
        </details>
      )}
    </>
  );
}
