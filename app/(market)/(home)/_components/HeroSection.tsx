import Link from "next/link";

const PRICING_ROWS = [
  { title: "20ft Standard Container", sub: "Used · Wind & Watertight · 160 sq ft", avail: "In Stock — Ready to Deliver", price: "$1,350",    unit: "Purchase" },
  { title: "40ft Standard Container", sub: "Used · Wind & Watertight · 320 sq ft", avail: "In Stock — Ready to Deliver", price: "$2,000",    unit: "Purchase" },
  { title: "Rental Containers",       sub: "20ft & 40ft — Flexible monthly terms", avail: "Available Nationwide",        price: "$95/mo",    unit: "Rental"   },
  { title: "Rent-To-Own",             sub: "Build equity — Own it outright",       avail: "Flexible Payment Plans",      price: "$79.99/mo", unit: "RTO"      },
];

const STATS = [
  { num: "130", sfx: "+",  label: "Depot Locations"   },
  { num: "22",  sfx: "yr", label: "In Business"       },
  { num: "75",  sfx: "+",  label: "Yrs Combined Exp." },
  { num: "98",  sfx: "%",  label: "Recommend Rate"    },
];

const PILLS = ["20ft & 40ft In Stock", "Reefer Containers Available", "Same-Day Quotes"];

export function HeroSection() {
  return (
    <section
      className="[background:linear-gradient(135deg,#1a1a1a_0%,#2c2c2c_60%,#1f1f1f_100%)] min-h-[500px] flex flex-col lg:grid lg:grid-cols-[1.15fr_0.85fr] overflow-hidden"
      aria-label="Hero section"
    >
      {/* ── Left content ── */}
      <div className="py-10 px-6 sm:pl-[6%] sm:pr-[5%] lg:py-[60px] lg:pl-[6%] lg:pr-[4%] flex flex-col justify-center z-[1]">
        <div className="inline-flex items-center gap-[7px] bg-theme-primary text-white text-[11.5px] font-bold px-[14px] py-[5px] rounded-[2px] uppercase tracking-[.1em] mb-5 w-fit">
          ⭐ America&apos;s #1 Container Wholesaler — Since 2002
        </div>

        <h1 className="text-[38px] sm:text-[50px] font-black text-white mb-[14px] tracking-[-0.025em] leading-[1.05]">
          Shipping Containers at<br />
          <em className="text-theme-primary not-italic">Lowest Prices</em> — Delivered
        </h1>

        <p className="text-[16px] text-white/70 leading-[1.65] mb-[26px] max-w-[480px]">
          New and used containers for sale, rent, or lease-to-own across the USA &amp; Canada.
          130+ depots, expert support, and guaranteed satisfaction on every order.
        </p>

        <div className="flex gap-[9px] flex-wrap mb-7">
          {PILLS.map((pill) => (
            <div
              key={pill}
              className="bg-white/[.08] border border-white/[.16] text-white/[.88] text-[12.5px] font-semibold px-[13px] py-[6px] rounded-[3px] flex items-center gap-[6px]"
            >
              <span className="w-[7px] h-[7px] rounded-full bg-theme-success shrink-0" aria-hidden="true" />
              {pill}
            </div>
          ))}
        </div>

        <div className="flex gap-[11px] flex-wrap">
          <Link
            href="#quote-section"
            className="bg-theme-primary text-white px-[26px] py-[14px] rounded-[5px] text-[15.5px] font-black inline-flex items-center gap-[7px] transition-colors hover:bg-theme-primary-dark"
          >
            📋 Get Free Quote
          </Link>
          <a
            href="tel:8889779085"
            className="bg-transparent text-white px-[22px] py-[13px] rounded-[5px] text-[14.5px] font-bold border-2 border-white/[.32] inline-flex items-center gap-[7px] transition-colors hover:border-white/[.65]"
          >
            📞 Call (888) 977-9085
          </a>
        </div>

        <div className="flex gap-6 sm:gap-8 mt-[38px] pt-[26px] border-t border-white/[.1] flex-wrap">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-[32px] font-black text-white leading-none">
                {s.num}<em className="text-theme-primary not-italic">{s.sfx}</em>
              </div>
              <div className="text-[11px] text-white/50 uppercase tracking-[.06em] mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right — Pricing panel ── */}
      <div className="bg-theme-primary px-6 sm:px-[5%] py-10 lg:py-[40px] lg:px-[4%] flex flex-col justify-center">
        <h3 className="text-[19px] text-white font-bold mb-[18px]">📦 Current Pricing — Available Now</h3>

        {PRICING_ROWS.map((row) => (
          <div
            key={row.title}
            className="bg-black/[.16] rounded-[6px] px-[17px] py-[15px] mb-[9px] flex items-center justify-between border-l-4 border-white/[.38]"
          >
            <div className="min-w-0">
              <h4 className="text-[15.5px] text-white font-bold mb-0.5">{row.title}</h4>
              <p className="text-[12px] text-white/70">{row.sub}</p>
              <div className="inline-flex items-center gap-1 text-[11px] text-theme-success-light font-semibold mt-1">
                <span className="w-[6px] h-[6px] rounded-full bg-theme-success shrink-0" aria-hidden="true" />
                {row.avail}
              </div>
            </div>
            <div className="text-right shrink-0 ml-3">
              <strong className="text-[21px] text-white font-black block">{row.price}</strong>
              <span className="text-[11px] text-white/[.62]">{row.unit}</span>
            </div>
          </div>
        ))}

        <Link
          href="/products"
          className="mt-[14px] bg-black/[.2] border-2 border-white/[.38] text-white w-full py-3 rounded-[5px] text-[14.5px] font-bold text-center transition-colors hover:bg-black/[.32]"
        >
          View All Containers &amp; Pricing →
        </Link>
      </div>
    </section>
  );
}
