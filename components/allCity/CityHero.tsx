import Image from 'next/image'
import { PillLink } from '@/components/shared/PillLink'
import { TemplateRichText } from '@/components/shared/TemplateRichText'

type Props = {
  city: string
  body: string
  depotButton: { label: string; href: string }
  otherButton: { label: string; href: string }
  background: string
  pinIcon: string
  /**
   * The depot-city variant's h1 is the city's name here (WordPress's, hidden on
   * desktop there); the city variant's h1 comes further down, so here it is text.
   */
  cityIsHeading: boolean
}

/**
 * The top band: the depot sentence and its two buttons on navy, the port photo
 * on the right with the city's name under a pin. The photo is the LCP element,
 * so it is preloaded; on a phone it sits under a navy wash so the text keeps
 * its contrast.
 */
export function CityHero({ city, body, depotButton, otherButton, background, pinIcon, cityIsHeading }: Props) {
  const CityName = cityIsHeading ? 'h1' : 'p'

  return (
    <section className="relative isolate overflow-hidden bg-[#0f3a59] px-[5%] py-10 sm:py-12 lg:py-16">
      <Image src={background} alt="" fill preload fetchPriority="high" sizes="100vw" className="-z-20 object-cover object-right" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[#0f3a59]/85 lg:bg-transparent" />

      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-base leading-relaxed text-white sm:text-lg">
            <TemplateRichText text={body} accentClassName="font-bold" linkClassName="font-semibold underline underline-offset-2" />
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <PillLink href={depotButton.href}>{depotButton.label}</PillLink>
            <PillLink href={otherButton.href}>{otherButton.label}</PillLink>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end">
          <Image src={pinIcon} alt="" width={28} height={40} unoptimized className="h-10 w-7" />
          <CityName className="text-3xl font-extrabold uppercase tracking-wide text-white text-shadow-lg sm:text-4xl">{city}</CityName>
        </div>
      </div>
    </section>
  )
}
