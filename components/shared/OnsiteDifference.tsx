import Image from "next/image";
import { HoverPrefetchLink as Link } from "@/components/shared/HoverPrefetchLink";
import { TemplateRichText } from "@/components/shared/TemplateRichText";
import { HOME_HEADING_DEFAULTS } from "@/config/homeContent";
import { CONTACT_NUMBER } from "@/lib/helpers";
import {
  ONSITE_DIFFERENCE_BODY,
  ONSITE_DIFFERENCE_BUTTON,
  ONSITE_DIFFERENCE_IMAGE,
  ONSITE_DIFFERENCE_POINTS,
  type OnsiteDifferencePoint,
} from "@/lib/data/onsiteDifference";

const ACCENT = "text-theme-primary dark:text-red-400";
const LINK = "font-semibold text-neutral-800 underline underline-offset-2 hover:text-theme-primary dark:text-white dark:hover:text-red-400";

/**
 * One point: a white card with a soft shadow, lifting with a red ring on
 * hover (the same effect as the "Find The Right Container" cards).
 */
function Point({ point }: { point: OnsiteDifferencePoint }) {
  return (
    <li className="flex flex-col justify-center bg-white lg:justify-start px-3 py-4 shadow-[0_2px_10px_rgba(0,0,0,0.12)] ring-2 ring-transparent transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(0,0,0,0.22)] hover:ring-theme-primary motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:min-h-35 sm:px-5 sm:py-6 lg:px-6 dark:bg-neutral-900 dark:shadow-[0_2px_12px_rgba(0,0,0,0.5)] dark:ring-white/10 dark:hover:shadow-[0_12px_30px_rgba(0,0,0,0.6)] dark:hover:ring-theme-primary">
      <h3 className="text-[14px] leading-tight font-semibold text-neutral-800 sm:text-lg lg:text-xl dark:text-white">
        <TemplateRichText text={point.title} accentClassName={ACCENT} linkClassName={LINK} />
      </h3>
      <p className="mt-1 text-[12.5px] leading-snug text-neutral-600 sm:text-[15px] lg:text-base dark:text-neutral-300">
        <TemplateRichText text={point.desc} accentClassName={ACCENT} linkClassName={LINK} />
      </p>
    </li>
  );
}

type Props = {
  /** Template text; `[[…]]` is red (an /all-city/ page's city). */
  heading?: string;
  /** The homepage's admin-edited point titles, indexed to `points`; a missing one keeps the point's own. */
  itemTitles?: readonly (string | undefined)[];
  body?: string;
  points?: readonly OnsiteDifferencePoint[];
  /** The call button's words. Blank: no button. */
  button?: string;
  /** `sizes`: for a photo much wider than its frame (a depot banner), which is cropped to the frame's height. */
  image?: { src: string; alt: string; sizes?: string };
  /** The band's colours: the homepage's light grey, an /all-city/ page's white. */
  background?: string;
  /** The heading's colour: the homepage's all red; an /all-city/ page's dark, its city red. */
  headingColour?: string;
};

/**
 * "The On-Site Storage Difference" (the 2026-11-18 design): point cards and
 * the call button beside the photo on desktop. On a phone everything is
 * centred: the heading, the cards two by two, the photo, then the button full
 * width. One grid for both; the photo sits between the cards and the button in
 * the markup, and moves to its own column from `lg`.
 *
 * The homepage's (its heading and point titles from the Content Editor) and
 * an /all-city/ page's (every word from its template, its city and depot
 * filled in, its depot's photo).
 */
export function OnsiteDifference({
  heading = HOME_HEADING_DEFAULTS["onsiteDifference.h2"],
  itemTitles,
  body = ONSITE_DIFFERENCE_BODY,
  points = ONSITE_DIFFERENCE_POINTS,
  button = ONSITE_DIFFERENCE_BUTTON,
  image = ONSITE_DIFFERENCE_IMAGE,
  background = "bg-neutral-100 dark:bg-neutral-950",
  headingColour = "text-theme-primary dark:text-red-400",
}: Props) {
  return (
    <section aria-labelledby="osd-title" className={`px-[5%] py-10 sm:py-14 lg:py-16 ${background}`}>
      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,46%)] lg:gap-x-12 xl:gap-x-16">
        <div className="text-center lg:col-start-1 lg:row-start-1 lg:text-left">
          <h2
            id="osd-title"
            className={`text-xl font-bold text-balance sm:text-3xl lg:text-[32px] lg:leading-tight ${headingColour}`}
          >
            <TemplateRichText text={heading} accentClassName={ACCENT} linkClassName={LINK} />
          </h2>
          {body.trim() && (
            <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-snug text-neutral-700 sm:text-lg lg:mx-0 lg:mt-2 dark:text-neutral-300">
              <TemplateRichText text={body} accentClassName={ACCENT} linkClassName={LINK} />
            </p>
          )}
        </div>

        {points.length > 0 && (
          <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:col-start-1 lg:row-start-2 lg:mt-4 lg:gap-6">
            {points.map((point, index) => (
              <Point key={index} point={{ ...point, title: itemTitles?.[index] ?? point.title }} />
            ))}
          </ul>
        )}

        <div className="relative aspect-21/20 w-full overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.22)] sm:aspect-16/10 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:aspect-auto lg:min-h-full dark:shadow-[0_4px_20px_rgba(0,0,0,0.6)] dark:ring-1 dark:ring-white/10">
          <Image src={image.src} alt={image.alt} fill sizes={image.sizes ?? "(min-width: 1024px) 46vw, 90vw"} className="object-cover object-center" />
        </div>

        {button.trim() && (
          <div className="lg:col-start-1 lg:row-start-3 lg:text-center">
            <Link
              prefetch={false}
              href={`tel:${CONTACT_NUMBER}`}
              className="block bg-theme-primary px-5 py-3.5 text-center text-[15px] font-semibold text-white shadow-md transition-colors hover:bg-theme-primary-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-theme-primary sm:text-lg lg:inline-block lg:py-2.5"
            >
              {button}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
