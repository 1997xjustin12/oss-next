const WHY_CARDS = [
  {
    path: "M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7l-9-5z",
    title: "No Hidden Fees",
    desc: "Quoted price is final. Completely transparent from inquiry to invoice.",
  },
  {
    path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z",
    title: "130+ Depot Locations",
    desc: "Nationwide reach across the entire United States and Canada.",
  },
  {
    path: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z",
    title: "75+ Years Experience",
    desc: "Senior staff with deep container industry expertise on every call.",
  },
  {
    path: "M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z",
    title: "Flexible Options",
    desc: "Buy, rent, or lease-to-own — your terms, your timeline, your budget.",
  },
];

const MINI_STATS = [
  { num: "130+",     label: "Depot Locations"  },
  { num: "1,000s",   label: "In Stock Now"     },
  { num: "98%",      label: "Recommend Rate"   },
  { num: "Same Day", label: "Quote Turnaround" },
];

export function WhyUs() {
  return (
    <section className="bg-theme-subtle py-[72px] px-[5%]" aria-labelledby="why-title">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-[56px] items-start">
        {/* Left */}
        <div>
          <p className="text-[11.5px] font-bold text-theme-primary uppercase tracking-[.1em] mb-2">
            Why Choose Us
          </p>
          <h2
            id="why-title"
            className="text-[32px] sm:text-[38px] font-black text-theme-dark leading-[1.05] mb-3 tracking-[-0.02em]"
          >
            The Onsite Storage Difference
          </h2>
          <p className="text-[15px] text-theme-muted leading-[1.65] max-w-[580px]">
            Since 2002, we&apos;ve helped thousands of businesses and homeowners find the right
            container at the right price — with no stress and no surprises.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[13px] mt-[26px]">
            {WHY_CARDS.map((card) => (
              <div
                key={card.title}
                className="bg-white border border-theme-border rounded-[7px] p-[17px] transition-colors hover:border-theme-primary"
              >
                <div className="w-[33px] h-[33px] bg-theme-primary-light rounded-[5px] flex items-center justify-center mb-[10px]">
                  <svg
                    viewBox="0 0 24 24"
                    width="17"
                    height="17"
                    className="fill-theme-primary"
                    aria-hidden="true"
                  >
                    <path d={card.path} />
                  </svg>
                </div>
                <h5 className="text-[14.5px] font-bold mb-1">{card.title}</h5>
                <p className="text-[13px] text-theme-muted leading-[1.5]">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — stats panel */}
        <div className="flex flex-col gap-[13px]">
          <div className="bg-theme-primary rounded-[10px] p-[34px] text-white text-center">
            <span className="text-[68px] font-black leading-none block">22+</span>
            <p className="text-[14.5px] text-white/[.78] mt-2">
              Years serving businesses and homeowners across North America with
              steel-strong storage solutions
            </p>
          </div>

          <div className="grid grid-cols-2 gap-[11px]">
            {MINI_STATS.map((s) => (
              <div
                key={s.label}
                className="bg-white border border-theme-border rounded-[7px] p-[15px] text-center"
              >
                <strong className="text-[24px] font-black text-theme-dark block">{s.num}</strong>
                <span className="text-[11px] font-semibold uppercase tracking-[.05em] text-theme-muted">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
