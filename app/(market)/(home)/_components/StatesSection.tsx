import { HoverPrefetchLink as Link } from "@/components/shared/HoverPrefetchLink";
import { HOME_HEADING_DEFAULTS } from "@/config/homeContent";
import { ROUTES } from "@/config/routes";
import { SERVICE_LOCATION_LABEL, SERVICE_LOCATIONS } from "@/config/serviceLocations";

/**
 * The states the 2026-11-18 design names, in its order. `hub` picks the
 * location page a state's chip opens where it has several (the list is
 * alphabetical, so the first would be Bakersfield for California); without
 * one, the state's first location. A state with no location of its own
 * (Pennsylvania, Wisconsin today) opens the where-to-buy page, as "+ All 50
 * States" does.
 */
const STATES: readonly { name: string; code: string; hub?: string }[] = [
  { name: "California", code: "CA", hub: "Los Angeles / Long Beach, CA" },
  { name: "Texas", code: "TX", hub: "Dallas, TX" },
  { name: "Florida", code: "FL", hub: "Miami, FL" },
  { name: "New York", code: "NY" },
  { name: "Illinois", code: "IL" },
  { name: "Pennsylvania", code: "PA" },
  { name: "Ohio", code: "OH", hub: "Columbus, OH" },
  { name: "Georgia", code: "GA" },
  { name: "North Carolina", code: "NC", hub: "Charlotte, NC" },
  { name: "Michigan", code: "MI" },
  { name: "Arizona", code: "AZ" },
  { name: "Washington", code: "WA", hub: "Seattle, WA" },
  { name: "Colorado", code: "CO" },
  { name: "Nevada", code: "NV" },
  { name: "Oregon", code: "OR" },
  { name: "Utah", code: "UT" },
  { name: "Tennessee", code: "TN", hub: "Nashville, TN" },
  { name: "Missouri", code: "MO" },
  { name: "Virginia", code: "VA" },
  { name: "Massachusetts", code: "MA" },
  { name: "Minnesota", code: "MN" },
  { name: "Wisconsin", code: "WI" },
  { name: "Maryland", code: "MD" },
];

/** A US location in this state: its name ends in (or contains) ", XX". */
function inState(name: string, code: string) {
  return new RegExp(`, ${code}\\b`).test(name);
}

const STATE_LINKS = STATES.map(({ name, code, hub }) => {
  const us = SERVICE_LOCATIONS.filter((l) => l.country === "US");
  const location =
    (hub && us.find((l) => l.name === hub)) || us.find((l) => inState(l.name, code));
  return { name, url: location?.url ?? ROUTES.WHERE_TO_BUY };
});

/** The count comes from the location list, so the line never claims more than it lists. */
const SUBTEXT = `With ${SERVICE_LOCATION_LABEL} depots nationwide, we deliver to residences, construction sites, farms, and businesses everywhere.`;

const CHIP =
  "flex min-h-10 w-full items-center justify-center rounded-[3px] border border-white/15 bg-white/[.05] px-3 py-2 text-center text-[13px] font-medium text-white/80 transition-colors duration-150 hover:border-theme-primary hover:bg-theme-primary hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:min-h-9 sm:w-auto sm:px-3.5 sm:py-1.5 dark:border-white/12 dark:bg-white/[.04]";

/**
 * "Delivering Across All 50 States" (the 2026-11-18 design): a dark band in
 * both colour schemes, with the states as chips, wrapping and centred from
 * `sm`, two equal columns on a phone. Each opens that state's location page;
 * "+ All 50 States" the where-to-buy page with every depot. Also shown on the
 * product page.
 */
export function StatesSection({
  heading = HOME_HEADING_DEFAULTS["states.h2"],
}: {
  heading?: string;
}) {
  return (
    <section
      className="bg-[#1c1c1c] px-[5%] py-12 text-center sm:py-14 dark:bg-neutral-950"
      aria-labelledby="states-title"
    >
      <p className="mb-2 text-[11.5px] font-bold tracking-[.12em] text-red-500 uppercase dark:text-red-400">
        Coverage
      </p>
      <h2
        id="states-title"
        className="text-[30px] leading-[1.08] font-black tracking-[-0.02em] text-balance text-white sm:text-[40px]"
      >
        {heading}
      </h2>
      <p className="mx-auto mt-3 mb-7 max-w-[34rem] text-[15px] leading-[1.6] text-white/55">
        {SUBTEXT}
      </p>
      <ul
        className="mx-auto grid max-w-md grid-cols-2 gap-2 sm:flex sm:max-w-6xl sm:flex-wrap sm:justify-center"
        aria-label="States we deliver to"
      >
        {STATE_LINKS.map(({ name, url }) => (
          <li key={name} className="flex">
            <Link href={url} className={CHIP}>
              {name}
            </Link>
          </li>
        ))}
        <li className="flex">
          <Link href={ROUTES.WHERE_TO_BUY} className={CHIP}>
            + All 50 States
          </Link>
        </li>
      </ul>
    </section>
  );
}
