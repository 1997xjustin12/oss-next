import { CONDITIONS_HELP } from '@/lib/data/containerConditionsContent'
import { CONTACT_NUMBER, telHref } from '@/lib/helpers'
/** The red "give us a call" band. */
export function ConditionsHelp() {
  return (
    <section aria-label="Need help choosing" className="bg-theme-primary px-[5%] py-10 text-center">
      <h2 className="text-xl font-extrabold leading-snug text-white sm:text-2xl">
        {CONDITIONS_HELP.before}{' '}
        <a href={telHref(CONTACT_NUMBER)} className="underline underline-offset-4 hover:no-underline">
          {CONDITIONS_HELP.link}
        </a>
        {CONDITIONS_HELP.after}
      </h2>
    </section>
  )
}
