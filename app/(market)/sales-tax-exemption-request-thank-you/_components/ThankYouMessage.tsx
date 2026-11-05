import Link from 'next/link'
import { ArrowRight, Mail } from 'lucide-react'
import { ROUTES } from '@/config/routes'
import { SITE } from '@/config/site'
import { TAX_EXEMPTION_THANK_YOU } from '@/lib/data/taxExemptionContent'

/** The page's two messages, as WordPress worded them, and where to go next. */
export function ThankYouMessage() {
  const { message, closing, primaryCta, secondaryCta } = TAX_EXEMPTION_THANK_YOU

  return (
    <article className="min-w-0 rounded-xl border border-theme-border border-t-4 border-t-theme-primary bg-white p-5 shadow-sm sm:p-8 dark:border-neutral-800 dark:border-t-theme-primary dark:bg-neutral-900">
      <p className="text-base leading-relaxed text-theme-dark sm:text-lg dark:text-neutral-200">
        {message}{' '}
        <a
          href={`mailto:${SITE.email}`}
          className="inline-flex items-center gap-1.5 font-semibold break-all text-theme-primary underline underline-offset-2 hover:no-underline dark:text-red-400"
        >
          <Mail aria-hidden className="h-4 w-4 shrink-0" />
          {SITE.email}
        </a>
      </p>

      <p className="mt-5 border-t border-theme-border pt-5 text-base leading-relaxed font-semibold text-theme-dark dark:border-neutral-800 dark:text-white">
        {closing}
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href={ROUTES.PLP}
          prefetch={false}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-theme-primary px-7 text-base font-bold text-white shadow-sm transition-colors
                     hover:bg-theme-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary"
        >
          {primaryCta}
          <ArrowRight aria-hidden className="h-5 w-5" />
        </Link>
        <Link
          href={ROUTES.HOME}
          prefetch={false}
          className="inline-flex min-h-12 items-center justify-center rounded-md border border-neutral-400 px-7 text-base font-bold text-theme-dark transition-colors
                     hover:border-theme-primary hover:text-theme-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary
                     dark:border-neutral-600 dark:text-white dark:hover:border-red-400 dark:hover:text-red-400"
        >
          {secondaryCta}
        </Link>
      </div>
    </article>
  )
}
