import { CONTACT_NUMBER, telHref } from '@/lib/helpers'

type Props = { label: string; className?: string }

/**
 * The page's call to action. Every one on the WordPress page — "Get Approved
 * in Minutes", "Start My Application", "See my monthly payment" — dials the
 * sales line, so these do too: applying goes through an agent, who sends the
 * Apply Online link with the quote (see the FAQ).
 *
 * The accessible name says where it goes, since the visible label does not.
 */
export function RtoCallButton({ label, className = '' }: Props) {
  return (
    <a
      href={telHref(CONTACT_NUMBER)}
      aria-label={`${label}: call ${CONTACT_NUMBER}`}
      className={`inline-flex min-h-11 items-center justify-center rounded-md bg-theme-primary px-7 py-2.5 text-base font-bold text-white
                  shadow-sm transition-colors hover:bg-theme-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2
                  focus-visible:outline-theme-primary ${className}`}
    >
      {label}
    </a>
  )
}
