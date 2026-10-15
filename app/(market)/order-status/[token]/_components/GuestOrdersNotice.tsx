import Link from 'next/link'
import { PackageSearch } from 'lucide-react'
import { ROUTES } from '@/config/routes'
import { SITE } from '@/config/site'

type Props = {
  kind: 'invalid' | 'error' | 'empty'
}

/**
 * `invalid` deliberately covers malformed, unknown, expired and revoked links
 * with one message, so the page never confirms that a token was once real.
 */
const COPY: Record<Props['kind'], { title: string; body: string }> = {
  invalid: {
    title: 'This link is no longer valid',
    body: 'Order links expire after a while. Use the most recent link we emailed you, or contact us and we will send a new one.',
  },
  error: {
    title: 'We could not load your orders',
    body: 'Something went wrong on our side. Please try again in a few minutes.',
  },
  empty: {
    title: 'No orders yet',
    body: 'There are no orders on this link yet.',
  },
}

export function GuestOrdersNotice({ kind }: Props) {
  const { title, body } = COPY[kind]

  return (
    <section
      aria-live="polite"
      className="flex flex-col items-center gap-3 rounded-md border border-theme-border bg-theme-subtle px-6 py-12 text-center
                 dark:border-gray-700 dark:bg-gray-800"
    >
      <PackageSearch className="h-8 w-8 text-theme-muted dark:text-gray-500" aria-hidden="true" />
      <h2 className="text-base font-bold text-theme-dark dark:text-white">{title}</h2>
      <p className="max-w-md text-sm text-theme-muted dark:text-gray-400">{body}</p>
      <p className="text-sm text-theme-muted dark:text-gray-400">
        Questions? Call{' '}
        <a href={`tel:${SITE.telephone}`} className="font-semibold text-theme-primary hover:underline dark:text-red-400">
          {SITE.telephoneDisplay}
        </a>
      </p>
      <Link
        href={ROUTES.HOME}
        className="mt-2 rounded-md bg-theme-primary hover:bg-theme-primary-dark text-white font-semibold px-5 py-2.5 text-sm transition-colors"
      >
        Back to the store
      </Link>
    </section>
  )
}
