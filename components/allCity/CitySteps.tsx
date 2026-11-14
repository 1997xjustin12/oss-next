import { TemplateRichText } from '@/components/shared/TemplateRichText'

type Props = {
  heading: string
  /** Each step's text is template text: step 1 links to the ZIP box (`#find-prices`). */
  steps: readonly { title: string; text: string }[]
}

const LINK = 'text-theme-primary underline underline-offset-2 hover:no-underline dark:text-red-400'

/** "BUY A SHIPPING CONTAINER IN <CITY>": the red box with WordPress's three steps. */
export function CitySteps({ heading, steps }: Props) {
  return (
    <section aria-labelledby="city-steps" className="bg-white px-[5%] py-10 dark:bg-neutral-950">
      <div className="rounded-sm bg-theme-primary px-5 py-8 sm:px-8">
        <h2 id="city-steps" className="text-center text-2xl font-extrabold text-white sm:text-3xl">
          {heading}
        </h2>
        <ol className="mt-6 grid gap-5 md:grid-cols-3">
          {steps.map((step, i) => (
            <li key={i} className="bg-white px-5 py-6 text-center dark:bg-neutral-950">
              <h3 className="text-xl font-semibold text-theme-primary dark:text-red-400">{step.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-theme-dark sm:text-base dark:text-neutral-200">
                <TemplateRichText text={step.text} linkClassName={LINK} />
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
