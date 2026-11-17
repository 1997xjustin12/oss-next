import { TemplateRichText } from '@/components/shared/TemplateRichText'

type Props = { text: string }

/** The depot-city variant's closing band ("GET $50 OFF YOUR CONTAINER TODAY. CALL US! {phone}"). */
export function CityOfferBand({ text }: Props) {
  return (
    <section aria-labelledby="city-offer" className="bg-[#0f3a59] px-[5%] py-6">
      <h2 id="city-offer" className="text-center text-xl font-extrabold text-white sm:text-2xl">
        <TemplateRichText text={text} accentClassName="text-yellow-300" linkClassName="underline underline-offset-4 hover:no-underline" />
      </h2>
    </section>
  )
}
