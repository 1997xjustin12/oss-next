import { ArrowRight } from 'lucide-react'
import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import { ROUTES } from '@/config/routes'
import { REEFER_BUY, REEFER_HELP, REEFER_LINKS, REEFER_OPTIONS } from '@/lib/data/reeferContent'
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
        {REEFER_OPTIONS.cta}
        <ArrowRight aria-hidden className="h-4 w-4" />
        <span className="sr-only">about {option.title.toLowerCase()}</span>
      </Link>
    </article>
  )
}

/** "Buy from us", the rental and rent-to-own cards, and the call-for-help line. */
export function ReeferOptions() {
  return (
    <>
      <section aria-labelledby="reefer-buy" className="bg-theme-subtle px-[5%] py-12 text-center sm:py-14 dark:bg-neutral-900">
        <h2 id="reefer-buy" className="text-2xl font-extrabold text-theme-primary sm:text-3xl dark:text-red-400">{REEFER_BUY.heading}</h2>
        <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-theme-mid sm:text-lg dark:text-neutral-300">{REEFER_BUY.body}</p>
        <Link href={REEFER_LINKS.pricing} className={`mt-6 ${BUTTON}`}>
          {REEFER_BUY.cta}
          <ArrowRight aria-hidden className="h-4 w-4" />
          <span className="sr-only">about buying a container</span>
        </Link>
      </section>

      <section aria-labelledby="reefer-options" className="bg-[#3d3434] px-[5%] py-12 sm:py-16 dark:bg-neutral-900">
        <h2 id="reefer-options" className="text-center text-2xl font-extrabold text-[#F4BF3C] sm:text-3xl">{REEFER_OPTIONS.heading}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <OptionCard option={REEFER_OPTIONS.rental} href={REEFER_LINKS.rental} />
          <OptionCard option={REEFER_OPTIONS.rentToOwn} href={ROUTES.RENT_TO_OWN} />
        </div>
      </section>

      <section aria-label="Need help choosing" className="bg-white px-[5%] py-10 text-center dark:bg-neutral-950">
        <h2 className="text-xl font-extrabold leading-snug text-theme-dark sm:text-2xl dark:text-white">
          {REEFER_HELP.before}{' '}
          <a href={telHref(CONTACT_NUMBER)} className="text-theme-primary underline underline-offset-4 hover:no-underline dark:text-red-400">
            {REEFER_HELP.link}
          </a>
        </h2>
      </section>
    </>
  )
}
