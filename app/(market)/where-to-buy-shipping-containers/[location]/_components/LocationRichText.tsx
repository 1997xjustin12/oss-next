import { Fragment, type ReactNode } from 'react'
import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import { CONTACT_NUMBER, telHref } from '@/lib/helpers'

type Props = {
  /** Template text, placeholders already filled except `{phone}`. */
  text: string
  /** The `[[…]]` run. Default: bold brand red. */
  accentClassName?: string
  /** `[label](/path)` links and the `{phone}` call link. */
  linkClassName?: string
  /** What `{phone}` shows and dials. Default: the sales line. */
  phone?: string
}

const ACCENT = 'font-bold text-theme-primary dark:text-red-400'
const LINK = 'font-bold text-theme-primary underline-offset-2 hover:underline dark:text-red-400'

// One token at a time: an accent run, a link, or the phone placeholder.
const TOKEN = /\[\[(.+?)\]\]|\[([^\]]+)\]\(([^)\s]+)\)|\{phone\}/g

function render(text: string, accentClassName: string, linkClassName: string, phone: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  for (const match of text.matchAll(TOKEN)) {
    const index = match.index ?? 0
    if (index > last) out.push(text.slice(last, index))
    const key = `${keyPrefix}${index}`
    if (match[1] !== undefined) {
      // An accent run may itself hold the phone ("[[Call {phone} for more savings!]]").
      out.push(
        <span key={key} className={accentClassName}>
          {render(match[1], accentClassName, linkClassName, phone, `${key}-`)}
        </span>,
      )
    } else if (match[2] !== undefined) {
      const href = match[3]
      out.push(
        href.startsWith('/') ? (
          <Link key={key} href={href} className={linkClassName}>
            {match[2]}
          </Link>
        ) : (
          <a key={key} href={href} className={linkClassName}>
            {match[2]}
          </a>
        ),
      )
    } else {
      out.push(
        <a key={key} href={telHref(phone)} className={`whitespace-nowrap ${linkClassName}`}>
          {phone}
        </a>,
      )
    }
    last = index + match[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

/**
 * The location template's text syntax, rendered: `[[…]]` is the accent run,
 * `[label](/path)` a link, `{phone}` a call link to the sales line.
 */
export function LocationRichText({ text, accentClassName = ACCENT, linkClassName = LINK, phone = CONTACT_NUMBER }: Props) {
  return <Fragment>{render(text, accentClassName, linkClassName, phone, 'r')}</Fragment>
}
