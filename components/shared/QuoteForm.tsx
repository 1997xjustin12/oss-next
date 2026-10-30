"use client";

import { HOME_HEADING_DEFAULTS } from "@/config/homeContent";
import { ZohoPricingForm, type ZohoPricingFormClasses } from "@/components/shared/ZohoPricingForm";

const POINTS = [
  "No obligation — free pricing always",
  "Same-day response from our team",
  "All container grades and conditions",
  "Buy, rent, or rent-to-own options",
  "Delivery from 130+ nationwide depots",
];

const INPUT_CLS =
  "w-full border-[1.5px] border-theme-border rounded-[4px] px-3 py-[10px] text-[14px] text-theme-dark dark:text-white outline-none focus:border-theme-primary bg-white dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 transition-colors";
const LABEL_CLS =
  "text-[12px] font-bold text-theme-dark-2 dark:text-gray-300 uppercase tracking-[.04em]";

/** Half width beside its neighbour from `sm` up; the rest take the row. */
const HALF_WIDTH = new Set(["First Name", "Last Name", "CONTACTCF7", "CONTACTCF23"]);

/** This section's look for the shared Zoho pricing form. */
const HOME_CLASSES: ZohoPricingFormClasses = {
  form: "grid grid-cols-1 sm:grid-cols-2 gap-[11px]",
  fieldWrap: (name) => `flex flex-col gap-1 ${HALF_WIDTH.has(name) ? "" : "sm:col-span-2"}`,
  label: LABEL_CLS,
  required: "text-theme-primary",
  field: INPUT_CLS,
  captchaWrap: "flex flex-col gap-1 sm:col-span-2",
  captchaInput: `${INPUT_CLS} max-w-[180px]`,
  captchaImage: "h-[44px] w-auto rounded-[4px] border border-theme-border bg-white",
  reload: "inline-flex items-center gap-1 text-[13px] font-bold text-theme-primary hover:underline dark:text-red-400",
  actions: "sm:col-span-2 mt-[2px]",
  submit:
    "w-full bg-theme-primary text-white py-[13px] rounded-[5px] text-[16px] font-extrabold uppercase tracking-[.04em] transition-colors hover:bg-theme-primary-dark disabled:opacity-70",
};

/**
 * "Get a free quote": the red section on the homepage (and the product page,
 * with its own heading). Its form is the Zoho CRM pricing form the GBP pages
 * use (components/shared/ZohoPricingForm.tsx), with Zoho's fields only, in
 * this section's style: a lead lands in Zoho exactly as one from a GBP page.
 *
 * Until 2026-10-30 this form posted nowhere: its button only changed its own
 * label to "Quote Request Sent". "I Want To" (purchase, rent, rent-to-own) was
 * dropped with the move to Zoho: the Zoho form has no field for it.
 *
 * A Client Component, so it can't read the copy itself — (home)/page.tsx
 * resolves it on the server and passes it in.
 */
export function QuoteForm({
  heading = HOME_HEADING_DEFAULTS["quoteForm.h2"],
}: {
  heading?: string;
}) {
  return (
    <section
      id="quote-section"
      className="bg-theme-primary py-[72px] px-[5%]"
      aria-labelledby="quote-title"
    >
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-10 lg:gap-[52px] items-start">
        {/* Form box */}
        <div className="order-2 lg:order-1 bg-white dark:bg-gray-800 rounded-lg p-7">
          <ZohoPricingForm
            classes={HOME_CLASSES}
            labels={{ Phone: "Phone Number", Email: "Email Address", CONTACTCF7: "Delivery ZIP Code" }}
            placeholders={{
              "First Name": "John",
              "Last Name": "Smith",
              Phone: "(888) 000-0000",
              Email: "you@company.com",
              CONTACTCF7: "90210",
              CONTACTCF23: "Select a size",
              CONTACTCF30: "Anything we should know?",
              enterdigest: "Type the code",
            }}
            submitLabel="Get My Free Quote →"
            footnote={
              <p className="text-center text-[11.5px] text-theme-muted mt-[9px] dark:text-gray-400">
                🔒 Your information is secure and never shared. No spam — ever.
              </p>
            }
          />
        </div>
        {/* Right copy */}
        <div className="order-1 lg:order-2 flex flex-col gap-5">
          <h2
            id="quote-title"
            className="text-[36px] sm:text-[42px] font-bold text-white leading-[1.05] mb-[14px] tracking-[-0.02em]"
          >
            {heading}
          </h2>
          <p className="text-[15px] text-white/90 leading-[1.65] mb-[22px] capitalize">
            Tell us your size, location, and needs — we&rsquo;ll respond with an
            accurate, no-obligation price and fast delivery timeline from our
            nearest depot
          </p>
          <div className="flex flex-col gap-[10px]">
            {POINTS.map((point) => (
              <div
                key={point}
                className="flex items-center gap-[10px] text-white/[.88] text-[14px] font-medium capitalize"
              >
                <div className="w-[21px] h-[21px] rounded-full bg-white/[.2] flex items-center justify-center text-[11.5px] shrink-0 text-white">
                  ✓
                </div>
                {point}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
