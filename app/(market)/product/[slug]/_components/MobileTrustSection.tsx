import Link from "next/link";
import { Phone, ShieldCheck, Trophy, Truck } from "lucide-react";
import { Stars } from "@/components/product/Stars";
import { ROUTES } from "@/config/routes";
import { GOOGLE_REVIEW_STATS } from "@/config/reviews";
import { CONTACT_NUMBER } from "@/lib/helpers";

/**
 * The reassurance block under the product, on phones.
 *
 * Desktop puts this work in the right-hand column, which a phone does not
 * have — everything there stacks below a long specification panel instead. So
 * the same three jobs get their own section here, directly under the product:
 * offer the phone call, show that the price has monthly routes, and answer the
 * "can I trust these people" question before the visitor scrolls into reviews.
 *
 * Hidden from `lg` up, where the sidebar already covers it.
 */

const CONTACT_TEL = `tel:${CONTACT_NUMBER.replace(/[^\d+]/g, "")}`;

/** Matches the payment keys on the panel above, so the two never disagree. */
const BUDGET_OPTIONS = [
  { label: "Rent", note: "as low as $96 a month", ptype: "rental" },
  { label: "Rent-To-Own", note: "as low as $61.36 a month", ptype: "rto" },
] as const;

const ASSURANCES = [
  {
    Icon: Trophy,
    title: "25+ Years Experience",
    body: "Thousands of containers delivered for customers just like you.",
  },
  {
    Icon: ShieldCheck,
    title: "Money-Back Guarantee",
    body: "If the container isn’t what you ordered when it arrives, we’ll take it back.",
  },
  {
    Icon: Truck,
    title: "Nationwide Delivery",
    body: "Delivered from 130+ depots to all 50 states.",
  },
];

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" className="shrink-0">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function MobileTrustSection() {
  const { rating, count } = GOOGLE_REVIEW_STATS;

  return (
    <section className="px-4 pb-8 lg:hidden" aria-label="Delivery help and guarantees">
      {/* Call banner. The whole block is the link, not just the number — on a
          phone the entire banner is the tap target it looks like. */}
      <Link
        href={CONTACT_TEL}
        className="relative mt-10 block rounded-md bg-theme-primary px-4 pb-4 pt-8 text-center text-white transition-colors hover:bg-theme-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2"
      >
        <span className="absolute -top-6 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border-4 border-theme-bg bg-theme-primary">
          <Phone className="h-5 w-5" aria-hidden />
        </span>
        <span className="block text-[15px] font-bold leading-snug">
          Need Delivery? <span className="text-[#FFC94A]">CALL NOW</span> for
          Instant All-In Price
        </span>
        <span className="mt-1 block text-[22px] font-extrabold underline underline-offset-4">
          {CONTACT_NUMBER}
        </span>
      </Link>

      <h2 className="mt-7 text-center text-[15px] font-semibold text-theme-dark">
        Containers for Every Budget -{" "}
        <span className="text-theme-primary">Low Monthly Payments</span>
      </h2>

      <div className="mt-3 grid grid-cols-2 gap-3">
        {BUDGET_OPTIONS.map((option) => (
          <Link
            key={option.ptype}
            href={`${ROUTES.PLP}?ptype=${option.ptype}`}
            className="rounded-md bg-theme-primary px-2 py-2.5 text-center text-white transition-colors hover:bg-theme-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2"
          >
            <span className="block text-[15px] font-bold leading-tight">
              {option.label}
            </span>
            <span className="mt-0.5 block text-[11px] leading-tight text-white/85">
              {option.note}
            </span>
          </Link>
        ))}
      </div>

      {/* Two columns of reassurance. The rating leads because it is the only
          one a stranger can verify. */}
      <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5">
        <li className="flex gap-2.5">
          <GoogleMark />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-bold text-theme-dark">
                {rating}
              </span>
              <Stars count={Math.round(rating)} />
            </div>
            <p className="mt-0.5 text-[11px] leading-snug text-theme-muted">
              {count}+ Reviews ·{" "}
              <Link href="#reviews" className="underline hover:text-theme-dark">
                Read our reviews
              </Link>
            </p>
          </div>
        </li>

        {ASSURANCES.map(({ Icon, title, body }) => (
          <li key={title} className="flex gap-2.5">
            <Icon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-theme-primary" aria-hidden />
            <div className="min-w-0">
              <div className="text-[13px] font-bold leading-tight text-theme-dark">
                {title}
              </div>
              <p className="mt-0.5 text-[11px] leading-snug text-theme-muted">
                {body}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
