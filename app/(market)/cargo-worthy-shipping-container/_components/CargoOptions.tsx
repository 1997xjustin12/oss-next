import { ArrowRight } from 'lucide-react'
import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import { CARGO_BUY, CARGO_HELP, CARGO_LINKS, CARGO_OPTIONS, type CargoOption } from '@/lib/data/cargoWorthyContent'
import { CONTACT_NUMBER, telHref } from '@/lib/helpers'

const BUTTON =
  'inline-flex min-h-11 items-center gap-2 rounded-md bg-theme-primary px-6 text-sm font-bold text-white transition-colors hover:bg-theme-primary-dark ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary'

/** One of the two option cards. The phone number is a link inside the sentence, as on WordPress. */
function OptionCard({ option }: { option: CargoOption }) {
  return (
    <article className="flex flex-col rounded-xl border border-white/15 bg-white/5 p-6 sm:p-8">
      <h3 className="text-xl font-extrabold tracking-wide text-white">
        <Link href={option.href} className="hover:text-[#F4BF3C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
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
      <Link href={option.href} className={`mt-6 self-start ${BUTTON}`}>
        {CARGO_OPTIONS.cta}
        <ArrowRight aria-hidden className="h-4 w-4" />
        <span className="sr-only">about {option.title.toLowerCase()}</span>
      </Link>
    </article>
  )
}

/** "Buy from us", the rental and rent-to-own cards, and the call-for-help band. */
export function CargoOptions() {
  return (
    <>
      <section aria-labelledby="cargo-buy" className="bg-[#0F3A59] px-[5%] py-12 text-center text-white sm:py-14">
        <h2 id="cargo-buy" className="text-2xl font-extrabold sm:text-3xl">
          <Link href={CARGO_LINKS.forSale} className="hover:text-[#F4BF3C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            {CARGO_BUY.heading}
          </Link>
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-white/90 sm:text-lg">{CARGO_BUY.body}</p>
        <Link href={CARGO_LINKS.forSale} className={`mt-6 ${BUTTON}`}>
          {CARGO_BUY.cta}
          <ArrowRight aria-hidden className="h-4 w-4" />
          <span className="sr-only">about buying a container</span>
        </Link>
      </section>

      <section aria-labelledby="cargo-options" className="bg-[#3d3434] px-[5%] py-12 sm:py-16 dark:bg-neutral-900">
        <h2 id="cargo-options" className="text-center text-2xl font-extrabold text-[#F4BF3C] sm:text-3xl">{CARGO_OPTIONS.heading}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {CARGO_OPTIONS.items.map((option) => (
            <OptionCard key={option.title} option={option} />
          ))}
        </div>
      </section>

      <section aria-label="Need help choosing" className="bg-theme-primary px-[5%] py-10 text-center">
        <h2 className="text-xl font-extrabold leading-snug text-white sm:text-2xl">
          {CARGO_HELP.before}{' '}
          <a href={telHref(CONTACT_NUMBER)} className="underline underline-offset-4 hover:no-underline">
            {CARGO_HELP.link}
          </a>
        </h2>
      </section>
    </>
  )
}
