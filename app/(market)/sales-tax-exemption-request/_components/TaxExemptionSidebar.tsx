import { Building2, Mail, Phone } from 'lucide-react'
import { SITE } from '@/config/site'
import { TAX_EXEMPTION_CLOSING, TAX_EXEMPTION_SELLER } from '@/lib/data/taxExemptionContent'
import { CONTACT_NUMBER, telHref } from '@/lib/helpers'

const CARD = 'rounded-xl border border-theme-border bg-white p-5 shadow-sm sm:p-6 dark:border-neutral-800 dark:bg-neutral-900'
const CONTACT_LINK =
  'inline-flex min-h-11 items-center gap-2 break-all text-[15px] font-semibold text-theme-primary hover:underline dark:text-red-400'

/**
 * What a visitor needs while filling in the form: the seller details their
 * certificate must carry, and who to ask. Above the form on phones, since the
 * certificate may need these before it can be uploaded; beside it from lg up.
 */
export function TaxExemptionSidebar() {
  const { heading, note, name, address } = TAX_EXEMPTION_SELLER

  return (
    <aside className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-28">
      <section aria-labelledby="tax-seller" className={`${CARD} border-t-4 border-t-theme-primary dark:border-t-theme-primary`}>
        <h2 id="tax-seller" className="flex items-center gap-2 text-lg font-extrabold text-theme-dark dark:text-white">
          <Building2 aria-hidden className="h-5 w-5 shrink-0 text-theme-primary dark:text-red-400" />
          {heading}
        </h2>
        <p className="mt-1 text-sm text-theme-mid dark:text-neutral-400">{note}</p>
        <address className="mt-3 text-[15px] not-italic leading-relaxed text-theme-dark dark:text-neutral-200">
          <strong className="font-bold">{name}</strong>
          {address.map((line) => (
            <span key={line} className="block">{line}</span>
          ))}
        </address>
      </section>

      <section aria-labelledby="tax-questions" className={CARD}>
        <h2 id="tax-questions" className="text-lg font-extrabold text-theme-dark dark:text-white">Have a Question?</h2>
        <p className="mt-1 text-[15px] leading-relaxed text-theme-mid dark:text-neutral-300">{TAX_EXEMPTION_CLOSING}</p>
        <div className="mt-2 flex flex-col">
          <a href={telHref(CONTACT_NUMBER)} className={CONTACT_LINK}>
            <Phone aria-hidden className="h-4 w-4 shrink-0" />
            {CONTACT_NUMBER}
          </a>
          <a href={`mailto:${SITE.email}`} className={CONTACT_LINK}>
            <Mail aria-hidden className="h-4 w-4 shrink-0" />
            {SITE.email}
          </a>
        </div>
      </section>
    </aside>
  )
}
