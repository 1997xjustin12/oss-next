import Image from "next/image";
import { HoverPrefetchLink as Link } from "@/components/shared/HoverPrefetchLink";
import { HOME_HEADING_DEFAULTS } from "@/config/homeContent";
import { CONTACT_NUMBER } from "@/lib/helpers";

const GREGG_IMAGE = "/images/gregg.webp";

type ListItemData = { title: string; desc: string };

// Words from the 2026-11-18 design. The titles are admin-editable
// (config/homeContent.ts `onsiteDifference.item1`–`item4`); the descriptions are not.
const LIST: ListItemData[] = [
  {
    title: "No Hidden Fees",
    desc: "Your quoted price is final from first inquiry to invoice.",
  },
  {
    title: "60+ Locations In The U.S. And Canada",
    desc: "A local depot near you keeps mileage and delivery costs down.",
  },
  {
    title: "75+ Years Of Combined Industry Experience",
    desc: "Senior staff with deep shipping container expertise answer every call.",
  },
  {
    title: "Buy, Rent, Or Rent-To-Own",
    desc: "Pick the option that fits your budget and timeline. Ask about our price match.",
  },
];

/**
 * One point: a white card with a soft shadow, lifting with a red ring on
 * hover (the same effect as the "Find The Right Container" cards).
 */
function ListItem({ item, title }: { item: ListItemData; title?: string }) {
  return (
    <li className="flex flex-col justify-center bg-white lg:justify-start px-3 py-4 shadow-[0_2px_10px_rgba(0,0,0,0.12)] ring-2 ring-transparent transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(0,0,0,0.22)] hover:ring-theme-primary motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:min-h-35 sm:px-5 sm:py-6 lg:px-6 dark:bg-neutral-900 dark:shadow-[0_2px_12px_rgba(0,0,0,0.5)] dark:ring-white/10 dark:hover:shadow-[0_12px_30px_rgba(0,0,0,0.6)] dark:hover:ring-theme-primary">
      <h3 className="text-[14px] leading-tight font-semibold text-neutral-800 sm:text-lg lg:text-xl dark:text-white">
        {title ?? item.title}
      </h3>
      <p className="mt-1 text-[12.5px] leading-snug text-neutral-600 sm:text-[15px] lg:text-base dark:text-neutral-300">
        {item.desc}
      </p>
    </li>
  );
}

/**
 * "The On-Site Storage Difference" (the 2026-11-18 design): four point cards
 * and the call button beside the photo on desktop. On a phone everything is
 * centred: the heading, the cards two by two, the photo, then the button full
 * width. One grid for both; the photo sits between the cards and the button in
 * the markup, and moves to its own column from `lg`.
 *
 * `itemTitles` is indexed to LIST; an index with no entry keeps the item's own
 * title, so a registry that drifts out of sync degrades to shipped copy.
 */
export function OnsiteDifference({
  heading = HOME_HEADING_DEFAULTS["onsiteDifference.h2"],
  itemTitles,
}: {
  heading?: string;
  itemTitles?: readonly (string | undefined)[];
}) {
  return (
    <section
      aria-labelledby="osd-title"
      className="bg-neutral-100 px-[5%] py-10 sm:py-14 lg:py-16 dark:bg-neutral-950"
    >
      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,46%)] lg:gap-x-12 xl:gap-x-16">
        <div className="text-center lg:col-start-1 lg:row-start-1 lg:text-left">
          <h2
            id="osd-title"
            className="text-xl font-bold text-theme-primary sm:text-3xl lg:text-[32px] lg:leading-tight dark:text-red-400"
          >
            {heading}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-snug text-neutral-700 sm:text-lg lg:mx-0 lg:mt-2 dark:text-neutral-300">
            Since 2002, we have helped thousands of businesses, farms, and
            homeowners find the right shipping container at the right price.
          </p>
        </div>

        <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:col-start-1 lg:row-start-2 lg:mt-4 lg:gap-6">
          {LIST.map((item, index) => (
            <ListItem key={item.desc} item={item} title={itemTitles?.[index]} />
          ))}
        </ul>

        <div className="relative aspect-21/20 w-full overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.22)] sm:aspect-16/10 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:aspect-auto lg:min-h-full dark:shadow-[0_4px_20px_rgba(0,0,0,0.6)] dark:ring-1 dark:ring-white/10">
          <Image
            src={GREGG_IMAGE}
            alt="Gregg, On-Site Storage founder, checking an order on a clipboard"
            fill
            sizes="(min-width: 1024px) 46vw, 90vw"
            className="object-cover object-center"
          />
        </div>

        <div className="lg:col-start-1 lg:row-start-3 lg:text-center">
          <Link
            prefetch={false}
            href={`tel:${CONTACT_NUMBER}`}
            className="block bg-theme-primary px-5 py-3.5 text-center text-[15px] font-semibold text-white shadow-md transition-colors hover:bg-theme-primary-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-theme-primary sm:text-lg lg:inline-block lg:py-2.5"
          >
            Call To Check Fast Delivery And Best Price
          </Link>
        </div>
      </div>
    </section>
  );
}
