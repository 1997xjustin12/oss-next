import type { ReactNode } from 'react'

/** The two brand fills this band is offered in. */
export type SectionTaglineBg = 'red' | 'blue'

type Props = {
  /** What the heading says. */
  text: ReactNode
  /** Brand fill. Anything but `'blue'` is red, which is also the default. */
  bg?: SectionTaglineBg
}

/**
 * A full-width band carrying one heading.
 *
 * Red is the theme token `--color-theme-primary`, so it follows a brand change
 * on its own. Blue is a literal: #0F3A59 is the supplied colour and is not
 * `--color-theme-accent` (#003087), the navy already in the palette. It is the
 * same blue the hero's h2 uses, so it now appears twice in this route — worth
 * promoting to a token if a third use turns up.
 *
 * Kept as a lookup rather than a ternary in the class string: a template
 * literal that interpolates a variant name produces a class Tailwind never
 * sees at build time, and the band would come out unstyled.
 */
const BACKGROUNDS: Record<SectionTaglineBg, string> = {
  red: 'bg-theme-primary',
  blue: 'bg-[#0F3A59]',
}

/**
 * Not a Client Component: it renders text and has no interaction, so there is
 * nothing here worth shipping JavaScript for.
 *
 * Co-located with this route because it has one consumer. The project's rule
 * is that `components/` is for what two or more routes share — move it there
 * the moment a second page wants it, which the props now make a move rather
 * than a rewrite.
 */
export function SectionTagline2({ text, bg = 'red' }: Props) {
  return (
    <section className={`w-full p-5 ${BACKGROUNDS[bg] ?? BACKGROUNDS.red}`}>
      <div className="container mx-auto flex w-full justify-center">
        <h2 className="text-center text-[32px] font-bold uppercase text-white">{text}</h2>
      </div>
    </section>
  )
}
