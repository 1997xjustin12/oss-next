import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import { PackageSearch } from 'lucide-react'
import { ROUTES } from '@/config/routes'
import { SITE } from '@/config/site'

type Props = {
  kind: 'not_found' | 'error'
}

/**
 * `not_found` covers a malformed link and an unknown order alike, with one
 * message, so the page never confirms which uuids belong to real orders.
 */
const COPY: Record<Props['kind'], { title: string; body: string }> = {
  not_found: {
    title: 'We couldn’t find this order',
    body: 'Please open the full link from your order email. If it still doesn’t work, contact us and we’ll look it up for you.',
  },
  error: {
    title: 'We couldn’t load your order',
    body: 'Something went wrong on our side. Please try again in a few minutes.',
  },
}

export function OrderStatusNotice({ kind }: Props) {
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
