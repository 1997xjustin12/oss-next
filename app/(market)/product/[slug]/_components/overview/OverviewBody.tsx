import type { LucideIcon } from 'lucide-react'

/**
 * The layout every container overview shares.
 *
 * The three size components rendered identical JSX and differed only in their
 * heading, intro, use cases and features — so that is what this takes. Pulling
 * it out is what makes a per-combination component cheap: a variant that only
 * needs different words supplies different copy, and one that needs a different
 * shape stops using this and renders its own.
 */

export type OverviewFeature = {
  Icon: LucideIcon
  title: string
  desc: string
}

export type OverviewCopy = {
  heading: string
  /** One entry per paragraph — the 40ft overviews run to two. */
  intro: string[]
  useCases: string[]
  features: OverviewFeature[]
}

export function OverviewBody({ copy }: { copy: OverviewCopy }) {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 mb-10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3.5">
            {copy.heading}
          </h2>
          {copy.intro.map((paragraph, index) => (
            <p
              key={`intro-${index}`}
              className="text-sm sm:text-base text-theme-muted leading-relaxed not-last:mb-3.5"
            >
              {paragraph}
            </p>
          ))}
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-extrabold tracking-tight mb-3.5">
            Ideal For
          </h3>
          <div className="flex flex-wrap gap-2">
            {copy.useCases.map((useCase, index) => (
              <span
                key={`use-cases-${useCase}-${index}`}
                className="bg-theme-subtle border border-theme-border text-theme-accent px-3 py-1.5 rounded text-xs sm:text-sm font-semibold cursor-pointer hover:bg-theme-accent hover:text-white transition-colors"
              >
                {useCase}
              </span>
            ))}
          </div>
        </div>
      </div>

      <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-4">
        Key Features
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {copy.features.map((feature, index) => (
          <div
            key={`features-${feature.title}-${index}`}
            className="group flex gap-3.5 items-start p-4 sm:p-4.5 rounded-lg border border-theme-border bg-theme-subtle hover:border-theme-primary hover:-translate-y-0.5 transition-all"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-md bg-theme-primary-light flex items-center justify-center shrink-0 group-hover:bg-theme-primary transition-colors">
              <feature.Icon className="w-4.5 h-4.5 text-theme-primary group-hover:text-white transition-colors" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm sm:text-base mb-1">
                {feature.title}
              </h4>
              <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
                {feature.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
