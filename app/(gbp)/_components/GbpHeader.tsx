import Image from 'next/image'
import Link from 'next/link'
import { GBP_HEADER } from '@/lib/data/gbpShared'
import { GbpCallButton } from './GbpCallButton'
import { GBP_CONTAINER } from './gbpStyles'

type Props = { phone: string; telHref: string }

/**
 * The GBP header: the red financing bar, then logo, in-page nav and the call
 * button. On phones it is the logo alone, as on WordPress: the bar above
 * already carries the number, and every section below has a call button.
 */
export function GbpHeader({ phone, telHref }: Props) {
  const [before] = GBP_HEADER.announcement.split('{phone}')
  return (
    <header>
      <p className="bg-gbp px-4 py-1.5 text-center text-[13px] font-semibold text-white sm:text-sm">
        {before}
        <a href={telHref} className="whitespace-nowrap underline-offset-2 hover:underline">
          {phone}
        </a>
      </p>

      <div className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        <div className={`${GBP_CONTAINER} flex items-center justify-center py-3 md:justify-between`}>
          <Link href="/" aria-label="On-Site Storage Solutions home" className="shrink-0">
            <Image
              src={GBP_HEADER.logo.src}
              alt={GBP_HEADER.logo.alt}
              width={GBP_HEADER.logo.width}
              height={GBP_HEADER.logo.height}
              sizes="180px"
              className="h-11 w-auto rounded-sm dark:bg-white dark:p-0.5"
            />
          </Link>

          <nav aria-label="On this page" className="hidden md:block">
            <ul className="flex items-center gap-6 text-sm font-medium text-black dark:text-neutral-100">
              {GBP_HEADER.nav.map((item) => (
                <li key={item.label}>
                  {item.href === '/' ? (
                    <Link href="/" className="hover:text-gbp dark:hover:text-red-400">
                      {item.label}
                    </Link>
                  ) : (
                    <a href={item.href} className="hover:text-gbp dark:hover:text-red-400">
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* A wrapper hides it: on the button itself, `hidden` loses to its own `inline-flex`. */}
          <div className="hidden md:block">
            <GbpCallButton phone={phone} telHref={telHref} icon className="text-lg" />
          </div>
        </div>
      </div>
    </header>
  )
}
