"use client";

import { useState } from "react";

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

export function QuoteForm() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section
      id="quote-section"
      className="bg-[#BD112A] py-[72px] px-[5%]"
      aria-labelledby="quote-title"
    >
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-10 lg:gap-[52px] items-start">
        {/* Form box */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[11px] mb-[11px]">
            <div className="flex flex-col gap-1">
              <label htmlFor="q-fname" className={LABEL_CLS}>
                First Name
              </label>
              <input
                type="text"
                id="q-fname"
                placeholder="John"
                className={INPUT_CLS}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="q-lname" className={LABEL_CLS}>
                Last Name
              </label>
              <input
                type="text"
                id="q-lname"
                placeholder="Smith"
                className={INPUT_CLS}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 mb-[11px]">
            <label htmlFor="q-email" className={LABEL_CLS}>
              Email Address
            </label>
            <input
              type="email"
              id="q-email"
              placeholder="you@company.com"
              className={INPUT_CLS}
            />
          </div>

          <div className="flex flex-col gap-1 mb-[11px]">
            <label htmlFor="q-phone" className={LABEL_CLS}>
              Phone Number
            </label>
            <input
              type="tel"
              id="q-phone"
              placeholder="(888) 000-0000"
              className={INPUT_CLS}
            />
          </div>

          <div className="flex flex-col gap-1 mb-[11px]">
            <label htmlFor="q-zip" className={LABEL_CLS}>
              Delivery ZIP Code
            </label>
            <input
              type="text"
              id="q-zip"
              placeholder="90210"
              className={INPUT_CLS}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[11px] mb-[11px]">
            <div className="flex flex-col gap-1">
              <label htmlFor="q-size" className={LABEL_CLS}>
                Container Size
              </label>
              <select id="q-size" className={INPUT_CLS}>
                <option>20ft Standard</option>
                <option>40ft Standard</option>
                <option>40ft High Cube</option>
                <option>Refrigerated (Reefer)</option>
                <option>Other / Not Sure</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="q-type" className={LABEL_CLS}>
                I Want To
              </label>
              <select id="q-type" className={INPUT_CLS}>
                <option>Purchase</option>
                <option>Rent</option>
                <option>Rent-To-Own</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSubmitted(true)}
            className="w-full bg-theme-primary text-white py-[13px] rounded-[5px] text-[16px] font-extrabold uppercase tracking-[.04em] transition-colors hover:bg-theme-primary-dark"
          >
            {submitted
              ? "✓ Quote Request Sent — We'll be in touch!"
              : "Get My Free Quote →"}
          </button>
          <p className="text-center text-[11.5px] text-theme-muted mt-[9px]">
            🔒 Your information is secure and never shared. No spam — ever.
          </p>
        </div>
        {/* Right copy */}
        <div className="flex flex-col gap-[20px]">
          <h2
            id="quote-title"
            className="text-[36px] sm:text-[42px] font-bold text-white leading-[1.05] mb-[14px] tracking-[-0.02em]"
          >
            Get Your Free Container Quote in Minutes
          </h2>
          <p className="text-[15px] text-white/[.78] leading-[1.65] mb-[22px]">
            Tell us your size, location, and needs — we'll respond with an
            accurate, no-obligation price and fast delivery timeline from our
            nearest depot
          </p>
          <div className="flex flex-col gap-[10px]">
            {POINTS.map((point) => (
              <div
                key={point}
                className="flex items-center gap-[10px] text-white/[.88] text-[14px] font-medium"
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
