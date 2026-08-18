import { HOW_IT_WORKS_STEPS } from "@/app/(market)/(home)/_components/howItWorksSteps";

// Mirrors HowItWorks' desktop grid — both render the same step titles, so both
// take the same indexed overrides.
export function HowItWorksMobile({
  stepTitles,
}: {
  stepTitles?: readonly (string | undefined)[];
}) {
  return (
    <div className="flex flex-col">
      {HOW_IT_WORKS_STEPS.map((step, index) => {
        const isLast = index === HOW_IT_WORKS_STEPS.length - 1;
        return (
          <div key={step.n} className="flex gap-5">
            <div className="flex flex-col items-center">
              <div
                className={`shrink-0 w-[54px] h-[54px] rounded-full text-[21px] font-black flex items-center justify-center border-2 transition-colors ${
                  step.highlight
                    ? "bg-theme-primary border-theme-primary text-white"
                    : "bg-[#333] border-[#555] text-white"
                }`}
                aria-label={`Step ${step.n}`}
              >
                {step.n}
              </div>
              {!isLast && (
                <div className="w-[2px] flex-1 my-2 bg-white/[.09]" aria-hidden="true" />
              )}
            </div>
            <div className={isLast ? "pt-3" : "pt-3 pb-10"}>
              <h3 className="text-[16.5px] font-bold text-white mb-[7px]">
                {stepTitles?.[index] ?? step.title}
              </h3>
              <p className="text-[13px] text-white/50 leading-[1.55]">
                {step.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
