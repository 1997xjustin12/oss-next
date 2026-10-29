import Image from 'next/image'
import Link from 'next/link'
import { GbpCallButton } from './GbpCallButton'
import { GBP_CONTAINER } from './gbpStyles'
import type { GbpSharedContent, GbpTemplate } from '@/types/gbp'

type Props = {
  phone: string
  telHref: string
  content: GbpSharedContent['header']
  options: GbpTemplate['header']
}

/**
 * The GBP header: the red financing bar, then logo, in-page nav and the call
 * button. On phones it is the logo alone, as on WordPress: the bar above
 * already carries the number, and every section below has a call button.
 */
export function GbpHeader({ phone, telHref, content, options }: Props) {
  const [before, after = ''] = content.announcement.split('{phone}')
  const hasPhone = content.announcement.includes('{phone}')
  return (
    <header>
      <p className="bg-[var(--gbp-brand,#C60C29)] px-4 py-1.5 text-center text-xs font-semibold leading-normal text-white md:text-base">
        {before}
        {hasPhone && (
          <a href={telHref} className="whitespace-nowrap underline-offset-2 hover:underline">
            {phone}
          </a>
        )}
        {after}
      </p>

      <div
        className="border-b border-neutral-200 bg-[var(--gbp-header-bg)] dark:border-neutral-800 dark:bg-[var(--gbp-header-bg-dark)]"
        style={{ '--gbp-header-bg': options.background, '--gbp-header-bg-dark': options.backgroundDark } as React.CSSProperties}
      >
        <div className={`${GBP_CONTAINER} flex items-center justify-center gap-6 py-3 md:justify-between`}>
          {/* No prefetch: prefetching the storefront pulls in its fonts (Roboto,
              Anton) on a page that uses only Poppins. The homepage is static, so
              the click is still fast. */}
          <Link href="/" prefetch={false} aria-label="On-Site Storage Solutions home" className="shrink-0">
            <Image
              src={content.logo.src}
              alt={content.logo.alt}
              width={content.logo.width}
              height={content.logo.height}
              sizes="180px"
              className="h-11 w-auto rounded-sm md:h-8 xl:h-11 dark:bg-white dark:p-0.5"
            />
          </Link>

          {/* As on WordPress: an item never breaks inside ("About Us" stays one
              line); when the row runs out of room, whole items wrap to a second
              centred line. */}
          <nav aria-label="On this page" className="hidden min-w-0 flex-1 md:block">
            <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-0 text-base font-semibold text-black xl:gap-x-8 dark:text-neutral-100">
              {content.nav.map((item) => (
                <li key={item.label} className="whitespace-nowrap">
                  {item.href.startsWith('/') ? (
                    <Link href={item.href} prefetch={false} className="hover:text-[var(--gbp-brand,#C60C29)] dark:hover:text-red-400">
                      {item.label}
                    </Link>
                  ) : (
                    <a href={item.href} className="hover:text-[var(--gbp-brand,#C60C29)] dark:hover:text-red-400">
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* A wrapper hides it: on the button itself, `hidden` loses to its own `inline-flex`. */}
          {options.showCallButton && (
            <div className="hidden md:block">
              <GbpCallButton phone={phone} telHref={telHref} icon className="text-base" />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
