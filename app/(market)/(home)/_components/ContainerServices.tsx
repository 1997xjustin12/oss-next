import { HoverPrefetchLink as Link } from "@/components/shared/HoverPrefetchLink";
import { TemplateRichText } from "@/components/shared/TemplateRichText";
import { HOME_HEADING_DEFAULTS } from "@/config/homeContent";
import { ROUTES } from "@/config/routes";
import { CONTACT_NUMBER } from "@/lib/helpers";

/** Still a WordPress page (as in the Navbar and Footer), so not in config/routes.ts. */
const MODIFIED_GALLERY = "/shipping-container-modified-containers-gallery";

type ServiceIcon = "inspection" | "accessories" | "modifications" | "parts";

type Service = {
  icon: ServiceIcon;
  title: string;
  /** Template text (TemplateRichText): `[label](/path)` is a link. */
  desc: string;
};

// Words from the 2026-11-18 design.
const SERVICES: Service[] = [
  {
    icon: "inspection",
    title: "Container Survey Inspection",
    desc: "Buying a cargo-worthy container? Our network of IICL certified inspectors can provide an independent survey inspection before delivery.",
  },
  {
    icon: "accessories",
    title: "Container Accessories",
    desc: `Shop locks, ramps, and other shipping [container accessories](${ROUTES.ACCESSORY_PRODUCTS}) that keep your container secure and easy to use.`,
  },
  {
    icon: "modifications",
    title: "Shipping Container Modifications",
    desc: `We add roll-up doors, walk-in doors, windows, and vents to your container. See our [modified container gallery](${MODIFIED_GALLERY}).`,
  },
  {
    icon: "parts",
    title: "Shipping Container Parts",
    desc: "Keep your container in top shape with replacement parts and repair supplies.",
  },
];

const DESC_LINK =
  "font-semibold text-neutral-800 underline underline-offset-2 hover:text-theme-primary dark:text-white dark:hover:text-red-400";

/**
 * A gear's outline as an SVG path: `teeth` flat-topped teeth between `inner`
 * and `outer` radius, centred on (cx, cy). Rounded to 2 places so the server
 * and the browser print the same markup.
 */
function gearPath(cx: number, cy: number, outer: number, inner: number, teeth: number): string {
  const step = (Math.PI * 2) / teeth;
  const point = (r: number, a: number) =>
    `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
  const parts: string[] = [];
  for (let i = 0; i < teeth; i++) {
    const a = i * step - Math.PI / 2;
    parts.push(
      `${i === 0 ? "M" : "L"}${point(inner, a - step * 0.3)}`,
      `L${point(outer, a - step * 0.18)}`,
      `L${point(outer, a + step * 0.18)}`,
      `L${point(inner, a + step * 0.3)}`,
    );
  }
  return `${parts.join(" ")} Z`;
}

const GEAR_MODIFY = gearPath(28, 32, 22, 17, 8);
const GEAR_BIG = gearPath(24, 42, 17, 13, 9);
const GEAR_SMALL = gearPath(46, 20, 13, 10, 8);

/** The design's red line icons, one per service (decorative; the title names the service). */
function ServiceIconSvg({ icon }: { icon: ServiceIcon }) {
  // Shapes drawn over others are filled with the card's own colour, so the lines behind them break off.
  const cover = "fill-white dark:fill-neutral-900";
  return (
    <svg
      aria-hidden
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-12 w-12 shrink-0 text-theme-primary sm:h-20 sm:w-20 lg:h-24 lg:w-24 dark:text-red-400"
    >
      {icon === "inspection" && (
        <>
          <rect x="8" y="10" width="36" height="46" rx="2" />
          <path d="M19 8h14v6H19z" className={cover} />
          <path d="M23 8V6a3 3 0 0 1 6 0v2" />
          <path d="M14 24l2 2 4-4M14 35l2 2 4-4M14 46l2 2 4-4M24 24h9M24 35h4M24 46h6" />
          <circle cx="43" cy="36" r="10" className={cover} />
          <circle cx="43" cy="36" r="6.5" />
          <path d="M50.5 43.5l7 9" strokeWidth={4} />
        </>
      )}
      {icon === "accessories" && (
        <>
          <path d="M20 28V18a12 12 0 0 1 24 0v10" />
          <rect x="12" y="28" width="40" height="30" rx="3" />
          <circle cx="32" cy="40" r="4" />
          <path d="M30.5 43.5 29.5 50h5l-1-6.5" />
        </>
      )}
      {icon === "modifications" && (
        <>
          <path d={GEAR_MODIFY} />
          <circle cx="28" cy="32" r="9" />
          <path d="M28 27h26a3 3 0 0 1 0 10H28l-9-5z" className={cover} />
          <path d="M48 27v10M28 27v10" />
        </>
      )}
      {icon === "parts" && (
        <>
          <path d={GEAR_SMALL} />
          <circle cx="46" cy="20" r="5" />
          <path d={GEAR_BIG} className={cover} />
          <circle cx="24" cy="42" r="6.5" />
        </>
      )}
    </svg>
  );
}

/**
 * "Shipping Container Services" (the 2026-11-18 design), after "Trusted By":
 * four white cards on navy, icon beside the text, two by two from `lg` and one
 * column on a phone, then the call button. The cards lift with a red ring on
 * hover, as the other homepage cards. Dark mode: a near-black navy band and
 * dark cards.
 */
export function ContainerServices({
  heading = HOME_HEADING_DEFAULTS["services.h2"],
}: {
  heading?: string;
}) {
  return (
    <section
      aria-labelledby="services-title"
      className="bg-[#0f3a59] px-[5%] py-10 sm:py-14 lg:py-16 dark:bg-[#0b1625]"
    >
      <h2
        id="services-title"
        className="text-center text-xl font-bold text-white sm:text-3xl"
      >
        {heading}
      </h2>

      {/* Narrower than the gutter on wide screens, as the design: two cards with a wide channel between. */}
      <ul className="mx-auto mt-6 grid max-w-6xl grid-cols-1 gap-5 sm:mt-10 sm:gap-6 lg:grid-cols-2 lg:gap-x-16 lg:gap-y-12 xl:gap-x-24 xl:gap-y-14">
        {SERVICES.map((service) => (
          <li
            key={service.icon}
            className="flex items-center gap-4 bg-white px-4 py-5 shadow-[0_2px_10px_rgba(0,0,0,0.18)] ring-2 ring-transparent transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(0,0,0,0.35)] hover:ring-theme-primary motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:gap-6 sm:px-8 sm:py-8 lg:min-h-45 lg:gap-8 lg:px-10 dark:bg-neutral-900 dark:ring-white/10 dark:hover:ring-theme-primary"
          >
            <ServiceIconSvg icon={service.icon} />
            <div className="min-w-0">
              <h3 className="text-[15px] leading-tight font-semibold text-neutral-800 sm:text-xl dark:text-white">
                {service.title}
              </h3>
              <p className="mt-1 text-[13px] leading-snug text-neutral-700 sm:text-base dark:text-neutral-300">
                <TemplateRichText text={service.desc} linkClassName={DESC_LINK} />
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mx-auto mt-8 w-full max-w-sm sm:mt-10">
        <Link
          prefetch={false}
          href={`tel:${CONTACT_NUMBER}`}
          className="block bg-theme-primary px-5 py-3.5 text-center text-[15px] font-semibold text-white shadow-md transition-colors hover:bg-theme-primary-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:text-lg"
        >
          Call For Expert Assistance
        </Link>
      </div>
    </section>
  );
}
