import { TemplateRichText } from '@/components/shared/TemplateRichText'

type Props = {
  /** Template text; paragraphs are separated by a blank line. */
  text: string
  className?: string
}

const LINK = 'font-semibold text-theme-primary underline underline-offset-2 hover:no-underline dark:text-red-400'

/** A block of template text as paragraphs, links underlined (they sit inside sentences). */
export function CityParagraphs({ text, className = 'text-base leading-relaxed text-theme-dark dark:text-neutral-200' }: Props) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
  return (
    <div className="space-y-4">
      {paragraphs.map((paragraph, i) => (
        <p key={i} className={className}>
          <TemplateRichText text={paragraph} linkClassName={LINK} />
        </p>
      ))}
    </div>
  )
}
