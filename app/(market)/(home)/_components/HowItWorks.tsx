const STEPS = [
  {
    n: 1,
    title: "Choose Your Container",
    desc: "Browse sizes, conditions, and grades online — or call us for personalized guidance",
    highlight: true,
  },
  {
    n: 2,
    title: "Get a Free Quote",
    desc: "Instant transparent pricing on purchase, rental, or lease-to-own — no hidden fees",
    highlight: false,
  },
  {
    n: 3,
    title: "Confirm Your Order",
    desc: "Book with our experienced team — fast turnaround and clear communication guaranteed",
    highlight: false,
  },
  {
    n: 4,
    title: "We Deliver to You",
    desc: "Container delivered from the nearest of our 130+ depots right to your location",
    highlight: false,
  },
];

export function HowItWorks() {
  return (
    <section
      className="bg-theme-dark py-[72px] px-[5%]"
      aria-labelledby="hiw-title"
    >
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-[50px]">
          <p className="text-[11.5px] font-bold text-theme-primary uppercase tracking-[.1em] mb-2">
            Simple Process
          </p>
          <h2
            id="hiw-title"
            className="text-[32px] sm:text-[38px] font-black text-white leading-[1.05] mb-3 tracking-[-0.02em]"
          >
            How It Works
          </h2>
          <p className="text-[15px] text-white/50 leading-[1.65] max-w-[580px] mx-auto">
            Order a container in four simple steps — we manage every detail from
            selection to delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 relative">
          {/* Connector line — desktop only */}
          <div
            className="hidden lg:block absolute top-[27px] left-[calc(12.5%+14px)] right-[calc(12.5%+14px)] h-[2px] bg-white/[.09]"
            aria-hidden="true"
          />

          {STEPS.map((step) => (
            <div key={step.n} className="text-center px-3 relative z-[1]">
              <div
                className={`w-[54px] h-[54px] rounded-full mx-auto mb-4 text-[21px] font-black flex items-center justify-center border-2 transition-colors ${
                  step.highlight
                    ? "bg-theme-primary border-theme-primary text-white"
                    : "bg-[#333] border-[#555] text-[#777]"
                }`}
                aria-label={`Step ${step.n}`}
              >
                {step.n}
              </div>
              <h4 className="text-[16.5px] font-bold text-white mb-[7px]">
                {step.title}
              </h4>
              <p className="text-[13px] text-white/50 leading-[1.55]">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
