import { TemplateRichText } from "@/components/shared/TemplateRichText";
import { ViewAllContainersLink } from "@/components/shared/ViewAllContainersLink";
import { HOME_HEADING_DEFAULTS } from "@/config/homeContent";
import { HOW_IT_WORKS_EYEBROW, HOW_IT_WORKS_STEPS, HOW_IT_WORKS_SUBTITLE } from "@/lib/data/howItWorksSteps";

const DESC_LINK =
  "font-bold text-theme-primary underline underline-offset-2 hover:no-underline dark:text-red-400";

/** One step: its title and its text (template text: `[label](/path)`, `{phone}`). */
export type HowItWorksStepText = { title: string; desc: string };

type Props = {
  heading?: string;
  /** The homepage's admin-edited step titles, indexed to `steps`; a missing one keeps the step's own. */
  stepTitles?: readonly (string | undefined)[];
  /** The small red line over the heading. Blank: none. */
  eyebrow?: string;
  /** The line under the heading (template text: an /all-city/ page links its city). */
  subtitle?: string;
  steps?: readonly HowItWorksStepText[];
  /** The button under the steps: the listing by default; an /all-city/ page sends it to its depot's page. Blank label: no button. */
  button?: { label: string; href: string };
  /** The band's colours. The homepage is white; an /all-city/ page light grey. */
  background?: string;
};

/**
 * "How It Works": the steps joined by a line.
 *
 * Light mode is the 2026-11-18 design (red titles and line, the first step's
 * circle red and the rest charcoal). Dark mode keeps the earlier styling (the
 * dark band, white titles, muted circles and line).
 *
 * One list for every screen, so the steps are in the page once: a vertical
 * timeline on a phone (circle beside its text, the line running down between
 * the circles), a row from `lg` (circle above its text, one line across
 * behind the circles).
 *
 * The homepage's (no props but its heading and step titles) and an /all-city/
 * page's (every word from its template, the button to its depot's page).
 */
export function HowItWorks({
  heading = HOME_HEADING_DEFAULTS["howItWorks.h2"],
  stepTitles,
  eyebrow = HOW_IT_WORKS_EYEBROW,
  subtitle = HOW_IT_WORKS_SUBTITLE,
  steps = HOW_IT_WORKS_STEPS,
  button,
  background = "bg-white dark:bg-theme-dark",
}: Props) {
  const count = steps.length;
  if (count === 0) return null;
  // The desktop line runs from the first circle's centre to the last's: half a column in from each side.
  const inset = `${50 / count}%`;

  return (
    <section className={`px-[5%] py-10 sm:py-14 lg:py-16 ${background}`} aria-labelledby="hiw-title">
      <div className="mb-8 text-center sm:mb-12">
        {eyebrow.trim() && (
          <p className="mb-1 text-xs font-medium tracking-wide text-theme-primary uppercase sm:text-sm dark:font-bold dark:tracking-widest dark:text-red-400">
            {eyebrow}
          </p>
        )}
        <h2
          id="hiw-title"
          className="text-lg font-bold text-neutral-800 sm:text-[30px] sm:leading-tight dark:font-black dark:text-white"
        >
          {heading}
        </h2>
        {subtitle.trim() && (
          <p className="mt-2 text-[13px] text-neutral-800 sm:mt-4 sm:text-2xl dark:text-white/60">
            <TemplateRichText text={subtitle} linkClassName={DESC_LINK} accentClassName="text-theme-primary dark:text-red-400" />
          </p>
        )}
      </div>

      <div className="relative mx-auto max-w-lg lg:max-w-none">
        {/* Desktop: one line across, from the first circle's centre to the last's, behind them. */}
        {count > 1 && (
          <div
            aria-hidden
            style={{ left: inset, right: inset }}
            className="absolute top-[38px] hidden h-[3px] bg-theme-primary lg:block dark:h-0.5 dark:bg-white/9"
          />
        )}
        <ol className="lg:grid lg:auto-cols-fr lg:grid-flow-col">
          {steps.map((step, index) => {
            const isLast = index === count - 1;
            const first = index === 0;
            return (
              <li key={index} className="relative flex gap-4 pb-8 last:pb-0 sm:gap-6 lg:flex-col lg:items-center lg:gap-0 lg:px-4 lg:pb-0 lg:text-center">
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
                    first
                      ? "bg-theme-primary dark:border-theme-primary"
                      : "bg-[#3f3f3f] dark:border-[#555] dark:bg-[#333] dark:text-[#777]"
                  }`}
                >
                  {index + 1}
                </span>
                <div className="min-w-0 pt-1 lg:mt-7 lg:pt-0">
                  <h3 className="text-lg leading-tight font-bold text-theme-primary sm:text-xl lg:text-[21px] dark:text-white">
                    <span className="sr-only">Step {index + 1}: </span>
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

      {(!button || button.label.trim()) && (
        <ViewAllContainersLink className="mt-10 sm:mt-12" {...(button ? { href: button.href, label: button.label } : {})} />
      )}
    </section>
  );
}
