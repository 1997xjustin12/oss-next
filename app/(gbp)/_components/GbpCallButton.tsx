import { Phone } from 'lucide-react'

type Props = {
  phone: string
  telHref: string
  /** Text before the number, e.g. "Call Us For Assistance" (on its own line). */
  label?: string
  /** Show the phone icon, as the header and hero buttons do. */
  icon?: boolean
  className?: string
}

/**
 * The red call button every section repeats. Dials the page's own number,
 * which is the point of these pages: each GBP listing has its own line.
 */
export function GbpCallButton({ phone, telHref, label, icon = false, className = '' }: Props) {
  return (
    <a
      href={telHref}
      aria-label={label ? `${label} ${phone}` : `Call ${phone}`}
      className={`inline-flex items-center justify-center gap-2 rounded-sm bg-gbp px-6 py-3 text-center font-semibold leading-tight text-white
                  transition-colors hover:bg-[#a30a22] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gbp
                  dark:focus-visible:outline-white ${className}`}
    >
      {icon && <Phone aria-hidden className="h-4 w-4 shrink-0 fill-current" />}
      {label ? (
        <span>
          {label}
          <br />
          {phone}
        </span>
      ) : (
        phone
      )}
    </a>
  )
}
