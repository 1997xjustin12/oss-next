import Image from 'next/image'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { GBP_CONTAINER } from './gbpStyles'
import type { GbpPage, GbpSharedContent, GbpTemplate } from '@/types/gbp'

type Props = {
  contact: GbpPage['contact']
  telHref: string
  content: GbpSharedContent['footer']
  logo: GbpSharedContent['header']['logo']
  options: GbpTemplate['footer']
}

/** The red footer: logo, tagline, and the listing's own phone, email, address and hours. */
export function GbpFooter({ contact, telHref, content, logo, options }: Props) {
  const item = 'flex items-center gap-2'
  return (
    <footer className="bg-[var(--gbp-brand,#C60C29)] py-8 text-white dark:bg-[#7a0718]">
      <div className={`${GBP_CONTAINER} flex flex-col items-center gap-4 text-center`}>
        <a href={content.logoHref} aria-label="On-Site Storage Solutions">
          <Image src={logo.src} alt="" width={logo.width} height={logo.height} sizes="180px" className="h-11 w-auto rounded-sm bg-white p-1" />
        </a>
        {content.tagline && <p className="text-base font-normal">{content.tagline}</p>}
        <address className="flex flex-col items-center gap-x-6 gap-y-2 text-base font-medium not-italic md:flex-row md:flex-wrap md:justify-center">
          <a href={telHref} className={`${item} hover:underline`}>
            <Phone aria-hidden className="h-4 w-4 fill-current" />
            {contact.phone}
          </a>
          {options.showEmail && (
            <a href={`mailto:${contact.email}`} className={`${item} hover:underline`}>
              <Mail aria-hidden className="h-4 w-4" />
              {contact.email}
            </a>
          )}
          {options.showAddress && (
            <span className={item}>
              <MapPin aria-hidden className="h-4 w-4" />
              {contact.addressLine}
            </span>
          )}
          {options.showHours && (
            <span className={item}>
              <Clock aria-hidden className="h-4 w-4" />
              Store Hours: {contact.hours}
            </span>
          )}
        </address>
      </div>
    </footer>
  )
}
