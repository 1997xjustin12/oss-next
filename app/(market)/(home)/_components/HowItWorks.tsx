import { PlpLink } from "@/components/shared/PlpLink";
import { TemplateRichText } from "@/components/shared/TemplateRichText";
import { HOME_HEADING_DEFAULTS } from "@/config/homeContent";
import { ROUTES } from "@/config/routes";
import { HOW_IT_WORKS_STEPS, HOW_IT_WORKS_SUBTITLE } from "./howItWorksSteps";

const DESC_LINK =
  "font-bold text-theme-primary underline underline-offset-2 hover:no-underline dark:text-red-400";

/**
 * "How It Works": four steps joined by a line.
 *
 * Light mode is the 2026-11-18 design (white, red titles and line, the first
 * step's circle red and the rest charcoal). Dark mode keeps the earlier
 * styling (the dark band, white titles, muted circles and line).
 *
 * One list for every screen, so the steps are in the page once: a vertical
 * timeline on a phone (circle beside its text, the line running down between
 * the circles), four columns from `lg` (circle above its text, one line across
 * behind the circles).
 *
 * `stepTitles` is indexed to HOW_IT_WORKS_STEPS. An index with no entry keeps
 * the step's own title, so the component still renders if the admin registry
 * and the step list ever fall out of sync.
 */
export function HowItWorks({
  heading = HOME_HEADING_DEFAULTS["howItWorks.h2"],
  stepTitles,
}: {
  heading?: string;
  stepTitles?: readonly (string | undefined)[];
}) {
  return (
    <section className="bg-white px-[5%] py-10 sm:py-14 lg:py-16 dark:bg-theme-dark" aria-labelledby="hiw-title">
      <div className="mb-8 text-center sm:mb-12">
        <p className="mb-1 text-xs font-medium tracking-wide text-theme-primary uppercase sm:text-sm dark:font-bold dark:tracking-widest dark:text-red-400">
          Simple Process
        </p>
        <h2
          id="hiw-title"
          className="text-lg font-bold text-neutral-800 sm:text-[30px] sm:leading-tight dark:font-black dark:text-white"
        >
          {heading}
        </h2>
        <p className="mt-2 text-[13px] text-neutral-800 sm:mt-4 sm:text-2xl dark:text-white/60">
          {HOW_IT_WORKS_SUBTITLE}
        </p>
      </div>

      <div className="relative mx-auto max-w-lg lg:max-w-none">
      {/* Desktop: one line across, from the first circle's centre to the last's, behind them. */}
      <div
        aria-hidden
        className="absolute top-[38px] right-[12.5%] left-[12.5%] hidden h-[3px] bg-theme-primary lg:block dark:h-0.5 dark:bg-white/9"
      />
      <ol className="lg:grid lg:grid-cols-4">
        {HOW_IT_WORKS_STEPS.map((step, index) => {
          const isLast = index === HOW_IT_WORKS_STEPS.length - 1;
          return (
            <li key={step.n} className="relative flex gap-4 pb-8 last:pb-0 sm:gap-6 lg:flex-col lg:items-center lg:gap-0 lg:px-4 lg:pb-0 lg:text-center">
              {/* Phone: the line down to the next circle, behind this one. */}
              {!isLast && (
                <span
                  aria-hidden
                  className="absolute top-0 bottom-0 left-[22px] w-[2px] bg-theme-primary lg:hidden dark:bg-white/9"
                />
              )}
              <span
                aria-hidden
                className={`relative z-[1] flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white lg:h-[78px] lg:w-[78px] lg:text-4xl dark:border-2 dark:font-black ${
                  step.highlight
                    ? "bg-theme-primary dark:border-theme-primary"
                    : "bg-[#3f3f3f] dark:border-[#555] dark:bg-[#333] dark:text-[#777]"
                }`}
              >
                {step.n}
              </span>
              <div className="min-w-0 pt-1 lg:mt-7 lg:pt-0">
                <h3 className="text-lg leading-tight font-bold text-theme-primary sm:text-xl lg:text-[21px] dark:text-white">
                  <span className="sr-only">Step {step.n}: </span>
                  {stepTitles?.[index] ?? step.title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-snug text-neutral-700 sm:text-[15px] lg:mt-2 lg:text-base lg:leading-[1.35] dark:text-white/60">
                  <TemplateRichText text={step.desc} linkClassName={DESC_LINK} />
                </p>
              </div>
            </li>
          );
        })}
      </ol>
      </div>

      <div className="mx-auto mt-10 w-full max-w-md sm:mt-12">
        <PlpLink
          prefetch={false}
          href={`${ROUTES.PLP}?ptype=buy`}
          className="block bg-theme-primary px-6 py-3 text-center text-base font-bold text-white transition-colors hover:bg-theme-primary-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-theme-primary sm:text-lg"
        >
          View All Containers &amp; Pricing
        </PlpLink>
      </div>
    </section>
  );
}
