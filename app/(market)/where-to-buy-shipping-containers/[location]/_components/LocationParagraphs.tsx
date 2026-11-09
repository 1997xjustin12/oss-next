import { LocationRichText } from './LocationRichText'

type Props = {
  /** Template text; paragraphs are separated by a blank line. */
  text: string
  phone: string
  className?: string
}

/** A body of template text as paragraphs, each with the template's accents, links and phone. */
export function LocationParagraphs({ text, phone, className = 'text-base leading-relaxed text-theme-mid sm:text-lg dark:text-neutral-300' }: Props) {
  const paragraphs = text.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean)
  return (
    <div className="space-y-4">
      {paragraphs.map((paragraph) => (
        <p key={paragraph.slice(0, 48)} className={className}>
          <LocationRichText text={paragraph} phone={phone} />
        </p>
      ))}
    </div>
  )
}
