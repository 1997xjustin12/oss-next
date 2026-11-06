import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import { CONTAINER_TYPES_OPTIONS } from '@/lib/data/containerTypesContent'
import { CONTACT_NUMBER, telHref } from '@/lib/helpers'

/**
 * Buy, rental and rent-to-own, each over its WordPress photo. As on WordPress,
 * a card's title links to its page and the phone number in it dials the sales line.
 */
export function TypesOptions() {
  return (
    <section aria-label="Buy, rent or rent-to-own" className="bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
      <ul className="grid gap-6 lg:grid-cols-3">
        {CONTAINER_TYPES_OPTIONS.map((option) => (
          <li key={option.title}>
            <article className="relative isolate flex h-full flex-col overflow-hidden rounded-xl bg-neutral-900 p-6 sm:p-8">
              <Image src={option.image} alt="" fill sizes="(max-width: 1024px) 90vw, 30vw" className="-z-20 object-cover" />
              <div aria-hidden className="absolute inset-0 -z-10 bg-black/70" />
              <h2 className="text-2xl font-extrabold text-white">
                <Link href={option.href} className="hover:text-[#F4BF3C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                  {option.title}
                </Link>
              </h2>
              <p className="mt-3 flex-1 text-[15px] leading-relaxed text-white/90">
                {option.before}
                {'phoneText' in option && (
                  <>
                    {' '}
                    <a href={telHref(CONTACT_NUMBER)} className="font-semibold text-[#F4BF3C] underline underline-offset-2 hover:no-underline">
                      {option.phoneText}
                    </a>
                    {option.after}
                  </>
                )}
              </p>
              <Link
                href={option.href}
                className="mt-6 inline-flex min-h-11 items-center gap-2 self-start rounded-md bg-theme-primary px-6 text-sm font-bold text-white transition-colors
                           hover:bg-theme-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                LEARN MORE
                <ArrowRight aria-hidden className="h-4 w-4" />
                <span className="sr-only">about {option.title.toLowerCase()}</span>
              </Link>
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}
