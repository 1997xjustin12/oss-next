import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import { CONDITIONS_OPTIONS } from '@/lib/data/containerConditionsContent'
import { CONTACT_NUMBER, telHref } from '@/lib/helpers'

/** Buy, rent and rent-to-own, each a linked title over its copy. */
export function ConditionsOptions() {
  return (
    <section aria-label="Buy, rent or rent-to-own" className="bg-[#3d3434] px-[5%] py-12 sm:py-16 dark:bg-neutral-900">
      <ul className="grid gap-6 lg:grid-cols-3">
        {CONDITIONS_OPTIONS.map((option) => (
          <li key={option.title}>
            <article className="h-full rounded-xl border border-white/15 bg-white/5 p-6 sm:p-8">
              <h2 className="text-xl font-extrabold tracking-wide text-[#F4BF3C]">
                <Link href={option.href} className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                  {option.title}
                </Link>
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-white/90">
                {option.before}
                {option.phoneText && (
                  <>
                    {' '}
                    <a href={telHref(CONTACT_NUMBER)} className="font-semibold text-[#F4BF3C] underline underline-offset-2 hover:no-underline">
                      {option.phoneText}
                    </a>
                  </>
                )}
                {option.after}
              </p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}

