import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import { SectionTagline2 } from '@/components/shared/SectionTagline2'
import { ROUTES } from '@/config/routes'
import { REFURB_BUY, REFURB_HELP, REFURB_LINKS, REFURB_OPTIONS, REFURB_OTHER_CONDITIONS } from '@/lib/data/refurbishedContent'
import { CONTACT_NUMBER, telHref } from '@/lib/helpers'

const BUTTON =
  'inline-flex min-h-11 items-center gap-2 rounded-md bg-theme-primary px-6 text-sm font-bold text-white transition-colors hover:bg-theme-primary-dark ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary'

type Option = { title: string; before: string; phoneText: string; after: string }

/** One of the two option cards. The phone number is a link inside the sentence, as on WordPress. */
function OptionCard({ option, href }: { option: Option; href: string }) {
  return (
    <article className="flex flex-col rounded-xl border border-white/15 bg-white/5 p-6 sm:p-8">
      <h3 className="text-xl font-extrabold tracking-wide text-white">
        <Link href={href} className="hover:text-[#F4BF3C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
          {option.title}
        </Link>
      </h3>
      <p className="mt-3 flex-1 text-[15px] leading-relaxed text-white/90">
        {option.before}{' '}
        <a href={telHref(CONTACT_NUMBER)} className="font-semibold text-[#F4BF3C] underline underline-offset-2 hover:no-underline">
          {option.phoneText}
        </a>
        {option.after}
      </p>
      <Link href={href} className={`mt-6 self-start ${BUTTON}`}>
        {REFURB_OPTIONS.cta}
        <ArrowRight aria-hidden className="h-4 w-4" />
        <span className="sr-only">about {option.title.toLowerCase()}</span>
      </Link>
    </article>
  )
}

const BAND_LINK = 'hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'

/** Other conditions (used, new one trip), "buy from us", rental and rent-to-own, and the call-for-help line. */
export function RefurbOptions() {
  return (
    <>
      <SectionTagline2
        bg="blue"
        text={<Link href={ROUTES.CONTAINER_CONDITIONS} className={BAND_LINK}>{REFURB_OTHER_CONDITIONS.band}</Link>}
      />
      <section aria-label="Other conditions" className="bg-theme-subtle px-[5%] py-12 sm:py-16 dark:bg-neutral-900">
        <ul className="grid gap-6 md:grid-cols-2">
          {REFURB_OTHER_CONDITIONS.cards.map((card) => (
            <li key={card.title}>
              <article className="flex h-full flex-col overflow-hidden rounded-xl border border-theme-border bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                <div className="relative aspect-4/3 bg-theme-subtle dark:bg-neutral-800">
                  <Image src={card.image.src} alt={card.image.alt} fill sizes="(max-width: 768px) 90vw, 45vw" className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-extrabold tracking-wide text-theme-dark dark:text-white">
                    <Link href={card.href} className="hover:text-theme-primary dark:hover:text-red-400">
                      {card.title}
                    </Link>
                  </h3>
                  {card.paragraphs.map((text) => (
                    <p key={text.slice(0, 32)} className="mt-3 text-[15px] leading-relaxed text-theme-mid dark:text-neutral-300">{text}</p>
                  ))}
                  <Link href={card.href} className={`mt-6 self-start ${BUTTON}`}>
                    {REFURB_OTHER_CONDITIONS.cta}
                    <ArrowRight aria-hidden className="h-4 w-4" />
                    <span className="sr-only">about {card.title.toLowerCase()} containers</span>
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </section>

      <SectionTagline2 bg="blue" text={<Link href={REFURB_LINKS.buy} className={BAND_LINK}>{REFURB_BUY.band}</Link>} />
      <section aria-label="Buy from us" className="bg-white px-[5%] py-12 text-center sm:py-14 dark:bg-neutral-950">
        <p className="mx-auto max-w-3xl text-base leading-relaxed text-theme-mid sm:text-lg dark:text-neutral-300">{REFURB_BUY.body}</p>
        <Link href={REFURB_LINKS.buy} className={`mt-6 ${BUTTON}`}>
          {REFURB_BUY.cta}
          <ArrowRight aria-hidden className="h-4 w-4" />
          <span className="sr-only">about buying a container</span>
        </Link>
      </section>

      <section aria-labelledby="refurb-options" className="bg-[#3d3434] px-[5%] py-12 sm:py-16 dark:bg-neutral-900">
        <h2 id="refurb-options" className="text-center text-2xl font-extrabold text-[#F4BF3C] sm:text-3xl">{REFURB_OPTIONS.heading}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <OptionCard option={REFURB_OPTIONS.rental} href={REFURB_LINKS.rental} />
          <OptionCard option={REFURB_OPTIONS.rentToOwn} href={ROUTES.RENT_TO_OWN} />
        </div>
      </section>

      <section aria-label="Need help choosing" className="bg-white px-[5%] py-10 text-center dark:bg-neutral-950">
        <h2 className="text-xl font-extrabold leading-snug text-theme-dark sm:text-2xl dark:text-white">
          {REFURB_HELP.before}{' '}
          <a href={telHref(CONTACT_NUMBER)} className="text-theme-primary underline underline-offset-4 hover:no-underline dark:text-red-400">
            {REFURB_HELP.link}
          </a>
        </h2>
      </section>
    </>
  )
}
