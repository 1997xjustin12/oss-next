export type HowItWorksStep = {
  n: number;
  title: string;
  /**
   * Template text (TemplateRichText): `[label](/path)` is a link, `{phone}`
   * the sales line as a call link.
   */
  desc: string;
  highlight: boolean;
};

/**
 * "How It Works" (components/shared/HowItWorks.tsx): the homepage's words,
 * which the /all-city/ template starts from.
 */

/** The small red line over the heading. */
export const HOW_IT_WORKS_EYEBROW = "Simple Process";

/** The section's line under the heading (the 2026-11-18 design). */
export const HOW_IT_WORKS_SUBTITLE = "How To Buy Or Rent A Shipping Container In Four Steps";

/** The delivery guide is still WordPress's page (migration doc §12). */
const DELIVERY_GUIDE = "/complete-shipping-container-delivery-guide";

// Words from the 2026-11-18 design. Fixed from it: "containezr" (a typo) and
// "[3 to 7] days" (its brackets read as a placeholder mark).
export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    n: 1,
    title: "Choose Your Container",
    desc: "Browse shipping container sizes, conditions, and grades online, or call {phone} for personal guidance.",
    highlight: true,
  },
  {
    n: 2,
    title: "Get a Free Quote",
    desc: "Get clear pricing on purchase, rental, or rent-to-own. The quote you receive is the final price.",
    highlight: false,
  },
  {
    n: 3,
    title: "Confirm Your Order",
    desc: "Book with our experienced team. We keep you updated from order to delivery.",
    highlight: false,
  },
  {
    n: 4,
    title: "We Deliver to You",
    desc: `Your shipping container ships from the nearest of our depots and is placed where you need it. Delivery typically takes 3 to 7 days after checkout. Read the complete container [delivery guide](${DELIVERY_GUIDE}) to prepare your site.`,
    highlight: false,
  },
];
