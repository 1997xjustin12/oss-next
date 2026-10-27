import { HoverPrefetchLink as Link } from "@/components/shared/HoverPrefetchLink";
import { HOME_HEADING_DEFAULTS } from "@/config/homeContent";
import { CA_LOCATION_COUNT, SERVICE_LOCATIONS, US_LOCATION_COUNT } from "@/config/serviceLocations";

/**
 * Where we deliver from, with counts that drive the copy below, so the text
 * cannot claim a number the list does not show. Edit config/serviceLocations.ts.
 */
const SUBTEXT = `With ${US_LOCATION_COUNT} locations in the United States and ${CA_LOCATION_COUNT} in Canada, we deliver to residences, construction sites, farms, and businesses everywhere.`;

export function StatesSection({
  heading = HOME_HEADING_DEFAULTS["states.h2"],
}: {
  heading?: string;
}) {
  return (
    <section
      className="bg-theme-dark py-[52px] px-[5%] text-center"
      aria-labelledby="states-title"
    >
      <div className="max-w-[1280px] mx-auto">
        <p className="text-[11.5px] font-bold text-red-400 uppercase tracking-[.1em] mb-2">
          Coverage
        </p>
        <h2
          id="states-title"
          className="text-[32px] sm:text-[38px] font-black text-white leading-[1.05] mb-2 tracking-[-0.02em]"
        >
          {heading}
        </h2>
        <p className="text-[15px] text-white/50 leading-[1.65] max-w-[580px] mx-auto mb-[26px]">
          {SUBTEXT}
        </p>
        {/* Each chip links to that location's page. The chips always looked
            clickable (hover colour, pointer) but used to be plain text. */}
        <ul className="flex flex-wrap gap-2 justify-center" aria-label="Service locations">
          {SERVICE_LOCATIONS.map(({ name, url }) => (
            <li key={name} className="flex">
              <Link
                href={url}
                className="inline-flex min-h-8 items-center bg-white/[.06] border border-white/[.13] text-white/70 px-[13px] py-[6px] rounded-[3px] text-[12.5px] font-medium transition-[background,color,border-color] duration-150 hover:bg-theme-primary hover:border-theme-primary hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
