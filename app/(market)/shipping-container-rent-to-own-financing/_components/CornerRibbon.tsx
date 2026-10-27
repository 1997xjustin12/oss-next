type Props = { text: string }

/**
 * The yellow diagonal band across a section's top-left corner ("Starts at
 * 61.36/month", "limited time offer"), as on the WordPress page.
 *
 * Real text, not an image, so a screen reader reads it where it sits. The
 * section around it must be `relative overflow-hidden`, which clips the band's
 * ends to the corner.
 */
export function CornerRibbon({ text }: Props) {
  return (
    <p
      className="pointer-events-none absolute -left-18 top-9 z-10 w-72 rotate-[-25deg] bg-[#FBEE45] py-1.5 pl-6 text-center
                 text-sm font-extrabold text-theme-dark shadow-md sm:-left-19 sm:top-11 sm:w-80 sm:text-base"
    >
      {text}
    </p>
  )
}
