import { HoverPrefetchLink as Link } from "@/components/shared/HoverPrefetchLink";
import { PlpLink } from "@/components/shared/PlpLink";
import { ROUTES } from "@/config/routes";

type Props = {
  /**
   * `amber` keeps the "Find The Right Container" section's dark-mode button
   * (an amber gradient on its navy band); in light mode both are red.
   */
  darkTone?: "red" | "amber";
  /** As wide as its container (the version 3 hero's price panel) instead of at most 28rem, centred. */
  fill?: boolean;
  /** Where it goes: the listing (carrying the visitor's ZIP) unless a page sends it elsewhere (an /all-city/ page: its depot's page). */
  href?: string;
  label?: string;
  className?: string;
};

const BASE =
  "block w-full px-6 py-3.5 text-center text-lg font-bold text-white shadow-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 sm:text-xl";

const TONE = {
  red: "bg-theme-primary hover:bg-theme-primary-dark focus-visible:outline-theme-primary",
  amber:
    "bg-theme-primary hover:bg-theme-primary-dark focus-visible:outline-theme-primary dark:bg-linear-to-r dark:from-amber-500 dark:to-amber-300 dark:text-neutral-900 dark:hover:brightness-105 dark:focus-visible:outline-amber-300",
} as const;

/**
 * The homepage's "View All Containers & Pricing" button, shown under "Find The
 * Right Container", under "How It Works" and in the version 3 hero (and under
 * an /all-city/ page's "How It Works"). One component so they share one height
 * and type size at every width (they had drifted apart).
 */
export function ViewAllContainersLink({
  darkTone = "red",
  fill = false,
  href = `${ROUTES.PLP}?ptype=buy`,
  label = "View All Containers & Pricing",
  className = "",
}: Props) {
  const classes = `${BASE} ${TONE[darkTone]}`;
  return (
    <div className={`w-full ${fill ? "" : "mx-auto max-w-md"} ${className}`}>
      {href.startsWith(ROUTES.PLP) ? (
        <PlpLink prefetch={false} href={href} className={classes}>
          {label}
        </PlpLink>
      ) : (
        <Link href={href} className={classes}>
          {label}
        </Link>
      )}
    </div>
  );
}
