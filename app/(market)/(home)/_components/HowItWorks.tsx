import { HOW_IT_WORKS_STEPS } from "@/app/(market)/(home)/_components/howItWorksSteps";
import { HowItWorksMobile } from "@/app/(market)/(home)/_components/HowItWorksMobile";

export function HowItWorks() {
  return (
    <section
      className="bg-theme-dark py-18 px-[5%]"
      aria-labelledby="hiw-title"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12.5">
          <p className="text-[11.5px] font-bold text-theme-primary uppercase tracking-widest mb-2">
            Simple Process
          </p>
          <h2
            id="hiw-title"
            className="text-[32px] sm:text-[38px] font-black text-white leading-[1.05] mb-3 tracking-[-0.02em]"
          >
            How It Works
          </h2>
          <p className="text-[15px] text-white/50 leading-[1.65] max-w-145 mx-auto">
            Order a container in four simple steps — we manage every detail from
            selection to delivery.
          </p>
        </div>

        <div className="lg:hidden">
          <HowItWorksMobile />
        </div>

        <div className="hidden lg:grid lg:grid-cols-4 gap-0 relative">
          {/* Connector line — desktop only */}
          <div
            className="absolute top-6.75 left-[calc(12.5%+14px)] right-[calc(12.5%+14px)] h-0.5 bg-white/9"
            aria-hidden="true"
          />

          {HOW_IT_WORKS_STEPS.map((step) => (
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
